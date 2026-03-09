import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

interface ChessGameProps {
  onGameEnd: (score: number) => void;
}

type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type Color = "white" | "black";
type Piece = { type: PieceType; color: Color } | null;
type Board = Piece[][];

const PIECES: Record<string, string> = {
  "white-king": "♔", "white-queen": "♕", "white-rook": "♖",
  "white-bishop": "♗", "white-knight": "♘", "white-pawn": "♙",
  "black-king": "♚", "black-queen": "♛", "black-rook": "♜",
  "black-bishop": "♝", "black-knight": "♞", "black-pawn": "♟",
};

const initBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  const order: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: order[i], color: "black" };
    board[1][i] = { type: "pawn", color: "black" };
    board[6][i] = { type: "pawn", color: "white" };
    board[7][i] = { type: order[i], color: "white" };
  }
  return board;
};

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0
};

export function ChessGame({ onGameEnd }: ChessGameProps) {
  const [board, setBoard] = useState<Board>(initBoard);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [turn, setTurn] = useState<Color>("white");
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([]);
  const [captured, setCaptured] = useState<{ white: Piece[]; black: Piece[] }>({ white: [], black: [] });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);

  const isInBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  const getBasicMoves = useCallback((board: Board, row: number, col: number): { row: number; col: number }[] => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: { row: number; col: number }[] = [];
    const { type, color } = piece;
    const dir = color === "white" ? -1 : 1;

    const addIfValid = (r: number, c: number, mustCapture = false, mustBeEmpty = false) => {
      if (!isInBounds(r, c)) return false;
      const target = board[r][c];
      if (mustBeEmpty && target) return false;
      if (mustCapture && (!target || target.color === color)) return false;
      if (!mustCapture && !mustBeEmpty && target?.color === color) return false;
      moves.push({ row: r, col: c });
      return !target;
    };

    const addLine = (dr: number, dc: number) => {
      for (let i = 1; i < 8; i++) {
        if (!addIfValid(row + dr * i, col + dc * i)) break;
      }
    };

    switch (type) {
      case "pawn":
        if (addIfValid(row + dir, col, false, true)) {
          const startRow = color === "white" ? 6 : 1;
          if (row === startRow) addIfValid(row + dir * 2, col, false, true);
        }
        addIfValid(row + dir, col - 1, true);
        addIfValid(row + dir, col + 1, true);
        break;
      case "knight":
        [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
          .forEach(([dr, dc]) => addIfValid(row + dr, col + dc));
        break;
      case "bishop":
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => addLine(dr, dc));
        break;
      case "rook":
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addLine(dr, dc));
        break;
      case "queen":
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
          .forEach(([dr, dc]) => addLine(dr, dc));
        break;
      case "king":
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
          .forEach(([dr, dc]) => addIfValid(row + dr, col + dc));
        break;
    }

    return moves;
  }, []);

  const makeAIMove = useCallback(() => {
    // Simple AI: capture highest value piece, else random move
    let bestMove: { from: { row: number; col: number }; to: { row: number; col: number }; value: number } | null = null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === "black") {
          const moves = getBasicMoves(board, r, c);
          for (const move of moves) {
            const target = board[move.row][move.col];
            const value = target ? PIECE_VALUES[target.type] : 0;
            if (!bestMove || value > bestMove.value || (value === bestMove.value && Math.random() > 0.5)) {
              bestMove = { from: { row: r, col: c }, to: move, value };
            }
          }
        }
      }
    }

    if (!bestMove) {
      setGameOver(true);
      setWinner("white");
      onGameEnd(1000 + captured.white.reduce((sum, p) => sum + (p ? PIECE_VALUES[p.type] : 0), 0) * 50);
      return;
    }

    const newBoard = board.map(row => [...row]);
    const piece = newBoard[bestMove.from.row][bestMove.from.col]!;
    const capturedPiece = newBoard[bestMove.to.row][bestMove.to.col];

    newBoard[bestMove.to.row][bestMove.to.col] = piece;
    newBoard[bestMove.from.row][bestMove.from.col] = null;

    // Pawn promotion
    if (piece.type === "pawn" && bestMove.to.row === 7) {
      newBoard[bestMove.to.row][bestMove.to.col] = { type: "queen", color: "black" };
    }

    if (capturedPiece) {
      setCaptured(c => ({ ...c, black: [...c.black, capturedPiece] }));
      if (capturedPiece.type === "king") {
        setGameOver(true);
        setWinner("black");
        onGameEnd(0);
        return;
      }
    }

    setBoard(newBoard);
    setTurn("white");
  }, [board, captured, getBasicMoves, onGameEnd]);

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || turn !== "white") return;

    const piece = board[row][col];

    if (piece?.color === "white") {
      setSelected({ row, col });
      setValidMoves(getBasicMoves(board, row, col));
      return;
    }

    if (selected && validMoves.some(m => m.row === row && m.col === col)) {
      const newBoard = board.map(r => [...r]);
      const movingPiece = newBoard[selected.row][selected.col]!;
      const capturedPiece = newBoard[row][col];

      newBoard[row][col] = movingPiece;
      newBoard[selected.row][selected.col] = null;

      // Pawn promotion
      if (movingPiece.type === "pawn" && row === 0) {
        newBoard[row][col] = { type: "queen", color: "white" };
      }

      if (capturedPiece) {
        setCaptured(c => ({ ...c, white: [...c.white, capturedPiece] }));
        if (capturedPiece.type === "king") {
          setGameOver(true);
          setWinner("white");
          onGameEnd(1000 + captured.white.reduce((sum, p) => sum + (p ? PIECE_VALUES[p.type] : 0), 0) * 50);
          setBoard(newBoard);
          return;
        }
      }

      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);
      setTurn("black");
      setTimeout(makeAIMove, 500);
    }
  };

  const resetGame = () => {
    setBoard(initBoard());
    setSelected(null);
    setValidMoves([]);
    setTurn("white");
    setCaptured({ white: [], black: [] });
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Badge variant="outline">
            Capturadas: {captured.white.map(p => p ? PIECES[`black-${p.type}`] : "").join("")}
          </Badge>
        </div>
        <Badge className={turn === "white" ? "bg-white text-black" : "bg-gray-900"}>
          {turn === "white" ? "Sua vez" : "IA pensando..."}
        </Badge>
        <Button variant="outline" size="sm" onClick={resetGame}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-8 gap-0 max-w-sm mx-auto border-2 border-border rounded-lg overflow-hidden">
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const isLight = (ri + ci) % 2 === 0;
            const isSelected = selected?.row === ri && selected?.col === ci;
            const isValid = validMoves.some(m => m.row === ri && m.col === ci);
            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleCellClick(ri, ci)}
                className={`aspect-square flex items-center justify-center text-2xl md:text-3xl transition-all ${
                  isLight ? "bg-amber-100" : "bg-amber-800"
                } ${isSelected ? "ring-2 ring-primary ring-inset" : ""} ${isValid ? "ring-2 ring-success ring-inset" : ""}`}
              >
                {cell && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cell.color === "white" ? "drop-shadow-md" : ""}
                  >
                    {PIECES[`${cell.color}-${cell.type}`]}
                  </motion.span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Captured by AI */}
      {captured.black.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          IA capturou: {captured.black.map(p => p ? PIECES[`white-${p.type}`] : "").join("")}
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`p-6 text-center ${winner === "white" ? "border-success/50 bg-success/5" : "border-destructive/50"}`}>
            <h3 className="font-display text-2xl font-bold mb-2">
              {winner === "white" ? "♔ Você Venceu!" : "😞 Xeque-Mate!"}
            </h3>
            <Button variant="hero" onClick={resetGame}>Jogar Novamente</Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
