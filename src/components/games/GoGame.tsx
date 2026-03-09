import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RotateCcw, Flag } from "lucide-react";

interface GoGameProps {
  onGameEnd: (score: number) => void;
}

type Cell = "black" | "white" | null;
type Board = Cell[][];

const SIZE = 9; // 9x9 for beginners

const initBoard = (): Board => Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));

export function GoGame({ onGameEnd }: GoGameProps) {
  const [board, setBoard] = useState<Board>(initBoard);
  const [turn, setTurn] = useState<"black" | "white">("black");
  const [passes, setPasses] = useState(0);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  const getGroup = useCallback((board: Board, row: number, col: number, visited: Set<string> = new Set()): { stones: { row: number; col: number }[]; liberties: number } => {
    const color = board[row][col];
    if (!color) return { stones: [], liberties: 0 };

    const key = `${row},${col}`;
    if (visited.has(key)) return { stones: [], liberties: 0 };
    visited.add(key);

    const stones: { row: number; col: number }[] = [{ row, col }];
    let liberties = 0;

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;

      const neighbor = board[nr][nc];
      if (!neighbor) {
        liberties++;
      } else if (neighbor === color) {
        const result = getGroup(board, nr, nc, visited);
        stones.push(...result.stones);
        liberties += result.liberties;
      }
    }

    return { stones, liberties };
  }, []);

  const removeDeadStones = useCallback((board: Board, color: Cell): { newBoard: Board; removed: number } => {
    const newBoard = board.map(row => [...row]);
    let removed = 0;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (newBoard[r][c] === color) {
          const { stones, liberties } = getGroup(newBoard, r, c);
          if (liberties === 0) {
            for (const stone of stones) {
              newBoard[stone.row][stone.col] = null;
              removed++;
            }
          }
        }
      }
    }

    return { newBoard, removed };
  }, [getGroup]);

  const isValidMove = useCallback((board: Board, row: number, col: number, color: Cell): boolean => {
    if (board[row][col]) return false;

    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = color;

    // Check if captures opponent stones
    const opponent = color === "black" ? "white" : "black";
    const { newBoard, removed } = removeDeadStones(testBoard, opponent);

    if (removed > 0) return true;

    // Check if move has liberties
    const { liberties } = getGroup(newBoard, row, col);
    return liberties > 0;
  }, [getGroup, removeDeadStones]);

  const makeAIMove = useCallback(() => {
    const validMoves: { row: number; col: number }[] = [];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (isValidMove(board, r, c, "white")) {
          validMoves.push({ row: r, col: c });
        }
      }
    }

    if (validMoves.length === 0) {
      setPasses(p => p + 1);
      setTurn("black");
      return;
    }

    // Simple AI: prefer moves near existing stones or center
    const scoredMoves = validMoves.map(move => {
      let score = 0;
      // Prefer center
      const centerDist = Math.abs(move.row - SIZE / 2) + Math.abs(move.col - SIZE / 2);
      score -= centerDist;

      // Prefer moves near existing stones
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = move.row + dr;
        const nc = move.col + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc]) {
          score += 5;
        }
      }

      // Check if captures
      const testBoard = board.map(r => [...r]);
      testBoard[move.row][move.col] = "white";
      const { removed } = removeDeadStones(testBoard, "black");
      score += removed * 10;

      return { ...move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    const move = scoredMoves[0];

    const newBoard = board.map(r => [...r]);
    newBoard[move.row][move.col] = "white";

    const { newBoard: afterCapture, removed } = removeDeadStones(newBoard, "black");
    if (removed > 0) {
      setCaptures(c => ({ ...c, white: c.white + removed }));
    }

    setBoard(afterCapture);
    setLastMove(move);
    setPasses(0);
    setTurn("black");
  }, [board, isValidMove, removeDeadStones]);

  useEffect(() => {
    if (passes >= 2) {
      setGameOver(true);
      // Simple scoring: count stones + captures
      let blackStones = 0, whiteStones = 0;
      for (const row of board) {
        for (const cell of row) {
          if (cell === "black") blackStones++;
          else if (cell === "white") whiteStones++;
        }
      }
      const blackScore = blackStones + captures.black;
      const whiteScore = whiteStones + captures.white + 6.5; // Komi
      onGameEnd(Math.round(blackScore * 10 + (blackScore > whiteScore ? 500 : 0)));
    }
  }, [passes, board, captures, onGameEnd]);

  useEffect(() => {
    if (turn === "white" && !gameOver) {
      const timer = setTimeout(makeAIMove, 500);
      return () => clearTimeout(timer);
    }
  }, [turn, gameOver, makeAIMove]);

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || turn !== "black") return;
    if (!isValidMove(board, row, col, "black")) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = "black";

    const { newBoard: afterCapture, removed } = removeDeadStones(newBoard, "white");
    if (removed > 0) {
      setCaptures(c => ({ ...c, black: c.black + removed }));
    }

    setBoard(afterCapture);
    setLastMove({ row, col });
    setPasses(0);
    setTurn("white");
  };

  const handlePass = () => {
    if (gameOver || turn !== "black") return;
    setPasses(p => p + 1);
    setTurn("white");
  };

  const resetGame = () => {
    setBoard(initBoard());
    setTurn("black");
    setPasses(0);
    setCaptures({ black: 0, white: 0 });
    setGameOver(false);
    setLastMove(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Badge className="bg-gray-900 text-white">⚫ Você: {captures.black}</Badge>
          <Badge variant="outline">⚪ IA: {captures.white}</Badge>
        </div>
        <Badge className={turn === "black" ? "bg-gray-900 text-white" : ""}>
          {turn === "black" ? "Sua vez" : "IA pensando..."}
        </Badge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePass} disabled={turn !== "black"}>
            <Flag className="w-4 h-4 mr-1" /> Passar
          </Button>
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="relative max-w-sm mx-auto">
        <div className="bg-amber-200 p-2 rounded-lg">
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
            {board.map((row, ri) =>
              row.map((cell, ci) => {
                const isLast = lastMove?.row === ri && lastMove?.col === ci;
                return (
                  <button
                    key={`${ri}-${ci}`}
                    onClick={() => handleCellClick(ri, ci)}
                    className="aspect-square relative flex items-center justify-center"
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`absolute bg-amber-900 ${ri === 0 ? "top-1/2" : "top-0"} ${ri === SIZE - 1 ? "bottom-1/2" : "bottom-0"} w-px`} />
                      <div className={`absolute bg-amber-900 ${ci === 0 ? "left-1/2" : "left-0"} ${ci === SIZE - 1 ? "right-1/2" : "right-0"} h-px`} />
                    </div>
                    {/* Star points */}
                    {SIZE === 9 && [2, 4, 6].includes(ri) && [2, 4, 6].includes(ci) && ri === ci && (
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-900" />
                    )}
                    {/* Stone */}
                    {cell && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`z-10 w-[85%] h-[85%] rounded-full shadow-md ${
                          cell === "black" ? "bg-gray-900" : "bg-white border border-gray-300"
                        } ${isLast ? "ring-2 ring-red-500" : ""}`}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Tabuleiro 9x9 • Passe duas vezes para terminar
      </p>

      {/* Game Over */}
      {gameOver && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6 text-center border-primary/50 bg-primary/5">
            <h3 className="font-display text-2xl font-bold mb-2">Jogo Finalizado!</h3>
            <p className="text-muted-foreground mb-4">
              Suas capturas: {captures.black} | IA: {captures.white} (+6.5 komi)
            </p>
            <Button variant="hero" onClick={resetGame}>Jogar Novamente</Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
