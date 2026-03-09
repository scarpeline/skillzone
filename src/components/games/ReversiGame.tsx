import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

interface ReversiGameProps {
  onGameEnd: (score: number) => void;
}

type Cell = "black" | "white" | null;
type Board = Cell[][];

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0], [1, 1]
];

const initBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";
  return board;
};

export function ReversiGame({ onGameEnd }: ReversiGameProps) {
  const [board, setBoard] = useState<Board>(initBoard);
  const [turn, setTurn] = useState<"black" | "white">("black");
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ black: 2, white: 2 });

  const getFlips = useCallback((board: Board, row: number, col: number, player: Cell): { row: number; col: number }[] => {
    if (!player || board[row][col]) return [];
    const opponent = player === "black" ? "white" : "black";
    const allFlips: { row: number; col: number }[] = [];

    for (const [dr, dc] of DIRECTIONS) {
      const flips: { row: number; col: number }[] = [];
      let r = row + dr;
      let c = col + dc;

      while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
        flips.push({ row: r, col: c });
        r += dr;
        c += dc;
      }

      if (flips.length > 0 && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
        allFlips.push(...flips);
      }
    }

    return allFlips;
  }, []);

  const getValidMoves = useCallback((board: Board, player: Cell): { row: number; col: number }[] => {
    const moves: { row: number; col: number }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (getFlips(board, r, c, player).length > 0) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }, [getFlips]);

  const countPieces = useCallback((board: Board) => {
    let black = 0, white = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === "black") black++;
        else if (cell === "white") white++;
      }
    }
    return { black, white };
  }, []);

  useEffect(() => {
    const moves = getValidMoves(board, turn);
    setValidMoves(moves);

    if (moves.length === 0) {
      const opponentMoves = getValidMoves(board, turn === "black" ? "white" : "black");
      if (opponentMoves.length === 0) {
        setGameOver(true);
        const counts = countPieces(board);
        setScores(counts);
        const playerScore = counts.black;
        onGameEnd(playerScore * 10 + (counts.black > counts.white ? 500 : 0));
      } else {
        setTurn(t => t === "black" ? "white" : "black");
      }
    }
  }, [board, turn, getValidMoves, countPieces, onGameEnd]);

  const makeAIMove = useCallback(() => {
    if (turn !== "white" || gameOver) return;

    const moves = getValidMoves(board, "white");
    if (moves.length === 0) return;

    // Simple AI: prefer corners, then edges, then most flips
    const corners = moves.filter(m => 
      (m.row === 0 || m.row === 7) && (m.col === 0 || m.col === 7)
    );
    const edges = moves.filter(m =>
      m.row === 0 || m.row === 7 || m.col === 0 || m.col === 7
    );

    let bestMove = moves[0];
    let maxFlips = 0;

    if (corners.length > 0) {
      bestMove = corners[Math.floor(Math.random() * corners.length)];
    } else if (edges.length > 0) {
      bestMove = edges[Math.floor(Math.random() * edges.length)];
    } else {
      for (const move of moves) {
        const flips = getFlips(board, move.row, move.col, "white").length;
        if (flips > maxFlips) {
          maxFlips = flips;
          bestMove = move;
        }
      }
    }

    const flips = getFlips(board, bestMove.row, bestMove.col, "white");
    const newBoard = board.map(row => [...row]);
    newBoard[bestMove.row][bestMove.col] = "white";
    for (const flip of flips) {
      newBoard[flip.row][flip.col] = "white";
    }
    setBoard(newBoard);
    setScores(countPieces(newBoard));
    setTurn("black");
  }, [board, turn, gameOver, getValidMoves, getFlips, countPieces]);

  useEffect(() => {
    if (turn === "white" && !gameOver) {
      const timer = setTimeout(makeAIMove, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, gameOver, makeAIMove]);

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || turn !== "black") return;
    if (!validMoves.some(m => m.row === row && m.col === col)) return;

    const flips = getFlips(board, row, col, "black");
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = "black";
    for (const flip of flips) {
      newBoard[flip.row][flip.col] = "black";
    }
    setBoard(newBoard);
    setScores(countPieces(newBoard));
    setTurn("white");
  };

  const resetGame = () => {
    setBoard(initBoard());
    setTurn("black");
    setGameOver(false);
    setScores({ black: 2, white: 2 });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge className="bg-gray-900 text-white">⚫ Você: {scores.black}</Badge>
          <Badge variant="outline">⚪ IA: {scores.white}</Badge>
        </div>
        <Badge className={turn === "black" ? "bg-gray-900 text-white" : ""}>
          {turn === "black" ? "Sua vez" : "IA pensando..."}
        </Badge>
        <Button variant="outline" size="sm" onClick={resetGame}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-8 gap-0.5 bg-emerald-800 p-1 rounded-lg max-w-sm mx-auto">
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const isValid = validMoves.some(m => m.row === ri && m.col === ci);
            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleCellClick(ri, ci)}
                className={`aspect-square bg-emerald-700 flex items-center justify-center transition-all ${
                  isValid ? "ring-2 ring-inset ring-yellow-400" : ""
                } hover:bg-emerald-600`}
              >
                {cell && (
                  <motion.div
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full shadow-lg ${
                      cell === "black" ? "bg-gray-900" : "bg-white"
                    }`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Game Over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`p-6 text-center ${scores.black > scores.white ? "border-success/50 bg-success/5" : "border-destructive/50"}`}>
            <h3 className="font-display text-2xl font-bold mb-2">
              {scores.black > scores.white ? "🎉 Você Venceu!" : scores.black < scores.white ? "😞 Você Perdeu!" : "🤝 Empate!"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Placar Final: {scores.black} x {scores.white}
            </p>
            <div className="font-display text-3xl font-bold text-primary mb-4">
              {scores.black * 10 + (scores.black > scores.white ? 500 : 0)} pontos
            </div>
            <Button variant="hero" onClick={resetGame}>Jogar Novamente</Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
