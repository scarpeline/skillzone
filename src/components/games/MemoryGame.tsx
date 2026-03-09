import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Star, RotateCcw, Zap } from "lucide-react";

const EMOJIS = ["🎮", "🎯", "🏆", "⚡", "🔥", "💎", "🎲", "🃏", "🌟", "🎪", "🎭", "🎨"];

interface MemoryCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

interface MemoryGameProps {
  difficulty?: "easy" | "medium" | "hard";
  onGameEnd: (score: number) => void;
}

export function MemoryGame({ difficulty = "medium", onGameEnd }: MemoryGameProps) {
  const pairCount = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12;
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const initGame = useCallback(() => {
    const selected = EMOJIS.slice(0, pairCount);
    const deck = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setCombo(0);
    setScore(0);
    setTimer(0);
    setGameStarted(false);
    setGameOver(false);
  }, [pairCount]);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (matches === pairCount && pairCount > 0 && gameStarted) {
      setGameOver(true);
      const timeBonus = Math.max(0, 300 - timer * 2);
      const finalScore = score + timeBonus;
      setScore(finalScore);
      onGameEnd(finalScore);
    }
  }, [matches, pairCount, gameStarted]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length >= 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    if (!gameStarted) setGameStarted(true);

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          const updated = [...newCards];
          updated[first].matched = true;
          updated[second].matched = true;
          setCards(updated);
          setFlippedCards([]);
          const newCombo = combo + 1;
          setCombo(newCombo);
          const points = 100 * newCombo;
          setScore(s => s + points);
          setMatches(m => m + 1);
        }, 400);
      } else {
        setTimeout(() => {
          const updated = [...newCards];
          updated[first].flipped = false;
          updated[second].flipped = false;
          setCards(updated);
          setFlippedCards([]);
          setCombo(0);
        }, 800);
      }
    }
  };

  const gridCols = pairCount <= 6 ? "grid-cols-3" : pairCount <= 8 ? "grid-cols-4" : "grid-cols-6";

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" /> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Star className="w-3 h-3" /> {score} pts
          </Badge>
          <Badge variant="outline">Moves: {moves}</Badge>
          {combo > 1 && (
            <Badge className="bg-accent/20 text-accent border-accent/30 gap-1 animate-pulse">
              <Zap className="w-3 h-3" /> Combo x{combo}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={initGame}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reiniciar
        </Button>
      </div>

      {/* Game Grid */}
      <div className={`grid ${gridCols} gap-2 md:gap-3 max-w-lg mx-auto`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className="aspect-square cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {card.flipped || card.matched ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.2 }}
                  className={`w-full h-full rounded-xl flex items-center justify-center text-2xl md:text-4xl border-2 ${
                    card.matched
                      ? "bg-success/20 border-success/50"
                      : "bg-primary/10 border-primary/50"
                  }`}
                >
                  {card.emoji}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -90 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full rounded-xl bg-card border-2 border-border flex items-center justify-center text-2xl hover:border-primary/30 transition-colors"
                >
                  ?
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Game Over */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-6 text-center border-success/50 bg-success/5">
            <h3 className="font-display text-2xl font-bold text-success mb-2">🎉 Parabéns!</h3>
            <p className="text-muted-foreground mb-4">
              Completou em {moves} jogadas e {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </p>
            <div className="font-display text-3xl font-bold text-primary mb-4">{score} pontos</div>
            <Button variant="hero" onClick={initGame}>Jogar Novamente</Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
