import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RotateCcw, Crown, Circle } from "lucide-react";

interface CheckersGameProps {
  onGameEnd: (score: number) => void;
}

type Piece = { player: "red" | "black"; king: boolean } | null;
type Board = Piece[][];

const initBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) board[row][col] = { player: "black", king: false };
        else if (row > 4) board[row][col] = { player: "red", king: false };
      }
    }
  }
  return board;
};

export function CheckersGame({ onGameEnd }: CheckersGameProps) {
  const [board, setBoard] = useState<Board>(initBoard);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [turn, setTurn] = useState<"red" | "black">("red");
  const [validMoves, setValidMoves] = useState<{ row: number; col: number; capture?: { row: number; col: number } }[]>([]);
  const [captures, setCaptures] = useState({ red: 0, black: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"red" | "black" | null>(null);

  const getValidMoves = useCallback((board: Board, row: number, col: number, mustCapture = false): { row: number; col: number; capture?: { row: number; col: number } }[] => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: { row: number; col: number; capture?: { row: number; col: number } }[] = [];
    const directions = piece.king
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.player === "red"
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const jumpRow = row + dr * 2;
      const jumpCol = col + dc * 2;

      // Capture move
      if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
        const middle = board[newRow]?.[newCol];
        if (middle && middle.player !== piece.player && !board[jumpRow][jumpCol]) {
          moves.push({ row: jumpRow, col: jumpCol, capture: { row: newRow, col: newCol } });
        }
      }

      // Normal move (only if not forced to capture)
      if (!mustCapture && newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && !board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      }
    }

    return moves;
  }, []);

  const hasCaptures = useCallback((board: Board, player: "red" | "black"): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.player === player) {
          const moves = getValidMoves(board, r, c, true);
          if (moves.some(m => m.capture)) return true;
        }
      }
    }
    return false;
  }, [getValidMoves]);

  const makeAIMove = useCallback(() => {
    const allMoves: { from: { row: number; col: number }; to: { row: number; col: number; capture?: { row: number; col: number } } }[] = [];
    const mustCapture = hasCaptures(board, "black");

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.player === "black") {
          const moves = getValidMoves(board, r, c, mustCapture);
          for (const move of moves) {
            if (!mustCapture || move.capture) {
              allMoves.push({ from: { row: r, col: c }, to: move });
            }
          }
        }
      }
    }

    if (allMoves.length === 0) {
      setGameOver(true);
      setWinner("red");
      onGameEnd(1000 + captures.red * 100);
      return;
    }

    // Prefer captures
    const captureMoves = allMoves.filter(m => m.to.capture);
    const move = captureMoves.length > 0 
      ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
      : allMoves[Math.floor(Math.random() * allMoves.length)];

    const newBoard = board.map(row => [...row]);
    const piece = newBoard[move.from.row][move.from.col]!;
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;

    if (move.to.capture) {
      newBoard[move.to.capture.row][move.to.capture.col] = null;
      setCaptures(c => ({ ...c, black: c.black + 1 }));
    }

    // King promotion
    if (move.to.row === 7 && piece.player === "black") {
      newBoard[move.to.row][move.to.col] = { ...piece, king: true };
    }

    setBoard(newBoard);
    setTurn("red");
  }, [board, captures, getValidMoves, hasCaptures, onGameEnd]);

  useEffect(() => {
    if (turn === "black" && !gameOver) {
      const timer = setTimeout(makeAIMove, 500);
      return () => clearTimeout(timer);
    }
  }, [turn, gameOver, makeAIMove]);

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || turn !== "red") return;

    const piece = board[row][col];
    const mustCapture = hasCaptures(board, "red");

    if (piece?.player === "red") {
      setSelected({ row, col });
      const moves = getValidMoves(board, row, col, mustCapture);
      setValidMoves(mustCapture ? moves.filter(m => m.capture) : moves);
      return;
    }

    if (selected) {
      const move = validMoves.find(m => m.row === row && m.col === col);
      if (move) {
        const newBoard = board.map(r => [...r]);
        const movingPiece = newBoard[selected.row][selected.col]!;
        newBoard[row][col] = movingPiece;
        newBoard[selected.row][selected.col] = null;

        if (move.capture) {
          newBoard[move.capture.row][move.capture.col] = null;
          setCaptures(c => ({ ...c, red: c.red + 1 }));
        }

        // King promotion
        if (row === 0 && movingPiece.player === "red") {
          newBoard[row][col] = { ...movingPiece, king: true };
        }

        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);

        // Check win
        const blackPieces = newBoard.flat().filter(p => p?.player === "black").length;
        if (blackPieces === 0) {
          setGameOver(true);
          setWinner("red");
          onGameEnd(1000 + captures.red * 100);
          return;
        }

        setTurn("black");
      }
    }
  };

  const resetGame = () => {
    setBoard(initBoard());
    setSelected(null);
    setValidMoves([]);
    setTurn("red");
    setCaptures({ red: 0, black: 0 });
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge className="bg-destructive/20 text-destructive">Você: {captures.red}</Badge>
          <Badge variant="outline">IA: {captures.black}</Badge>
        </div>
        <Badge className={turn === "red" ? "bg-destructive" : "bg-foreground"}>
          {turn === "red" ? "Sua vez" : "IA pensando..."}
        </Badge>
        <Button variant="outline" size="sm" onClick={resetGame}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-8 gap-0 max-w-sm mx-auto border-2 border-border rounded-lg overflow-hidden">
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const isDark = (ri + ci) % 2 === 1;
            const isSelected = selected?.row === ri && selected?.col === ci;
            const isValid = validMoves.some(m => m.row === ri && m.col === ci);
            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleCellClick(ri, ci)}
                className={`aspect-square flex items-center justify-center transition-all ${
                  isDark ? "bg-amber-900/80" : "bg-amber-100"
                } ${isSelected ? "ring-2 ring-primary" : ""} ${isValid ? "ring-2 ring-success" : ""}`}
              >
                {cell && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md ${
                      cell.player === "red" ? "bg-red-600" : "bg-gray-800"
                    }`}
                  >
                    {cell.king && <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />}
                  </motion.div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Game Over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`p-6 text-center ${winner === "red" ? "border-success/50 bg-success/5" : "border-destructive/50"}`}>
            <h3 className="font-display text-2xl font-bold mb-2">
              {winner === "red" ? "🎉 Você Venceu!" : "😞 Você Perdeu!"}
            </h3>
            <p className="text-muted-foreground mb-4">Capturas: {captures.red}</p>
            <Button variant="hero" onClick={resetGame}>Jogar Novamente</Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
