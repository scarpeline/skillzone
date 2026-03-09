import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Star, RotateCcw, Zap } from "lucide-react";

interface PuzzleGameProps {
  onGameEnd: (score: number) => void;
}

const SIZE = 3;
const TOTAL = SIZE * SIZE;

const generatePuzzle = (): number[] => {
  const tiles = Array.from({ length: TOTAL - 1 }, (_, i) => i + 1);
  tiles.push(0); // Empty tile
  
  // Shuffle with solvability check
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  // Ensure solvable (for 3x3, inversions must be even)
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) inversions++;
    }
  }
  if (inversions % 2 !== 0) {
    // Swap first two non-zero tiles
    const idx1 = tiles.findIndex(t => t !== 0);
    const idx2 = tiles.findIndex((t, i) => t !== 0 && i !== idx1);
    [tiles[idx1], tiles[idx2]] = [tiles[idx2], tiles[idx1]];
  }
  
  return tiles;
};

const isSolved = (tiles: number[]): boolean => {
  for (let i = 0; i < TOTAL - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[TOTAL - 1] === 0;
};

export function PuzzleGame({ onGameEnd }: PuzzleGameProps) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);

  const initGame = useCallback(() => {
    setTiles(generatePuzzle());
    setMoves(0);
    setTimer(0);
    setGameStarted(false);
    setGameOver(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (tiles.length > 0 && isSolved(tiles) && gameStarted) {
      setGameOver(true);
      const timeBonus = Math.max(0, 200 - timer * 2);
      const moveBonus = Math.max(0, 100 - moves);
      const levelBonus = level * 50;
      const finalScore = score + 100 + timeBonus + moveBonus + levelBonus;
      setScore(finalScore);
      onGameEnd(finalScore);
    }
  }, [tiles, gameStarted]);

  const moveTile = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;

    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                       (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (!isAdjacent) return;

    if (!gameStarted) setGameStarted(true);

    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setTiles(newTiles);
    setMoves(m => m + 1);
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    initGame();
  };

  const COLORS = [
    "bg-primary", "bg-accent", "bg-success", "bg-warning",
    "bg-destructive", "bg-secondary", "bg-muted", "bg-primary/80"
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" /> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Star className="w-3 h-3" /> {score} pts
          </Badge>
          <Badge variant="outline">Moves: {moves}</Badge>
          <Badge className="bg-accent/20 text-accent border-accent/30">
            <Zap className="w-3 h-3 mr-1" /> Nível {level}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={initGame}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reiniciar
        </Button>
      </div>

      {/* Puzzle Grid */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {tiles.map((tile, index) => (
          <motion.button
            key={index}
            onClick={() => moveTile(index)}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold transition-all ${
              tile === 0 
                ? "bg-transparent" 
                : `${COLORS[(tile - 1) % COLORS.length]} text-white shadow-lg hover:scale-105`
            }`}
            disabled={tile === 0 || gameOver}
          >
            {tile !== 0 && tile}
          </motion.button>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-muted-foreground">
        Mova as peças para ordenar de 1 a 8
      </p>

      {/* Game Over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6 text-center border-success/50 bg-success/5">
            <h3 className="font-display text-2xl font-bold text-success mb-2">🧩 Puzzle Completo!</h3>
            <p className="text-muted-foreground mb-2">
              Completou em {moves} movimentos e {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </p>
            <div className="font-display text-3xl font-bold text-primary mb-4">{score} pontos</div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={initGame}>Repetir</Button>
              <Button variant="hero" onClick={nextLevel}>Próximo Nível</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
