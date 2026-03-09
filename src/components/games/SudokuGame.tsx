import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Star, RotateCcw, Zap, Check, X } from "lucide-react";

interface SudokuGameProps {
  onGameEnd: (score: number) => void;
}

const generateSudoku = (difficulty: number): { puzzle: number[][], solution: number[][] } => {
  const solution = Array(9).fill(null).map(() => Array(9).fill(0));
  
  const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num || board[x][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  };

  const solve = (board: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve(solution);

  const puzzle = solution.map(row => [...row]);
  const cellsToRemove = difficulty;
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution };
};

export function SudokuGame({ onGameEnd }: SudokuGameProps) {
  const [{ puzzle, solution }, setGame] = useState(() => generateSudoku(40));
  const [board, setBoard] = useState<number[][]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [errors, setErrors] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hints, setHints] = useState(3);

  const initGame = useCallback(() => {
    const newGame = generateSudoku(40);
    setGame(newGame);
    setBoard(newGame.puzzle.map(row => [...row]));
    setSelected(null);
    setErrors(0);
    setScore(0);
    setTimer(0);
    setGameOver(false);
    setHints(3);
  }, []);

  useEffect(() => { initGame(); }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (board.length === 0) return;
    const isComplete = board.every((row, ri) => 
      row.every((cell, ci) => cell === solution[ri][ci])
    );
    if (isComplete) {
      setGameOver(true);
      const timeBonus = Math.max(0, 500 - timer);
      const errorPenalty = errors * 50;
      const finalScore = Math.max(0, 1000 + timeBonus - errorPenalty);
      setScore(finalScore);
      onGameEnd(finalScore);
    }
  }, [board, solution]);

  const handleNumberInput = (num: number) => {
    if (!selected || gameOver) return;
    const { row, col } = selected;
    if (puzzle[row][col] !== 0) return;

    const newBoard = board.map(r => [...r]);
    if (num === solution[row][col]) {
      newBoard[row][col] = num;
      setBoard(newBoard);
      setScore(s => s + 10);
    } else {
      setErrors(e => e + 1);
      if (errors + 1 >= 5) {
        setGameOver(true);
        onGameEnd(score);
      }
    }
  };

  const useHint = () => {
    if (hints <= 0 || !selected || gameOver) return;
    const { row, col } = selected;
    if (board[row][col] !== 0 || puzzle[row][col] !== 0) return;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHints(h => h - 1);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" /> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Star className="w-3 h-3" /> {score} pts
          </Badge>
          <Badge variant="outline" className="gap-1 text-destructive">
            <X className="w-3 h-3" /> {errors}/5
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={useHint} disabled={hints <= 0}>
            <Zap className="w-4 h-4 mr-1" /> Dica ({hints})
          </Button>
          <Button variant="outline" size="sm" onClick={initGame}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-9 gap-px bg-border p-1 rounded-lg max-w-sm mx-auto">
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const isSelected = selected?.row === ri && selected?.col === ci;
            const isOriginal = puzzle[ri]?.[ci] !== 0;
            const borderR = (ci + 1) % 3 === 0 && ci < 8 ? "border-r-2 border-r-primary/30" : "";
            const borderB = (ri + 1) % 3 === 0 && ri < 8 ? "border-b-2 border-b-primary/30" : "";
            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => setSelected({ row: ri, col: ci })}
                className={`aspect-square flex items-center justify-center text-sm md:text-base font-bold transition-colors ${borderR} ${borderB} ${
                  isSelected ? "bg-primary text-primary-foreground" : 
                  isOriginal ? "bg-muted text-foreground" : "bg-card hover:bg-accent/20"
                }`}
              >
                {cell || ""}
              </button>
            );
          })
        )}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-9 gap-1 max-w-sm mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button key={num} variant="outline" size="sm" onClick={() => handleNumberInput(num)} disabled={gameOver}>
            {num}
          </Button>
        ))}
      </div>

      {/* Game Over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`p-6 text-center ${errors >= 5 ? "border-destructive/50" : "border-success/50 bg-success/5"}`}>
            <h3 className="font-display text-2xl font-bold mb-2">
              {errors >= 5 ? "😞 Muitos Erros!" : "🎉 Parabéns!"}
            </h3>
            <div className="font-display text-3xl font-bold text-primary mb-4">{score} pontos</div>
            <Button variant="hero" onClick={initGame}>Jogar Novamente</Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
