import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, History, Users } from "lucide-react";

// ── Histórico de rodadas ─────────────────────────────────────────────────────
const HISTORY_SIZE = 10;

function generateCrashPoint(): number {
  // Provably fair: house edge ~4%
  const r = Math.random();
  if (r < 0.04) return 1.0; // 4% chance de crash imediato
  return Math.max(1.0, parseFloat((1 / (1 - r) * 0.96).toFixed(2)));
}

interface RoundHistory {
  multiplier: number;
  id: number;
}

interface BetRecord {
  amount: number;
  cashedAt: number | null;
  profit: number;
}

// ── Componente ───────────────────────────────────────────────────────────────
interface CrashGameProps {
  onGameEnd: (score: number) => void;
  initialBalance?: number;
}

type GameState = "waiting" | "flying" | "crashed";

export function CrashGame({ onGameEnd, initialBalance = 1000 }: CrashGameProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [totalProfit, setTotalProfit] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const hasBetRef = useRef(false);
  const cashedOutRef = useRef(false);
  const betAmountRef = useRef(betAmount);

  useEffect(() => { betAmountRef.current = betAmount; }, [betAmount]);
  useEffect(() => { hasBetRef.current = hasBet; }, [hasBet]);
  useEffect(() => { cashedOutRef.current = cashedOut; }, [cashedOut]);

  // Fase de espera (countdown)
  const startCountdown = useCallback(() => {
    setGameState("waiting");
    setMultiplier(1.0);
    setCashedOut(false);
    setCountdown(5);

    let c = 5;
    const cd = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cd);
        startRound();
      }
    }, 1000);
  }, []); // eslint-disable-line

  const startRound = useCallback(() => {
    const cp = generateCrashPoint();
    setCrashPoint(cp);
    crashPointRef.current = cp;
    setGameState("flying");
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Curva exponencial: mult = e^(0.06 * t)
      const current = parseFloat(Math.pow(Math.E, 0.06 * elapsed).toFixed(2));
      setMultiplier(current);

      // Auto cashout
      if (autoCashout && current >= autoCashout && hasBetRef.current && !cashedOutRef.current) {
        doCashout(current);
      }

      // Crash
      if (current >= crashPointRef.current) {
        clearInterval(intervalRef.current!);
        setMultiplier(crashPointRef.current);
        setGameState("crashed");

        // Registrar no histórico
        setHistory(h => [{ multiplier: crashPointRef.current, id: Date.now() }, ...h].slice(0, HISTORY_SIZE));

        // Se apostou e não sacou → perdeu
        if (hasBetRef.current && !cashedOutRef.current) {
          setBetHistory(bh => [{ amount: betAmountRef.current, cashedAt: null, profit: -betAmountRef.current }, ...bh].slice(0, 10));
          setTotalProfit(p => p - betAmountRef.current);
        }

        setHasBet(false);
        setTimeout(() => startCountdown(), 3000);
      }
    }, 50);
  }, [autoCashout, startCountdown]); // eslint-disable-line

  const doCashout = useCallback((atMultiplier: number) => {
    if (!hasBetRef.current || cashedOutRef.current) return;
    cashedOutRef.current = true;
    setCashedOut(true);
    const profit = Math.round(betAmountRef.current * atMultiplier - betAmountRef.current);
    const payout = Math.round(betAmountRef.current * atMultiplier);
    setBalance(b => b + payout);
    setTotalProfit(p => p + profit);
    setBetHistory(bh => [{ amount: betAmountRef.current, cashedAt: atMultiplier, profit }, ...bh].slice(0, 10));
  }, []);

  // Iniciar
  useEffect(() => {
    startCountdown();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line

  const placeBet = () => {
    if (gameState !== "waiting" || hasBet || balance < betAmount) return;
    setBalance(b => b - betAmount);
    setHasBet(true);
  };

  const cashout = () => {
    if (gameState !== "flying" || !hasBet || cashedOut) return;
    doCashout(multiplier);
  };

  const multiplierColor = () => {
    if (gameState === "crashed") return "text-red-400";
    if (multiplier >= 10) return "text-yellow-300";
    if (multiplier >= 3) return "text-green-400";
    return "text-white";
  };

  const BET_PRESETS = [5, 10, 25, 50, 100, 200];

  return (
    <div className="bg-gradient-to-b from-slate-950 to-blue-950 rounded-2xl p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Crash
          </h2>
          <p className="text-white/50 text-xs">Saque antes do crash!</p>
        </div>
        <div className="text-right">
          <div className="text-white font-display text-xl font-bold">{balance} cr</div>
          <div className={`text-xs font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalProfit >= 0 ? "+" : ""}{totalProfit} lucro
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {history.map(h => (
          <Badge
            key={h.id}
            className={`shrink-0 text-xs font-bold ${
              h.multiplier < 2 ? "bg-red-500/20 text-red-400 border-red-500/30" :
              h.multiplier < 5 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
              "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }`}
          >
            {h.multiplier.toFixed(2)}x
          </Badge>
        ))}
        {history.length === 0 && <span className="text-white/30 text-xs">Sem histórico ainda</span>}
      </div>

      {/* Área principal do jogo */}
      <div className="relative bg-black/40 rounded-2xl border border-white/10 h-56 mb-4 overflow-hidden flex items-center justify-center">
        {/* Grid de fundo */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Avião */}
        <AnimatePresence>
          {gameState === "flying" && (
            <motion.div
              initial={{ x: -100, y: 100 }}
              animate={{ x: 0, y: 0 }}
              className="absolute text-5xl"
              style={{
                left: `${Math.min(70, (multiplier - 1) * 8)}%`,
                bottom: `${Math.min(70, (multiplier - 1) * 8)}%`,
              }}
            >
              ✈️
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multiplicador central */}
        <div className="text-center z-10">
          {gameState === "waiting" && (
            <div>
              <div className="text-white/50 text-sm mb-1">Próxima rodada em</div>
              <div className="font-display text-6xl font-bold text-white">{countdown}s</div>
            </div>
          )}
          {gameState === "flying" && (
            <motion.div
              key={Math.floor(multiplier * 10)}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`font-display text-7xl font-bold ${multiplierColor()}`}
            >
              {multiplier.toFixed(2)}x
            </motion.div>
          )}
          {gameState === "crashed" && (
            <motion.div
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-2">💥</div>
              <div className="font-display text-4xl font-bold text-red-400">
                CRASH @ {crashPoint.toFixed(2)}x
              </div>
            </motion.div>
          )}
        </div>

        {/* Cashout success overlay */}
        <AnimatePresence>
          {cashedOut && gameState === "flying" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 rounded-xl px-4 py-2 text-center"
            >
              <div className="text-green-400 font-bold text-lg">✅ Sacou!</div>
              <div className="text-white text-sm">{multiplier.toFixed(2)}x</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="space-y-3">
        {/* Valor da aposta */}
        <div>
          <div className="text-white/60 text-xs mb-1.5">Valor da aposta</div>
          <div className="flex gap-2 flex-wrap">
            {BET_PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setBetAmount(p)}
                disabled={gameState !== "waiting" || hasBet}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  betAmount === p ? "bg-blue-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                } disabled:opacity-40`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Auto cashout */}
        <div className="flex items-center gap-3">
          <div className="text-white/60 text-xs">Auto saque em:</div>
          <Input
            type="number"
            min="1.1"
            step="0.1"
            placeholder="Ex: 2.0"
            value={autoCashout ?? ""}
            onChange={e => setAutoCashout(e.target.value ? parseFloat(e.target.value) : null)}
            className="w-28 h-8 text-sm bg-white/10 border-white/20 text-white"
          />
          <span className="text-white/40 text-xs">x (opcional)</span>
        </div>

        {/* Botão principal */}
        {gameState === "waiting" && !hasBet && (
          <Button
            onClick={placeBet}
            disabled={balance < betAmount}
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500"
          >
            <Zap className="w-5 h-5 mr-2" />
            Apostar {betAmount} cr
          </Button>
        )}
        {gameState === "waiting" && hasBet && (
          <div className="w-full h-14 flex items-center justify-center bg-blue-500/20 border border-blue-500/40 rounded-xl">
            <span className="text-blue-400 font-bold">✅ Aposta de {betAmount} cr confirmada!</span>
          </div>
        )}
        {gameState === "flying" && hasBet && !cashedOut && (
          <Button
            onClick={cashout}
            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-500 animate-pulse"
          >
            💰 SACAR {Math.round(betAmount * multiplier)} cr ({multiplier.toFixed(2)}x)
          </Button>
        )}
        {gameState === "flying" && (!hasBet || cashedOut) && (
          <div className="w-full h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl">
            <span className="text-white/40">Aguarde a próxima rodada para apostar</span>
          </div>
        )}
        {gameState === "crashed" && (
          <div className="w-full h-14 flex items-center justify-center bg-red-500/10 border border-red-500/30 rounded-xl">
            <span className="text-red-400 font-bold">💥 Preparando próxima rodada...</span>
          </div>
        )}
      </div>

      {/* Histórico de apostas */}
      {betHistory.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
            <History className="w-3 h-3" />
            Suas apostas
          </div>
          <div className="space-y-1">
            {betHistory.slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-1.5">
                <span className="text-white/60">{b.amount} cr</span>
                {b.cashedAt ? (
                  <span className="text-green-400 font-bold">+{b.profit} @ {b.cashedAt.toFixed(2)}x</span>
                ) : (
                  <span className="text-red-400 font-bold">-{b.amount} (crash)</span>
                )}
              </div>
            ))}
          </div>
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
