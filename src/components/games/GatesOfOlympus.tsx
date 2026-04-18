import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RotateCcw } from "lucide-react";

// ── Símbolos ─────────────────────────────────────────────────────────────────

const SYMBOLS = [
  { id: "zeus",     emoji: "⚡", value: 500, label: "Zeus",      isScatter: false, isWild: true  },
  { id: "scatter",  emoji: "🌀", value: 0,   label: "Scatter",   isScatter: true,  isWild: false },
  { id: "chalice",  emoji: "🏺", value: 200, label: "Cálice",    isScatter: false, isWild: false },
  { id: "ring",     emoji: "💍", value: 150, label: "Anel",      isScatter: false, isWild: false },
  { id: "hourglass",emoji: "⌛", value: 100, label: "Ampulheta", isScatter: false, isWild: false },
  { id: "crown",    emoji: "👑", value: 80,  label: "Coroa",     isScatter: false, isWild: false },
  { id: "gem_blue", emoji: "💙", value: 50,  label: "Gema Azul", isScatter: false, isWild: false },
  { id: "gem_red",  emoji: "❤️", value: 40,  label: "Gema Vermelha", isScatter: false, isWild: false },
  { id: "gem_green",emoji: "💚", value: 30,  label: "Gema Verde",isScatter: false, isWild: false },
];

const ROWS = 6;
const COLS = 5;
const MIN_CLUSTER = 8; // Mínimo de símbolos iguais para ganhar (cluster pays)
const FREE_SPINS_TRIGGER = 4; // 4+ scatters

function weightedRandom(): typeof SYMBOLS[0] {
  const weights = [0.5, 0.8, 1, 1.5, 2, 3, 5, 5, 5];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= weights[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

function generateGrid(): typeof SYMBOLS[0][][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => weightedRandom())
  );
}

// Encontrar clusters (grupos de símbolos iguais conectados)
function findClusters(grid: typeof SYMBOLS[0][][]): Map<string, [number, number][]> {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const clusters = new Map<string, [number, number][]>();

  const dfs = (r: number, c: number, symId: string, group: [number, number][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (visited[r][c]) return;
    if (grid[r][c].id !== symId && grid[r][c].id !== "zeus") return;
    visited[r][c] = true;
    group.push([r, c]);
    dfs(r + 1, c, symId, group);
    dfs(r - 1, c, symId, group);
    dfs(r, c + 1, symId, group);
    dfs(r, c - 1, symId, group);
  };

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!visited[r][c] && !grid[r][c].isScatter && grid[r][c].id !== "zeus") {
        const group: [number, number][] = [];
        dfs(r, c, grid[r][c].id, group);
        if (group.length >= MIN_CLUSTER) {
          const key = `${grid[r][c].id}-${r}-${c}`;
          clusters.set(key, group);
        }
      }
    }
  }

  return clusters;
}

function calcClusterWin(
  symbol: typeof SYMBOLS[0],
  count: number,
  bet: number,
  multiplier: number
): number {
  const baseMultiplier = count >= 15 ? 100 : count >= 12 ? 50 : count >= 10 ? 25 : count >= 8 ? 10 : 5;
  return Math.round(bet * symbol.value * baseMultiplier * multiplier / 1000);
}

// ── Componente ───────────────────────────────────────────────────────────────

interface GatesOfOlympusProps {
  onGameEnd: (score: number) => void;
  initialBalance?: number;
}

export function GatesOfOlympus({ onGameEnd, initialBalance = 1000 }: GatesOfOlympusProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState(generateGrid);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [winCells, setWinCells] = useState<Set<string>>(new Set());
  const [multipliers, setMultipliers] = useState<{ value: number; x: number; y: number; id: number }[]>([]);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [isFreeSpins, setIsFreeSpins] = useState(false);
  const [globalMultiplier, setGlobalMultiplier] = useState(1);
  const [totalWon, setTotalWon] = useState(0);
  const [spins, setSpins] = useState(0);
  const [showFreeSpinsIntro, setShowFreeSpinsIntro] = useState(false);
  const [tumbleCount, setTumbleCount] = useState(0);
  const multIdRef = { current: 0 };

  const BET_OPTIONS = [5, 10, 25, 50, 100];

  // Tumble: remove células vencedoras e faz novas cair
  const doTumble = useCallback(async (
    currentGrid: typeof SYMBOLS[0][][],
    currentBet: number,
    currentMult: number,
    tumbles: number
  ): Promise<{ totalWin: number; finalGrid: typeof SYMBOLS[0][][] }> => {
    const clusters = findClusters(currentGrid);
    if (clusters.size === 0) return { totalWin: 0, finalGrid: currentGrid };

    let roundWin = 0;
    const toRemove = new Set<string>();
    const newWinCells = new Set<string>();

    clusters.forEach((cells, key) => {
      const symId = key.split("-")[0];
      const sym = SYMBOLS.find(s => s.id === symId)!;
      const win = calcClusterWin(sym, cells.length, currentBet, currentMult);
      roundWin += win;
      cells.forEach(([r, c]) => {
        toRemove.add(`${r}-${c}`);
        newWinCells.add(`${r}-${c}`);
      });
    });

    setWinCells(newWinCells);
    setWinAmount(w => (w ?? 0) + roundWin);
    setBalance(b => b + roundWin);
    setTotalWon(t => t + roundWin);

    // Mostrar multiplicadores caindo (Zeus)
    const zeusPositions: { value: number; x: number; y: number; id: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentGrid[r][c].id === "zeus") {
          const multValue = [2, 3, 5, 8, 10][Math.floor(Math.random() * 5)];
          zeusPositions.push({ value: multValue, x: c * 20 + 10, y: r * 16 + 8, id: ++multIdRef.current });
        }
      }
    }

    if (zeusPositions.length > 0) {
      setMultipliers(zeusPositions);
      const newMult = zeusPositions.reduce((acc, m) => acc + m.value, currentMult);
      setGlobalMultiplier(newMult);
      await new Promise(r => setTimeout(r, 800));
      setMultipliers([]);
    }

    await new Promise(r => setTimeout(r, 400));

    // Remover células e fazer novas cair
    const newGrid = currentGrid.map((row, ri) =>
      row.map((cell, ci) => {
        if (toRemove.has(`${ri}-${ci}`)) return null;
        return cell;
      })
    ) as (typeof SYMBOLS[0] | null)[][];

    // Compactar colunas (células caem para baixo)
    const compacted = Array.from({ length: COLS }, (_, c) => {
      const col = newGrid.map(row => row[c]).filter(Boolean) as typeof SYMBOLS[0][];
      while (col.length < ROWS) col.unshift(weightedRandom());
      return col;
    });

    const finalGrid = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => compacted[c][r])
    );

    setGrid(finalGrid);
    setWinCells(new Set());
    await new Promise(r => setTimeout(r, 300));

    // Recursão: novo tumble
    const { totalWin: nextWin, finalGrid: nextGrid } = await doTumble(
      finalGrid, currentBet, currentMult + zeusPositions.reduce((a, m) => a + m.value, 0), tumbles + 1
    );

    return { totalWin: roundWin + nextWin, finalGrid: nextGrid };
  }, []);

  const spin = useCallback(async (freeSpin = false) => {
    if (spinning) return;
    if (!freeSpin && balance < bet) return;

    setSpinning(true);
    setWinAmount(null);
    setWinCells(new Set());
    setTumbleCount(0);

    if (!freeSpin) setBalance(b => b - bet);
    setSpins(s => s + 1);

    // Animação de giro
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 80));
      setGrid(generateGrid());
    }

    const finalGrid = generateGrid();
    setGrid(finalGrid);
    await new Promise(r => setTimeout(r, 200));

    // Verificar scatters
    const scatterCount = finalGrid.flat().filter(s => s.isScatter).length;

    // Tumble
    const mult = isFreeSpins ? globalMultiplier : 1;
    await doTumble(finalGrid, bet, mult, 0);

    // Free spins trigger
    if (!isFreeSpins && scatterCount >= FREE_SPINS_TRIGGER) {
      await new Promise(r => setTimeout(r, 500));
      setShowFreeSpinsIntro(true);
      await new Promise(r => setTimeout(r, 2500));
      setShowFreeSpinsIntro(false);
      setIsFreeSpins(true);
      setFreeSpinsLeft(15);
      setGlobalMultiplier(1);
    }

    if (isFreeSpins) {
      setFreeSpinsLeft(f => {
        const next = f - 1;
        if (next <= 0) {
          setIsFreeSpins(false);
          setGlobalMultiplier(1);
        }
        return next;
      });
    }

    setSpinning(false);
  }, [spinning, balance, bet, isFreeSpins, globalMultiplier, doTumble]);

  return (
    <div className="bg-gradient-to-b from-indigo-950 to-purple-950 rounded-2xl p-4 min-h-screen relative overflow-hidden">
      {/* Fundo estrelado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display text-xl font-bold text-yellow-300 flex items-center gap-2">
            ⚡ Gates of Olympus
          </h2>
          <p className="text-white/50 text-xs">{spins} rodadas</p>
        </div>
        <div className="text-right">
          <div className="text-white font-display text-xl font-bold">{balance} cr</div>
          <div className="text-yellow-400 text-xs">+{totalWon} ganho</div>
        </div>
      </div>

      {/* Free Spins / Multiplicador */}
      {isFreeSpins && (
        <motion.div className="relative text-center mb-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl py-2">
          <div className="text-yellow-400 font-bold">⚡ FREE SPINS: {freeSpinsLeft}</div>
          <div className="text-white/70 text-sm">Multiplicador Global: x{globalMultiplier}</div>
        </motion.div>
      )}

      {globalMultiplier > 1 && !isFreeSpins && (
        <div className="flex justify-center mb-2">
          <Badge className="bg-yellow-400 text-black font-bold">⚡ x{globalMultiplier} ATIVO</Badge>
        </div>
      )}

      {/* Grid 6x5 */}
      <div className="relative bg-black/40 rounded-2xl p-2 mb-4 border border-purple-500/30">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((row, ri) =>
            row.map((sym, ci) => {
              const isWin = winCells.has(`${ri}-${ci}`);
              return (
                <motion.div
                  key={`${ri}-${ci}`}
                  animate={spinning ? { y: [0, -6, 6, 0] } : isWin ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.08, repeat: spinning ? Infinity : 0 }}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg border transition-all text-xl
                    ${isWin ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_12px_rgba(250,204,21,0.6)]" : "border-white/10 bg-white/5"}
                    ${sym.id === "zeus" ? "border-yellow-300/60 bg-yellow-300/10" : ""}
                    ${sym.isScatter ? "border-purple-400/60 bg-purple-400/10" : ""}
                  `}
                >
                  {sym.emoji}
                  {sym.isScatter && <span className="text-[7px] text-purple-400 font-bold leading-none">SCATTER</span>}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Multiplicadores caindo */}
        <AnimatePresence>
          {multipliers.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 2, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bg-yellow-400 text-black font-display font-bold text-lg rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.8)] z-20"
              style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
            >
              x{m.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Win display */}
      <AnimatePresence>
        {winAmount !== null && winAmount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-center mb-3 bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-3"
          >
            <p className="text-yellow-400 font-display text-3xl font-bold">+{winAmount} ⚡</p>
            {globalMultiplier > 1 && <p className="text-white/60 text-sm">x{globalMultiplier} multiplicador</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paytable */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {SYMBOLS.filter(s => !s.isScatter).slice(0, 5).map(s => (
          <div key={s.id} className="bg-black/30 rounded-lg p-1 text-center">
            <div className="text-lg">{s.emoji}</div>
            <div className="text-yellow-400 text-[9px] font-bold">x{s.value}</div>
          </div>
        ))}
      </div>

      {/* Aposta */}
      <div className="mb-3">
        <p className="text-white/50 text-xs mb-1.5">Aposta</p>
        <div className="flex gap-2">
          {BET_OPTIONS.map(b => (
            <button
              key={b}
              onClick={() => setBet(b)}
              disabled={spinning || isFreeSpins}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40 ${
                bet === b ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Botão */}
      {isFreeSpins ? (
        <Button
          onClick={() => spin(true)}
          disabled={spinning}
          className="w-full h-14 text-lg font-bold bg-purple-600 hover:bg-purple-500 animate-pulse"
        >
          {spinning ? <RotateCcw className="w-6 h-6 animate-spin" /> : <>⚡ FREE SPIN ({freeSpinsLeft})</>}
        </Button>
      ) : (
        <Button
          onClick={() => spin(false)}
          disabled={spinning || balance < bet}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
        >
          {spinning ? <RotateCcw className="w-6 h-6 animate-spin" /> : (
            <><Zap className="w-5 h-5 mr-2" />GIRAR ({bet} cr)</>
          )}
        </Button>
      )}

      {/* Free Spins intro */}
      <AnimatePresence>
        {showFreeSpinsIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 rounded-2xl flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.3, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <div className="text-8xl mb-4">⚡</div>
              <div className="font-display text-4xl font-bold text-yellow-400 mb-2">GATES ABERTOS!</div>
              <div className="text-white text-xl">15 Free Spins</div>
              <div className="text-yellow-400 mt-2">Multiplicadores acumulam!</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button onClick={() => onGameEnd(balance)} variant="ghost" className="w-full mt-3 text-white/30">
        Encerrar
      </Button>
    </div>
  );
}
