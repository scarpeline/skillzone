import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RotateCcw } from "lucide-react";
import { clampPayout, shouldForceLoss } from "@/hooks/useWithdrawalControl";

// ── Símbolos ─────────────────────────────────────────────────────────────────

const SYMBOLS = [
  { id: "ox",      emoji: "🐂", value: 500, label: "Boi da Fortuna", isSpecial: true },
  { id: "gold",    emoji: "🏮", value: 200, label: "Lanterna",       isSpecial: false },
  { id: "coin",    emoji: "🪙", value: 100, label: "Moeda de Ouro",  isSpecial: false },
  { id: "ingot",   emoji: "🧧", value: 80,  label: "Envelope",       isSpecial: false },
  { id: "diamond", emoji: "💎", value: 60,  label: "Diamante",       isSpecial: false },
  { id: "scatter", emoji: "⭐", value: 0,   label: "Scatter",        isSpecial: true  },
  { id: "seven",   emoji: "7️⃣",  value: 30,  label: "Sete",           isSpecial: false },
  { id: "bar",     emoji: "🀄", value: 20,  label: "Mahjong",        isSpecial: false },
];

const ROWS = 3;
const COLS = 5;
const FREE_SPINS_TRIGGER = 3; // 3+ scatters = free spins
const FREE_SPINS_COUNT = 10;

function randomSymbol(excludeScatter = false) {
  const pool = excludeScatter ? SYMBOLS.filter(s => s.id !== "scatter") : SYMBOLS;
  // Peso: símbolos especiais são mais raros
  const weights = pool.map(s => s.isSpecial ? 1 : s.id === "ox" ? 0.5 : 8);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function generateGrid(freeSpins = false): typeof SYMBOLS[0][][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => randomSymbol(false))
  );
}

function countScatters(grid: typeof SYMBOLS[0][][]): number {
  return grid.flat().filter(s => s.id === "scatter").length;
}

function calculateWin(
  grid: typeof SYMBOLS[0][][],
  bet: number,
  oxMultiplier: number
): { total: number; lines: { row: number; count: number; symbol: typeof SYMBOLS[0] }[] } {
  const lines: { row: number; count: number; symbol: typeof SYMBOLS[0] }[] = [];
  let total = 0;

  for (let row = 0; row < ROWS; row++) {
    const first = grid[row][0];
    if (first.id === "scatter") continue;
    let count = 1;
    for (let col = 1; col < COLS; col++) {
      if (grid[row][col].id === first.id || grid[row][col].id === "ox") count++;
      else break;
    }
    if (count >= 3) {
      const mult = count === 3 ? 1 : count === 4 ? 3 : 10;
      const win = Math.round(bet * first.value * mult * oxMultiplier / 100);
      total += win;
      lines.push({ row, count, symbol: first });
    }
  }

  return { total, lines };
}

// ── Componente ───────────────────────────────────────────────────────────────

interface FortuneOxSlotProps {
  onGameEnd: (score: number) => void;
  initialBalance?: number;
}

export function FortuneOxSlot({ onGameEnd, initialBalance = 1000 }: FortuneOxSlotProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState(() => generateGrid());
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [winLines, setWinLines] = useState<number[]>([]);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [isFreeSpins, setIsFreeSpins] = useState(false);
  const [oxMultiplier, setOxMultiplier] = useState(1);
  const [totalWon, setTotalWon] = useState(0);
  const [spins, setSpins] = useState(0);
  const [showFreeSpinsIntro, setShowFreeSpinsIntro] = useState(false);
  const [jackpot] = useState(Math.floor(Math.random() * 50000) + 10000);

  const BET_OPTIONS = [5, 10, 25, 50, 100];

  const doSpin = useCallback(async (freeSpin = false) => {
    if (spinning) return;
    if (!freeSpin && balance < bet) return;

    setSpinning(true);
    setWinAmount(null);
    setWinLines([]);

    if (!freeSpin) {
      setBalance(b => b - bet);
    }
    setSpins(s => s + 1);

    // Animação
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 70));
      setGrid(generateGrid());
    }

    // Resultado final
    const finalGrid = generateGrid();
    setGrid(finalGrid);

    // Verificar scatters
    const scatterCount = countScatters(finalGrid);

    // Calcular ganhos
    const currentMult = isFreeSpins ? oxMultiplier : 1;
    const { total: rawTotal, lines } = calculateWin(finalGrid, freeSpin ? bet : bet, currentMult);

    // Forçar perda se saldo próximo do threshold
    const currentBalance = freeSpin ? balance : balance - bet;
    const forceLoss = shouldForceLoss(currentBalance);
    const total = forceLoss ? 0 : clampPayout(currentBalance, rawTotal);

    setWinLines(lines.map(l => l.row));
    setWinAmount(total);

    if (total > 0) {
      setBalance(b => b + total);
      setTotalWon(t => t + total);
    }

    // Free spins trigger
    if (!isFreeSpins && scatterCount >= FREE_SPINS_TRIGGER) {
      await new Promise(r => setTimeout(r, 800));
      setShowFreeSpinsIntro(true);
      await new Promise(r => setTimeout(r, 2000));
      setShowFreeSpinsIntro(false);
      setIsFreeSpins(true);
      setFreeSpinsLeft(FREE_SPINS_COUNT);
      setOxMultiplier(2); // Multiplicador inicial nos free spins
    }

    // Durante free spins: aumentar multiplicador do boi
    if (isFreeSpins) {
      // Cada boi na tela aumenta o multiplicador
      const oxCount = finalGrid.flat().filter(s => s.id === "ox").length;
      if (oxCount > 0) {
        setOxMultiplier(m => Math.min(m + oxCount, 20));
      }

      setFreeSpinsLeft(f => {
        const next = f - 1;
        if (next <= 0) {
          setIsFreeSpins(false);
          setOxMultiplier(1);
        }
        return next;
      });
    }

    setSpinning(false);
  }, [spinning, balance, bet, isFreeSpins, oxMultiplier]);

  // Auto-spin durante free spins
  const handleSpin = async () => {
    await doSpin(false);
  };

  const handleFreeSpinNext = async () => {
    if (freeSpinsLeft > 0) {
      await doSpin(true);
    }
  };

  return (
    <div className="bg-gradient-to-b from-red-950 to-yellow-950 rounded-2xl p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display text-xl font-bold text-yellow-400 flex items-center gap-2">
            🐂 Fortune Ox
          </h2>
          <p className="text-white/50 text-xs">{spins} rodadas</p>
        </div>
        <div className="text-right">
          <div className="text-white font-display text-xl font-bold">{balance} cr</div>
          <div className="text-yellow-400 text-xs">+{totalWon} ganho</div>
        </div>
      </div>

      {/* Jackpot */}
      <div className="text-center mb-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl py-2">
        <div className="text-yellow-400 font-display text-2xl font-bold animate-pulse">
          🏆 JACKPOT: {jackpot.toLocaleString()} cr
        </div>
      </div>

      {/* Free Spins status */}
      {isFreeSpins && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center mb-3 bg-red-500/20 border border-red-500/40 rounded-xl py-2"
        >
          <div className="text-red-400 font-bold text-lg">
            ⭐ FREE SPINS: {freeSpinsLeft} restantes
          </div>
          <div className="text-yellow-400 text-sm">
            Multiplicador do Boi: x{oxMultiplier}
          </div>
        </motion.div>
      )}

      {/* Multiplicador do Boi */}
      {oxMultiplier > 1 && (
        <div className="flex justify-center mb-2">
          <Badge className="bg-yellow-400 text-black font-bold text-sm px-3 py-1">
            🐂 x{oxMultiplier} MULTIPLICADOR ATIVO
          </Badge>
        </div>
      )}

      {/* Grid */}
      <div className="bg-black/50 rounded-2xl p-3 mb-4 border-2 border-yellow-500/30">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((row, ri) =>
            row.map((sym, ci) => {
              const isWinRow = winLines.includes(ri);
              return (
                <motion.div
                  key={`${ri}-${ci}`}
                  animate={spinning ? { y: [0, -8, 8, 0] } : {}}
                  transition={{ duration: 0.08, repeat: spinning ? Infinity : 0 }}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all
                    ${isWinRow ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : "border-white/10 bg-white/5"}
                    ${sym.id === "scatter" ? "border-red-400/50 bg-red-400/10" : ""}
                    ${sym.id === "ox" ? "border-yellow-400/50 bg-yellow-400/10" : ""}
                  `}
                >
                  <span className="text-2xl">{sym.emoji}</span>
                  {sym.id === "scatter" && <span className="text-[8px] text-red-400 font-bold">SCATTER</span>}
                  {sym.id === "ox" && <span className="text-[8px] text-yellow-400 font-bold">x{oxMultiplier}</span>}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Win display */}
      <AnimatePresence>
        {winAmount !== null && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center mb-3"
          >
            {winAmount > 0 ? (
              <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-3">
                <p className="text-yellow-400 font-display text-3xl font-bold">+{winAmount} 🎉</p>
                {isFreeSpins && <p className="text-red-400 text-sm">Free Spin x{oxMultiplier}</p>}
              </div>
            ) : (
              <p className="text-white/30 text-sm">Sem prêmio...</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paytable */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {SYMBOLS.filter(s => s.id !== "scatter").slice(0, 4).map(s => (
          <div key={s.id} className="bg-black/30 rounded-lg p-1.5 text-center">
            <div className="text-lg">{s.emoji}</div>
            <div className="text-yellow-400 text-[10px] font-bold">x{s.value}</div>
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
          onClick={handleFreeSpinNext}
          disabled={spinning}
          className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-500 animate-pulse"
        >
          {spinning ? <RotateCcw className="w-6 h-6 animate-spin" /> : (
            <>⭐ FREE SPIN ({freeSpinsLeft} restantes)</>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleSpin}
          disabled={spinning || balance < bet}
          className="w-full h-14 text-lg font-bold bg-yellow-500 hover:bg-yellow-400 text-black"
        >
          {spinning ? <RotateCcw className="w-6 h-6 animate-spin" /> : (
            <><Zap className="w-5 h-5 mr-2" />GIRAR ({bet} cr)</>
          )}
        </Button>
      )}

      {/* Free Spins intro overlay */}
      <AnimatePresence>
        {showFreeSpinsIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-8xl mb-4">⭐</div>
              <div className="font-display text-4xl font-bold text-yellow-400 mb-2">
                FREE SPINS!
              </div>
              <div className="text-white text-xl">{FREE_SPINS_COUNT} rodadas grátis</div>
              <div className="text-yellow-400 text-lg mt-2">Multiplicador do Boi ativo!</div>
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
