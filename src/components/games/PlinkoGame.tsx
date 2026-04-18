import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";

// ── Configuração ─────────────────────────────────────────────────────────────

const ROWS = 12;
const RISK_CONFIGS = {
  low:    { multipliers: [5.6, 2.1, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 2.1, 5.6], color: "from-blue-500 to-cyan-500" },
  medium: { multipliers: [13, 3, 1.3, 0.7, 0.4, 0.2, 0.4, 0.7, 1.3, 3, 13], color: "from-yellow-500 to-orange-500" },
  high:   { multipliers: [29, 4, 1.5, 0.3, 0.2, 0.1, 0.2, 0.3, 1.5, 4, 29], color: "from-red-500 to-pink-600" },
};

type Risk = "low" | "medium" | "high";

// Simula o caminho da bolinha (esquerda=0, direita=1 em cada pino)
function simulatePath(rows: number): number[] {
  return Array.from({ length: rows }, () => Math.random() < 0.5 ? 0 : 1);
}

function pathToSlot(path: number[]): number {
  // Conta quantas vezes foi para a direita
  const rights = path.filter(p => p === 1).length;
  // Mapeia para índice do slot (0 a rows)
  return rights;
}

function slotToMultiplierIndex(slot: number, totalSlots: number, multCount: number): number {
  // Mapeia slot (0..rows) para índice do array de multiplicadores
  return Math.round((slot / totalSlots) * (multCount - 1));
}

// ── Bolinha animada ──────────────────────────────────────────────────────────

interface Ball {
  id: number;
  path: number[];
  slot: number;
  multiplier: number;
  bet: number;
  payout: number;
}

// ── Componente ───────────────────────────────────────────────────────────────

interface PlinkoGameProps {
  onGameEnd: (score: number) => void;
  initialBalance?: number;
}

export function PlinkoGame({ onGameEnd, initialBalance = 1000 }: PlinkoGameProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState<Risk>("medium");
  const [balls, setBalls] = useState<Ball[]>([]);
  const [activeBall, setActiveBall] = useState<Ball | null>(null);
  const [totalProfit, setTotalProfit] = useState(0);
  const [lastResult, setLastResult] = useState<{ mult: number; payout: number } | null>(null);
  const ballIdRef = useRef(0);
  const isDropping = useRef(false);

  const config = RISK_CONFIGS[risk];
  const BET_PRESETS = [5, 10, 25, 50, 100];

  const dropBall = useCallback(async () => {
    if (balance < betAmount || isDropping.current) return;
    isDropping.current = true;
    setBalance(b => b - betAmount);

    const path = simulatePath(ROWS);
    const slot = pathToSlot(path);
    const multIdx = slotToMultiplierIndex(slot, ROWS, config.multipliers.length);
    const multiplier = config.multipliers[multIdx];
    const payout = Math.round(betAmount * multiplier);

    const ball: Ball = {
      id: ++ballIdRef.current,
      path,
      slot,
      multiplier,
      bet: betAmount,
      payout,
    };

    setActiveBall(ball);

    // Aguardar animação (ROWS * 120ms)
    await new Promise(r => setTimeout(r, ROWS * 120 + 500));

    setBalance(b => b + payout);
    const profit = payout - betAmount;
    setTotalProfit(p => p + profit);
    setLastResult({ mult: multiplier, payout });
    setBalls(prev => [ball, ...prev].slice(0, 8));
    setActiveBall(null);
    isDropping.current = false;
  }, [balance, betAmount, config.multipliers]);

  // Calcular posição X da bolinha em cada linha
  const getBallX = (ball: Ball, row: number): number => {
    // Começa no centro (50%), cada passo move ±(50/ROWS)%
    const step = 40 / ROWS;
    let x = 50;
    for (let i = 0; i < row; i++) {
      x += ball.path[i] === 1 ? step : -step;
    }
    return x;
  };

  const multColor = (mult: number) => {
    if (mult >= 10) return "bg-yellow-400 text-black";
    if (mult >= 3) return "bg-orange-500 text-white";
    if (mult >= 1) return "bg-blue-500 text-white";
    return "bg-slate-600 text-white";
  };

  return (
    <div className="bg-gradient-to-b from-slate-950 to-violet-950 rounded-2xl p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            🎯 Plinko
          </h2>
          <p className="text-white/50 text-xs">Solte a bolinha e torça!</p>
        </div>
        <div className="text-right">
          <div className="text-white font-display text-xl font-bold">{balance} cr</div>
          <div className={`text-xs font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalProfit >= 0 ? "+" : ""}{totalProfit} lucro
          </div>
        </div>
      </div>

      {/* Último resultado */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            key={lastResult.payout}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mb-3 p-2 rounded-xl ${
              lastResult.mult >= 1 ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            <span className={`font-bold ${lastResult.mult >= 1 ? "text-green-400" : "text-red-400"}`}>
              {lastResult.mult}x → {lastResult.payout > betAmount ? "+" : ""}{lastResult.payout - betAmount} cr
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabuleiro Plinko */}
      <div className="relative bg-black/40 rounded-2xl border border-white/10 mb-4 overflow-hidden"
        style={{ height: `${ROWS * 28 + 60}px` }}
      >
        {/* Pinos */}
        {Array.from({ length: ROWS }, (_, row) => {
          const pinsInRow = row + 2;
          return Array.from({ length: pinsInRow }, (_, col) => {
            const x = 50 + (col - (pinsInRow - 1) / 2) * (80 / ROWS);
            const y = (row + 1) * 28;
            return (
              <div
                key={`${row}-${col}`}
                className="absolute w-2 h-2 rounded-full bg-white/60"
                style={{ left: `${x}%`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
              />
            );
          });
        })}

        {/* Bolinha animada */}
        <AnimatePresence>
          {activeBall && (
            <motion.div
              key={activeBall.id}
              className="absolute w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] z-10"
              style={{ transform: "translate(-50%, -50%)" }}
              initial={{ left: "50%", top: "0px" }}
              animate={{
                left: Array.from({ length: ROWS + 1 }, (_, i) => `${getBallX(activeBall, i)}%`),
                top: Array.from({ length: ROWS + 1 }, (_, i) => `${i * 28}px`),
              }}
              transition={{
                duration: ROWS * 0.12,
                ease: "linear",
                times: Array.from({ length: ROWS + 1 }, (_, i) => i / ROWS),
              }}
            />
          )}
        </AnimatePresence>

        {/* Slots de multiplicadores */}
        <div
          className="absolute bottom-0 left-0 right-0 flex"
          style={{ height: "40px" }}
        >
          {config.multipliers.map((mult, i) => (
            <div
              key={i}
              className={`flex-1 flex items-center justify-center text-xs font-bold rounded-b-lg mx-0.5 ${multColor(mult)}`}
            >
              {mult}x
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de bolinhas */}
      {balls.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
          {balls.map(b => (
            <div
              key={b.id}
              className={`shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${
                b.multiplier >= 1 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {b.multiplier}x
            </div>
          ))}
        </div>
      )}

      {/* Controles */}
      <div className="space-y-3">
        {/* Risco */}
        <div>
          <div className="text-white/60 text-xs mb-1.5">Risco</div>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as Risk[]).map(r => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  risk === r
                    ? r === "low" ? "bg-blue-500 text-white"
                      : r === "medium" ? "bg-yellow-500 text-black"
                      : "bg-red-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {r === "low" ? "Baixo" : r === "medium" ? "Médio" : "Alto"}
              </button>
            ))}
          </div>
          <div className="text-white/40 text-xs mt-1">
            {risk === "low" ? "Multiplicadores menores, mais consistente" :
             risk === "medium" ? "Equilíbrio entre risco e recompensa" :
             "Jackpots enormes, mas risco alto"}
          </div>
        </div>

        {/* Aposta */}
        <div>
          <div className="text-white/60 text-xs mb-1.5">Aposta</div>
          <div className="flex gap-2">
            {BET_PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setBetAmount(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  betAmount === p ? "bg-violet-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplicadores disponíveis */}
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-white/40 text-xs mb-2">Multiplicadores ({risk})</div>
          <div className="flex flex-wrap gap-1">
            {config.multipliers.map((m, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-xs font-bold ${multColor(m)}`}>
                {m}x
              </span>
            ))}
          </div>
        </div>

        <Button
          onClick={dropBall}
          disabled={balance < betAmount || !!activeBall}
          className={`w-full h-14 text-lg font-bold bg-gradient-to-r ${config.color} text-white`}
        >
          {activeBall ? (
            <span className="animate-pulse">🎯 Caindo...</span>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Soltar Bolinha — {betAmount} cr
            </>
          )}
        </Button>
      </div>

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
