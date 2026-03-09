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
import { ArrowLeft, Coins, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
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
    if (stakeMode !== "free" && stakeAmount > 0 && profile) {
      // Deduct stake
      const wallet = stakeMode === "credits" ? "credits" : "cash";
      const balanceField = stakeMode === "credits" ? "credits_balance" : "cash_balance";
      const currentBalance = stakeMode === "credits" ? profile.credits_balance : Number(profile.cash_balance);

      await supabase.from("transactions").insert({
        user_id: profile.id, type: "entry", wallet,
        amount: -stakeAmount, description: `Entrada - ${GAME_NAMES[gameId || ""]}`,
      });
      await supabase.from("profiles").update({
        [balanceField]: currentBalance - stakeAmount,
      }).eq("id", profile.id);
      await refreshProfile();
    }
    setGameStarted(true);
  };

  const handleGameEnd = async (score: number) => {
    if (profile) {
      try {
        const prizeMultiplier = stakeMode === "cash" ? 1.8 : stakeMode === "credits" ? 1.5 : 0;
        const prizeAmount = stakeAmount > 0 ? Math.round(stakeAmount * prizeMultiplier) : 0;
        const xpGain = 25 + (stakeMode !== "free" ? 15 : 0);

        await supabase.from("matches").insert({
          game_id: gameId || "unknown", player1_id: profile.id,
          status: "completed", player1_score: score,
          started_at: new Date().toISOString(), ended_at: new Date().toISOString(),
          winner_id: profile.id, stake_amount: stakeAmount, prize_amount: prizeAmount,
        });

        const updates: any = {
          total_matches: profile.total_matches + 1,
          total_wins: profile.total_wins + 1,
          xp: profile.xp + xpGain,
          last_played_at: new Date().toISOString(),
        };

        // Award prize
        if (prizeAmount > 0) {
          const wallet = stakeMode === "credits" ? "credits" : "cash";
          const balanceField = stakeMode === "credits" ? "credits_balance" : "cash_balance";
          const currentBalance = stakeMode === "credits" ? profile.credits_balance : Number(profile.cash_balance);
          updates[balanceField] = currentBalance + prizeAmount;

          if (stakeMode === "cash") updates.total_earnings = Number(profile.total_earnings) + prizeAmount;

          await supabase.from("transactions").insert({
            user_id: profile.id, type: "prize", wallet,
            amount: prizeAmount, description: `Prêmio - ${GAME_NAMES[gameId || ""]}`,
          });
        }

        await supabase.from("profiles").update(updates).eq("id", profile.id);
        await refreshProfile();

        toast({
          title: prizeAmount > 0 ? "🏆 Vitória!" : "Partida registrada!",
          description: prizeAmount > 0
            ? `+${xpGain} XP | Prêmio: ${stakeMode === "cash" ? `R$${prizeAmount}` : `${prizeAmount} créditos`}`
            : `+${xpGain} XP | Pontuação: ${score}`,
        });
      } catch { console.error("Erro ao salvar partida"); }
    } else {
      toast({ title: "Partida finalizada!", description: `Pontuação: ${score}. Faça login para salvar.` });
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
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/games")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{GAME_NAMES[gameId || ""] || "Jogo"}</h1>
            {stakeMode !== "free" && gameStarted && (
              <Badge className="bg-accent/20 text-accent">
                <Coins className="w-3 h-3 mr-1" />
                Apostando {stakeMode === "cash" ? `R$${stakeAmount}` : `${stakeAmount} cr`}
              </Badge>
            )}
          </div>

          {!gameStarted ? (
            <Card className="max-w-lg mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Escolha o Modo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <Button variant={stakeMode === "free" ? "default" : "outline"} className="flex-col h-20"
                    onClick={() => { setStakeMode("free"); setStakeAmount(0); }}>
                    <Zap className="w-5 h-5 mb-1" />
                    <span className="text-xs">Gratuito</span>
                  </Button>
                  <Button variant={stakeMode === "credits" ? "default" : "outline"} className="flex-col h-20"
                    onClick={() => { setStakeMode("credits"); setStakeAmount(10); }} disabled={!profile}>
                    <Coins className="w-5 h-5 mb-1" />
                    <span className="text-xs">Créditos</span>
                  </Button>
                  <Button variant={stakeMode === "cash" ? "default" : "outline"} className="flex-col h-20"
                    onClick={() => { setStakeMode("cash"); setStakeAmount(5); }} disabled={!profile}>
                    <Trophy className="w-5 h-5 mb-1" />
                    <span className="text-xs">Dinheiro</span>
                  </Button>
                </div>

                {stakeMode !== "free" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Saldo: {stakeMode === "credits" ? `${profile?.credits_balance ?? 0} créditos` : `R$${profile?.cash_balance ?? 0}`}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {stakeOptions[stakeMode].map((amt) => (
                        <Button key={amt} variant={stakeAmount === amt ? "default" : "outline"} size="sm"
                          onClick={() => setStakeAmount(amt)}>
                          {stakeMode === "cash" ? `R$${amt}` : `${amt}`}
                        </Button>
                      ))}
                    </div>
                    {stakeAmount > 0 && (
                      <div className="p-3 rounded-lg bg-muted/50 text-sm text-center">
                        <p>Entrada: <strong>{stakeMode === "cash" ? `R$${stakeAmount}` : `${stakeAmount} cr`}</strong></p>
                        <p className="text-success">Prêmio potencial: <strong>
                          {stakeMode === "cash" ? `R$${Math.round(stakeAmount * 1.8)}` : `${Math.round(stakeAmount * 1.5)} cr`}
                        </strong></p>
                      </div>
                    )}
                  </div>
                )}

                <Button variant="hero" className="w-full" onClick={startGame}
                  disabled={stakeMode !== "free" && !canAffordStake()}>
                  {!canAffordStake() && stakeMode !== "free" ? "Saldo Insuficiente" : "Iniciar Partida"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            renderGame()
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
