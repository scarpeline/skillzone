import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Bomb, Gem, TrendingUp, RotateCcw, Zap } from "lucide-react";

// ── Lógica ───────────────────────────────────────────────────────────────────

const GRID_SIZE = 25; // 5x5

function generateMines(count: number, revealed: Set<number>): Set<number> {
  const mines = new Set<number>();
  const available = Array.from({ length: GRID_SIZE }, (_, i) => i).filter(i => !revealed.has(i));
  while (mines.size < count && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    mines.add(available[idx]);
    available.splice(idx, 1);
  }
  return mines;
}

function calcMultiplier(revealed: number, mineCount: number): number {
  // Fórmula baseada em probabilidade combinatória
  if (revealed === 0) return 1.0;
  let mult = 1.0;
  for (let i = 0; i < revealed; i++) {
    const safe = GRID_SIZE - mineCount - i;
    const remaining = GRID_SIZE - i;
    mult *= remaining / safe;
  }
  return parseFloat((mult * 0.97).toFixed(2)); // 3% house edge
}

// ── Componente ───────────────────────────────────────────────────────────────

interface MinesGameProps {
  onGameEnd: (score: number) => void;
  initialBalance?: number;
}

type CellState = "hidden" | "gem" | "mine";

export function MinesGame({ onGameEnd, initialBalance = 1000 }: MinesGameProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(5);
  const [cells, setCells] = useState<CellState[]>(Array(GRID_SIZE).fill("hidden"));
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [revealedCount, setRevealedCount] = useState(0);

  const MINE_OPTIONS = [1, 3, 5, 10, 15, 20];
  const BET_PRESETS = [5, 10, 25, 50, 100];

  const startGame = useCallback(() => {
    if (balance < betAmount) return;
    setBalance(b => b - betAmount);
    const newMines = generateMines(mineCount, new Set());
    setMines(newMines);
    setCells(Array(GRID_SIZE).fill("hidden"));
    setRevealed(new Set());
    setGameActive(true);
    setGameOver(false);
    setWon(false);
    setCurrentMultiplier(1.0);
    setRevealedCount(0);
  }, [balance, betAmount, mineCount]);

  const revealCell = useCallback((idx: number) => {
    if (!gameActive || gameOver || revealed.has(idx)) return;

    if (mines.has(idx)) {
      // BOOM — revelar todas as minas
      setCells(prev => {
        const next = [...prev];
        mines.forEach(m => { next[m] = "mine"; });
        next[idx] = "mine";
        return next;
      });
      setGameActive(false);
      setGameOver(true);
      setWon(false);
      setTotalProfit(p => p - betAmount);
    } else {
      const newRevealed = new Set(revealed);
      newRevealed.add(idx);
      const newCount = revealedCount + 1;
      const mult = calcMultiplier(newCount, mineCount);

      setCells(prev => {
        const next = [...prev];
        next[idx] = "gem";
        return next;
      });
      setRevealed(newRevealed);
      setRevealedCount(newCount);
      setCurrentMultiplier(mult);

      // Vitória: revelou todas as casas seguras
      if (newCount === GRID_SIZE - mineCount) {
        const payout = Math.round(betAmount * mult);
        setBalance(b => b + payout);
        setTotalProfit(p => p + payout - betAmount);
        setGameActive(false);
        setGameOver(true);
        setWon(true);
      }
    }
  }, [gameActive, gameOver, revealed, mines, revealedCount, mineCount, betAmount]);

  const cashout = useCallback(() => {
    if (!gameActive || revealedCount === 0) return;
    const payout = Math.round(betAmount * currentMultiplier);
    setBalance(b => b + payout);
    setTotalProfit(p => p + payout - betAmount);
    setGameActive(false);
    setGameOver(true);
    setWon(true);
    // Revelar todas as minas
    setCells(prev => {
      const next = [...prev];
      mines.forEach(m => { if (next[m] === "hidden") next[m] = "mine"; });
      return next;
    });
  }, [gameActive, revealedCount, betAmount, currentMultiplier, mines]);

  const potentialPayout = Math.round(betAmount * currentMultiplier);

  return (
    <div className="bg-gradient-to-b from-slate-950 to-emerald-950 rounded-2xl p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Bomb className="w-5 h-5 text-red-400" />
            Mines
          </h2>
          <p className="text-white/50 text-xs">Evite as minas, colete gemas!</p>
        </div>
        <div className="text-right">
          <div className="text-white font-display text-xl font-bold">{balance} cr</div>
          <div className={`text-xs font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalProfit >= 0 ? "+" : ""}{totalProfit} lucro
          </div>
        </div>
      </div>

      {/* Multiplicador atual */}
      {gameActive && revealedCount > 0 && (
        <motion.div
          key={currentMultiplier}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-center mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3"
        >
          <div className="text-green-400 font-display text-3xl font-bold">{currentMultiplier.toFixed(2)}x</div>
          <div className="text-white/60 text-sm">Saque agora: {potentialPayout} cr</div>
        </motion.div>
      )}

      {/* Grid 5x5 */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {cells.map((cell, idx) => (
          <motion.button
            key={idx}
            onClick={() => revealCell(idx)}
            whileTap={gameActive && cell === "hidden" ? { scale: 0.9 } : {}}
            disabled={!gameActive || cell !== "hidden"}
            className={`
              aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all
              ${cell === "hidden" && gameActive ? "border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 cursor-pointer" : ""}
              ${cell === "hidden" && !gameActive ? "border-white/10 bg-white/5 cursor-not-allowed" : ""}
              ${cell === "gem" ? "border-green-400/50 bg-green-400/10" : ""}
              ${cell === "mine" ? "border-red-400/50 bg-red-400/10" : ""}
            `}
          >
            <AnimatePresence>
              {cell === "gem" && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-2xl"
                >
                  💎
                </motion.span>
              )}
              {cell === "mine" && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  💣
                </motion.span>
              )}
              {cell === "hidden" && (
                <span className="text-white/20 text-lg">?</span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Game over overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center p-4 rounded-xl border mb-4 ${
              won
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="text-4xl mb-2">{won ? "💰" : "💥"}</div>
            <div className={`font-display text-2xl font-bold ${won ? "text-green-400" : "text-red-400"}`}>
              {won ? `+${potentialPayout} cr` : `-${betAmount} cr`}
            </div>
            <div className="text-white/60 text-sm">
              {won ? `Sacou em ${currentMultiplier.toFixed(2)}x` : "Explodiu!"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      {!gameActive && (
        <div className="space-y-3">
          {/* Aposta */}
          <div>
            <div className="text-white/60 text-xs mb-1.5">Aposta</div>
            <div className="flex gap-2">
              {BET_PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setBetAmount(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    betAmount === p ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Minas */}
          <div>
            <div className="text-white/60 text-xs mb-1.5">
              Número de minas <span className="text-red-400">({mineCount} 💣)</span>
            </div>
            <div className="flex gap-2">
              {MINE_OPTIONS.map(m => (
                <button
                  key={m}
                  onClick={() => setMineCount(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    mineCount === m ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="text-white/40 text-xs mt-1">
              Mais minas = multiplicadores maiores = mais risco
            </div>
          </div>

          {/* Multiplicador inicial */}
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-white/60 text-xs">Multiplicador inicial</div>
            <div className="text-white font-bold text-lg">{calcMultiplier(1, mineCount).toFixed(2)}x na 1ª gema</div>
          </div>

          <Button
            onClick={startGame}
            disabled={balance < betAmount}
            className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-500"
          >
            <Zap className="w-5 h-5 mr-2" />
            Jogar — {betAmount} cr
          </Button>
        </div>
      )}

      {/* Botão de saque durante o jogo */}
      {gameActive && revealedCount > 0 && (
        <Button
          onClick={cashout}
          className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-500"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Sacar {potentialPayout} cr ({currentMultiplier.toFixed(2)}x)
        </Button>
      )}

      {gameActive && revealedCount === 0 && (
        <div className="text-center text-white/40 text-sm py-4">
          Clique em uma casa para começar!
        </div>
      )}

      <Button
        onClick={() => onGameEnd(balance)}
        variant="ghost"
        className="w-full mt-4 text-white/40 hover:text-white/70"
      >
        Encerrar sessão
      </Button>
    </div>
  );
}
