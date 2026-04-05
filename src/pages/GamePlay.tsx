import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MemoryGame } from "@/components/games/MemoryGame";
import { QuizGame } from "@/components/games/QuizGame";
import { SudokuGame } from "@/components/games/SudokuGame";
import { PuzzleGame } from "@/components/games/PuzzleGame";
import { CheckersGame } from "@/components/games/CheckersGame";
import { ReversiGame } from "@/components/games/ReversiGame";
import { ChessGame } from "@/components/games/ChessGame";
import { GoGame } from "@/components/games/GoGame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Coins, Trophy, Zap, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const GAME_NAMES: Record<string, string> = {
  memory: "Memory Master", quiz: "Quiz de Conhecimento", chess: "Xadrez",
  checkers: "Damas", go: "Go", reversi: "Reversi",
  sudoku: "Sudoku Competitivo", puzzle: "Puzzle Rush",
};

type StakeMode = "free" | "credits" | "cash";

export default function GamePlay() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [stakeMode, setStakeMode] = useState<StakeMode>("free");
  const [stakeAmount, setStakeAmount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const stakeOptions = {
    credits: [10, 25, 50, 100],
    cash: [5, 10, 25, 50],
  };

  const canAffordStake = () => {
    if (stakeMode === "free") return true;
    if (stakeMode === "credits") return (profile?.credits_balance ?? 0) >= stakeAmount;
    if (stakeMode === "cash") return (profile?.cash_balance ?? 0) >= stakeAmount;
    return false;
  };

  const startGame = async () => {
    if (!canAffordStake()) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }

    setLoading(true);
    if (stakeMode !== "free" && stakeAmount > 0 && profile) {
      try {
        const wallet = stakeMode === "credits" ? "credits" : "cash";
        const balanceField = stakeMode === "credits" ? "credits_balance" : "cash_balance";
        const currentBalance = stakeMode === "credits" ? profile.credits_balance : Number(profile.cash_balance);

        const { error: txError } = await supabase.from("transactions").insert({
          user_id: profile.id,
          type: "entry",
          wallet,
          amount: -stakeAmount,
          description: `Entrada - ${GAME_NAMES[gameId || ""]}`,
        });

        if (txError) throw txError;

        const { error: profileError } = await supabase.from("profiles").update({
          [balanceField]: currentBalance - stakeAmount,
        }).eq("id", profile.id);

        if (profileError) throw profileError;

        await refreshProfile();
      } catch (err) {
        console.error(err);
        toast({ title: "Erro ao processar entrada", variant: "destructive" });
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setGameStarted(true);
  };

  const handleGameEnd = async (score: number) => {
    if (profile) {
      try {
        const prizeMultiplier = stakeMode === "cash" ? 1.8 : stakeMode === "credits" ? 1.5 : 0;
        const prizeAmount = stakeAmount > 0 ? Math.round(stakeAmount * prizeMultiplier) : 0;
        const xpGain = 25 + (stakeMode !== "free" ? 15 : 0);

        await supabase.from("matches").insert({
          game_id: gameId || "unknown",
          player1_id: profile.id,
          status: "completed",
          player1_score: score,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          winner_id: profile.id,
          stake_amount: stakeAmount,
          prize_amount: prizeAmount,
        });

        const updates: any = {
          total_matches: (profile.total_matches || 0) + 1,
          total_wins: (profile.total_wins || 0) + 1,
          xp: (profile.xp || 0) + xpGain,
          last_played_at: new Date().toISOString(),
        };

        if (prizeAmount > 0) {
          const wallet = stakeMode === "credits" ? "credits" : "cash";
          const balanceField = stakeMode === "credits" ? "credits_balance" : "cash_balance";
          const currentBalance = stakeMode === "credits" ? profile.credits_balance : Number(profile.cash_balance);
          updates[balanceField] = currentBalance + prizeAmount;

          if (stakeMode === "cash") updates.total_earnings = (Number(profile.total_earnings) || 0) + prizeAmount;

          await supabase.from("transactions").insert({
            user_id: profile.id,
            type: "prize",
            wallet,
            amount: prizeAmount,
            description: `Prêmio - ${GAME_NAMES[gameId || ""]}`,
          });
        }

        await supabase.from("profiles").update(updates).eq("id", profile.id);
        await refreshProfile();

        toast({
          title: prizeAmount > 0 ? "🏆 Vitória!" : "Partida registrada!",
          description: `+${xpGain} XP | ${prizeAmount > 0 ? `Prêmio: ${stakeMode === "cash" ? `R$${prizeAmount}` : `${prizeAmount} cr`}` : `Pontuação: ${score}`}`,
        });
      } catch (err) {
        console.error("Erro ao salvar partida", err);
      }
    } else {
      toast({ title: "Partida finalizada!", description: `Pontuação: ${score}. Faça login para salvar seu progresso.` });
    }
    setGameStarted(false);
    setStakeAmount(0);
    setStakeMode("free");
  };

  const renderGame = () => {
    switch (gameId) {
      case "memory": return <MemoryGame difficulty="medium" onGameEnd={handleGameEnd} />;
      case "quiz": return <QuizGame onGameEnd={handleGameEnd} />;
      case "sudoku": return <SudokuGame onGameEnd={handleGameEnd} />;
      case "puzzle": return <PuzzleGame onGameEnd={handleGameEnd} />;
      case "checkers": return <CheckersGame onGameEnd={handleGameEnd} />;
      case "reversi": return <ReversiGame onGameEnd={handleGameEnd} />;
      case "chess": return <ChessGame onGameEnd={handleGameEnd} />;
      case "go": return <GoGame onGameEnd={handleGameEnd} />;
      default: return (
        <Card className="p-8 text-center">
          <h3 className="font-display text-xl font-bold mb-2">Em Breve!</h3>
          <Button variant="hero" onClick={() => navigate("/games")}>Voltar aos Jogos</Button>
        </Card>
      );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/games")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{GAME_NAMES[gameId || ""] || "Jogo"}</h1>
            </div>

            <AnimatePresence>
              {gameStarted && stakeMode !== "free" && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <Badge className="bg-accent text-accent-foreground px-3 py-1 text-sm md:text-base animate-pulse-glow">
                    <Coins className="w-4 h-4 mr-2" />
                    EM DISPUTA: {stakeMode === "cash" ? `R$${stakeAmount}` : `${stakeAmount} cr`}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!gameStarted ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Configuração da Partida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => { setStakeMode("free"); setStakeAmount(0); }}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        stakeMode === "free" ? "border-primary bg-primary/5 shadow-neon" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Zap className="w-8 h-8 mb-2 text-muted-foreground" />
                      <span className="font-bold">Treino</span>
                      <span className="text-[10px] uppercase text-muted-foreground">Gratuito</span>
                    </button>

                    <button
                      disabled={!profile}
                      onClick={() => { setStakeMode("credits"); setStakeAmount(10); }}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        stakeMode === "credits" ? "border-primary bg-primary/5 shadow-neon" : "border-border hover:border-primary/30"
                      } ${!profile && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <Coins className="w-8 h-8 mb-2 text-primary" />
                      <span className="font-bold">Créditos</span>
                      <span className="text-[10px] uppercase text-muted-foreground">Para diversão</span>
                    </button>

                    <button
                      disabled={!profile}
                      onClick={() => { setStakeMode("cash"); setStakeAmount(5); }}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        stakeMode === "cash" ? "border-accent bg-accent/5 shadow-gold" : "border-border hover:border-accent/30"
                      } ${!profile && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <Trophy className="w-8 h-8 mb-2 text-accent" />
                      <span className="font-bold">Dinheiro</span>
                      <span className="text-[10px] uppercase text-muted-foreground">Prêmios Reais</span>
                    </button>
                  </div>

                  {stakeMode !== "free" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Valor da Entrada</span>
                        <Badge variant="outline" className="font-mono">
                          Saldo: {stakeMode === "credits" ? `${profile?.credits_balance ?? 0} cr` : `R$${profile?.cash_balance ?? 0}`}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {stakeOptions[stakeMode].map((amt) => (
                          <Button 
                            key={amt} 
                            variant={stakeAmount === amt ? "default" : "outline"} 
                            className={`h-12 border-2 ${stakeAmount === amt ? stakeMode === 'cash' ? 'bg-accent border-accent text-accent-foreground' : 'bg-primary border-primary' : ''}`} 
                            onClick={() => setStakeAmount(amt)}
                          >
                            {stakeMode === "cash" ? `R$${amt}` : amt}
                          </Button>
                        ))}
                      </div>

                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold">Retorno Potencial:</p>
                          <p className="text-success font-bold text-lg">
                            {stakeMode === "cash" ? `R$ ${Math.round(stakeAmount * 1.8)}` : `${Math.round(stakeAmount * 1.5)} Créditos`}
                          </p>
                          <p className="text-muted-foreground text-[10px] mt-1">
                            *A taxa da plataforma é aplicada para garantir a manutenção dos servidores e premiações.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button 
                    variant="hero" 
                    size="xl" 
                    className="w-full" 
                    onClick={startGame}
                    disabled={loading || (stakeMode !== "free" && !canAffordStake())}
                  >
                    {loading ? "Processando..." : !canAffordStake() ? "Saldo Insuficiente" : "🔥 Começar Agora"}
                  </Button>
                </CardContent>
              </Card>

              {!profile && (
                <p className="text-center text-sm text-muted-foreground">
                  Faça <Link to="/login" className="text-primary hover:underline font-bold">login</Link> para competir por prêmios e salvar seu ranking.
                </p>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {renderGame()}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}