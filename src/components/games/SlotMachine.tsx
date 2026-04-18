import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, RotateCcw, Zap, TrendingUp } from "lucide-react";

// ── Configuração dos símbolos por tema ──────────────────────────────────────

export type SlotTheme = "tiger" | "fruits" | "gems" | "egypt";

const SYMBOLS: Record<SlotTheme, { symbol: string; value: number; label: string }[]> = {
  tiger: [
    { symbol: "🐯", value: 500, label: "Tigre" },
    { symbol: "🦁", value: 200, label: "Leão" },
    { symbol: "🐆", value: 100, label: "Leopardo" },
    { symbol: "💎", value: 80,  label: "Diamante" },
    { symbol: "🌟", value: 50,  label: "Estrela" },
    { symbol: "🍀", value: 30,  label: "Trevo" },
    { symbol: "🔥", value: 20,  label: "Fogo" },
    { symbol: "7️⃣",  value: 15,  label: "Sete" },
  ],
  fruits: [
    { symbol: "🍇", value: 500, label: "Uva" },
    { symbol: "🍒", value: 200, label: "Cereja" },
    { symbol: "🍋", value: 100, label: "Limão" },
    { symbol: "🍊", value: 80,  label: "Laranja" },
    { symbol: "🍉", value: 50,  label: "Melancia" },
    { symbol: "🍓", value: 30,  label: "Morango" },
    { symbol: "🍑", value: 20,  label: "Pêssego" },
    { symbol: "🍌", value: 15,  label: "Banana" },
  ],
  gems: [
    { symbol: "💎", value: 500, label: "Diamante" },
    { symbol: "💍", value: 200, label: "Anel" },
    { symbol: "🔮", value: 100, label: "Cristal" },
    { symbol: "💜", value: 80,  label: "Ametista" },
    { symbol: "💙", value: 50,  label: "Safira" },
    { symbol: "💚", value: 30,  label: "Esmeralda" },
    { symbol: "❤️", value: 20,  label: "Rubi" },
    { symbol: "⭐", value: 15,  label: "Estrela" },
  ],
  egypt: [
    { symbol: "🦅", value: 500, label: "Hórus" },
    { symbol: "🐍", value: 200, label: "Cobra" },
    { symbol: "🏺", value: 100, label: "Ânfora" },
    { symbol: "👁️", value: 80,  label: "Olho" },
    { symbol: "🌙", value: 50,  label: "Lua" },
    { symbol: "☀️", value: 30,  label: "Sol" },
    { symbol: "⚡", value: 20,  label: "Raio" },
    { symbol: "🔑", value: 15,  label: "Chave" },
  ],
};

const ROWS = 3;
const COLS = 5;

// ── Lógica de pagamento ──────────────────────────────────────────────────────

function calculateWin(
  grid: string[][],
  symbols: { symbol: string; value: number }[],
  bet: number
): { win: number; lines: number[][] } {
  const lines: number[][] = [];
  let totalWin = 0;

  // Linhas horizontais
  for (let row = 0; row < ROWS; row++) {
    const rowSymbols = grid[row];
    const first = rowSymbols[0];
    let count = 1;
    for (let col = 1; col < COLS; col++) {
      if (rowSymbols[col] === first) count++;
      else break;
    }
    if (count >= 3) {
      const sym = symbols.find(s => s.symbol === first);
      if (sym) {
        const multiplier = count === 3 ? 1 : count === 4 ? 3 : 10;
        totalWin += bet * sym.value * multiplier / 100;
        lines.push(Array.from({ length: count }, (_, i) => row * COLS + i));
      }
    }
  }

  // Diagonal principal
  const diag1 = [grid[0][0], grid[1][1], grid[2][2]];
  if (diag1.every(s => s === diag1[0])) {
    const sym = symbols.find(s => s.symbol === diag1[0]);
    if (sym) {
      totalWin += bet * sym.value / 100;
      lines.push([0, 6, 12]);
    }
  }

  // Diagonal inversa
  const diag2 = [grid[0][4], grid[1][3], grid[2][2]];
  if (diag2.every(s => s === diag2[0])) {
    const sym = symbols.find(s => s.symbol === diag2[0]);
    if (sym) {
      totalWin += bet * sym.value / 100;
      lines.push([4, 8, 12]);
    }
  }

  return { win: Math.round(totalWin), lines };
}

function randomGrid(symbols: { symbol: string }[]): string[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () =>
      symbols[Math.floor(Math.random() * symbols.length)].symbol
    )
  );
}

// ── Componente ───────────────────────────────────────────────────────────────

interface SlotMachineProps {
  theme?: SlotTheme;
  onGameEnd: (score: number) => void;
  initialBalance?: number;
}

export function SlotMachine({ theme = "tiger", onGameEnd, initialBalance = 1000 }: SlotMachineProps) {
  const symbols = SYMBOLS[theme];
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState<string[][]>(() => randomGrid(symbols));
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [winLines, setWinLines] = useState<number[][]>([]);
  const [totalWon, setTotalWon] = useState(0);
  const [spins, setSpins] = useState(0);
  const spinRef = useRef(false);

  const BET_OPTIONS = [5, 10, 25, 50, 100];

  const spin = useCallback(async () => {
    if (spinning || balance < bet) return;
    spinRef.current = true;
    setSpinning(true);
    setWinAmount(null);
    setWinLines([]);
    setBalance(b => b - bet);
    setSpins(s => s + 1);

    // Animação de giro — atualiza grid rapidamente
    const frames = 12;
    for (let i = 0; i < frames; i++) {
      await new Promise(r => setTimeout(r, 60));
      setGrid(randomGrid(symbols));
    }

    // Resultado final
    const finalGrid = randomGrid(symbols);
    setGrid(finalGrid);

    const { win, lines } = calculateWin(finalGrid, symbols, bet);
    setWinLines(lines);
    setWinAmount(win);

    if (win > 0) {
      setBalance(b => b + win);
      setTotalWon(t => t + win);
    }

    setSpinning(false);
    spinRef.current = false;
  }, [spinning, balance, bet, symbols]);

  const handleCashOut = () => {
    onGameEnd(balance);
  };

  const themeConfig = {
    tiger:  { name: "Tigrinho",    bg: "from-orange-900 to-yellow-900",  accent: "text-orange-400" },
    fruits: { name: "Frutas",      bg: "from-green-900 to-emerald-900",  accent: "text-green-400" },
    gems:   { name: "Gemas",       bg: "from-purple-900 to-indigo-900",  accent: "text-purple-400" },
    egypt:  { name: "Egito",       bg: "from-yellow-900 to-amber-900",   accent: "text-yellow-400" },
  }[theme];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeConfig.bg} p-4 rounded-2xl`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">🎰 {themeConfig.name}</h2>
          <p className="text-white/60 text-sm">{spins} rodadas</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-white">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-display text-2xl font-bold">{balance}</span>
          </div>
          <p className="text-white/60 text-xs">créditos</p>
        </div>
      </div>

      {/* Paytable rápida */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {symbols.slice(0, 4).map(s => (
          <div key={s.symbol} className="flex-shrink-0 bg-black/30 rounded-lg px-3 py-1 text-center">
            <div className="text-lg">{s.symbol}</div>
            <div className="text-yellow-400 text-xs font-bold">x{s.value}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-black/50 rounded-2xl p-4 mb-6 border-2 border-yellow-500/30">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((row, ri) =>
            row.map((sym, ci) => {
              const idx = ri * COLS + ci;
              const isWinning = winLines.some(line => line.includes(idx));
              return (
                <motion.div
                  key={`${ri}-${ci}`}
                  animate={spinning ? { y: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.1, repeat: spinning ? Infinity : 0 }}
                  className={`aspect-square flex items-center justify-center text-3xl rounded-xl border-2 transition-all ${
                    isWinning
                      ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {sym}
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
            className="text-center mb-4"
          >
            {winAmount > 0 ? (
              <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4">
                <p className="text-yellow-400 font-display text-3xl font-bold">+{winAmount} 🎉</p>
                <p className="text-white/70 text-sm">Você ganhou!</p>
              </div>
            ) : (
              <p className="text-white/40 text-sm">Sem prêmio desta vez...</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet selector */}
      <div className="mb-4">
        <p className="text-white/60 text-xs mb-2">Aposta por rodada</p>
        <div className="flex gap-2">
          {BET_OPTIONS.map(b => (
            <button
              key={b}
              onClick={() => setBet(b)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                bet === b
                  ? "bg-yellow-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-4 text-center">
        <div className="flex-1 bg-black/30 rounded-lg p-2">
          <div className="text-green-400 font-bold">{totalWon}</div>
          <div className="text-white/40 text-xs">Total ganho</div>
        </div>
        <div className="flex-1 bg-black/30 rounded-lg p-2">
          <div className="text-blue-400 font-bold">{spins * bet}</div>
          <div className="text-white/40 text-xs">Total apostado</div>
        </div>
        <div className="flex-1 bg-black/30 rounded-lg p-2">
          <div className={`font-bold ${balance >= initialBalance ? "text-green-400" : "text-red-400"}`}>
            {balance - initialBalance > 0 ? "+" : ""}{balance - initialBalance}
          </div>
          <div className="text-white/40 text-xs">Lucro/Perda</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={spin}
          disabled={spinning || balance < bet}
          className="flex-1 h-14 text-lg font-bold bg-yellow-400 hover:bg-yellow-300 text-black"
        >
          {spinning ? (
            <RotateCcw className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              GIRAR ({bet} cr)
            </>
          )}
        </Button>
        <Button
          onClick={handleCashOut}
          variant="outline"
          className="h-14 px-4 border-white/20 text-white hover:bg-white/10"
        >
          <TrendingUp className="w-5 h-5" />
        </Button>
      </div>

      {balance < bet && (
        <p className="text-center text-red-400 text-sm mt-3">
          Saldo insuficiente para apostar {bet} créditos
        </p>
      )}
    </div>
  );
}
