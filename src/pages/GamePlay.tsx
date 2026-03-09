import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MemoryGame } from "@/components/games/MemoryGame";
import { QuizGame } from "@/components/games/QuizGame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const GAME_NAMES: Record<string, string> = {
  memory: "Memory Master",
  quiz: "Quiz de Conhecimento",
  chess: "Xadrez",
  checkers: "Damas",
  go: "Go",
  reversi: "Reversi",
  sudoku: "Sudoku Competitivo",
  puzzle: "Puzzle Rush",
};

export default function GamePlay() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleGameEnd = async (score: number) => {
    if (profile) {
      try {
        // Save match
        await supabase.from("matches").insert({
          game_id: gameId || "unknown",
          player1_id: profile.id,
          status: "completed",
          player1_score: score,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          winner_id: profile.id,
        });

        // Update profile stats
        await supabase
          .from("profiles")
          .update({
            total_matches: profile.total_matches + 1,
            total_wins: profile.total_wins + 1,
            xp: profile.xp + 25,
            last_played_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        toast({
          title: "Partida registrada!",
          description: `+25 XP ganhos. Pontuação: ${score}`,
        });
      } catch {
        console.error("Erro ao salvar partida");
      }
    } else {
      toast({
        title: "Partida finalizada!",
        description: `Pontuação: ${score}. Faça login para salvar seus resultados.`,
      });
    }
  };

  const renderGame = () => {
    switch (gameId) {
      case "memory":
        return <MemoryGame difficulty="medium" onGameEnd={handleGameEnd} />;
      case "quiz":
        return <QuizGame onGameEnd={handleGameEnd} />;
      default:
        return (
          <Card className="p-8 text-center">
            <h3 className="font-display text-xl font-bold mb-2">
              {GAME_NAMES[gameId || ""] || "Jogo"} — Em Breve!
            </h3>
            <p className="text-muted-foreground mb-4">
              Este jogo está em desenvolvimento. Experimente Memory Master ou Quiz!
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="hero" onClick={() => navigate("/games/memory/play")}>
                🎴 Memory Master
              </Button>
              <Button variant="outline" onClick={() => navigate("/games/quiz/play")}>
                ❓ Quiz
              </Button>
            </div>
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
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {GAME_NAMES[gameId || ""] || "Jogo"}
            </h1>
          </div>
          {renderGame()}
        </motion.div>
      </div>
    </Layout>
  );
}
