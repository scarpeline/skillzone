import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trophy, RotateCcw, Lightbulb } from "lucide-react";

// ── Tiles ────────────────────────────────────────────────────────────────────

const TILE_SETS = [
  // Bambus
  "🎋1","🎋2","🎋3","🎋4","🎋5","🎋6","🎋7","🎋8","🎋9",
  // Círculos
  "⭕1","⭕2","⭕3","⭕4","⭕5","⭕6","⭕7","⭕8","⭕9",
  // Caracteres
  "🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏",
  // Ventos
  "🀀","🀁","🀂","🀃",
  // Dragões
  "🀄","🀅","🀆",
];

// Emojis visuais para o tabuleiro (mais bonito)
const TILE_DISPLAY: Record<string, string> = {
  "🎋1":"🀐","🎋2":"🀑","🎋3":"🀒","🎋4":"🀓","🎋5":"🀔",
  "🎋6":"🀕","🎋7":"🀖","🎋8":"🀗","🎋9":"🀘",
  "⭕1":"🀙","⭕2":"🀚","⭕3":"🀛","⭕4":"🀜","⭕5":"🀝",
  "⭕6":"🀞","⭕7":"🀟","⭕8":"🀠","⭕9":"🀡",
  "🀇":"🀇","🀈":"🀈","🀉":"🀉","🀊":"🀊","🀋":"🀋",
  "🀌":"🀌","🀍":"🀍","🀎":"🀎","🀏":"🀏",
  "🀀":"🀀","🀁":"🀁","🀂":"🀂","🀃":"🀃",
  "🀄":"🀄","🀅":"🀅","🀆":"🀆",
};

// Layout do tabuleiro Mahjong Solitaire (4 camadas, 144 peças)
// Simplificado: 8x8 grid com 2 camadas = 128 peças (64 pares)
const BOARD_COLS = 8;
const BOARD_ROWS = 8;
const TOTAL_PAIRS = 32; // 32 pares = 64 peças

interface Tile {
  id: number;
  type: string;
  row: number;
  col: number;
  layer: number;
  removed: boolean;
}

function createBoard(): Tile[] {
  // Selecionar 32 tipos únicos (com repetição para pares)
  const types: string[] = [];
  const allTypes = [...TILE_SETS];
  for (let i = 0; i < TOTAL_PAIRS; i++) {
    const t = allTypes[i % allTypes.length];
    types.push(t, t); // par
  }

  // Embaralhar
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  const tiles: Tile[] = [];
  let idx = 0;

  // Camada 0: 8x8 = 64 peças
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      tiles.push({ id: idx, type: types[idx], row, col, layer: 0, removed: false });
      idx++;
    }
  }

  return tiles;
}

function isFree(tile: Tile, tiles: Tile[]): boolean {
  if (tile.removed) return false;

  // Livre se não há peça em cima (camada superior)
  const above = tiles.find(
    t => !t.removed && t.layer > tile.layer && t.row === tile.row && t.col === tile.col
  );
  if (above) return false;

  // Livre se não há peça bloqueando à esquerda E à direita
  const leftBlocked = tiles.some(
    t => !t.removed && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1
  );
  const rightBlocked = tiles.some(
    t => !t.removed && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1
  );

  return !(leftBlocked && rightBlocked);
}

// ── Componente ───────────────────────────────────────────────────────────────

interface MahjongGameProps {
  onGameEnd: (score: number) => void;
}

export function MahjongGame({ onGameEnd }: MahjongGameProps) {
  const [tiles, setTiles] = useState<Tile[]>(createBoard);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [gameOver, setGameOver] = useState(false);
  const [hints, setHints] = useState(3);
  const [hintPair, setHintPair] = useState<[number, number] | null>(null);
  const [combo, setCombo] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState(0);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          onGameEnd(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, score, onGameEnd]);

  // Verificar vitória
  useEffect(() => {
    const remaining = tiles.filter(t => !t.removed).length;
    if (remaining === 0 && !gameOver) {
      setGameOver(true);
      const timeBonus = timeLeft * 2;
      const finalScore = score + timeBonus;
      onGameEnd(finalScore);
    }
  }, [tiles, gameOver, score, timeLeft, onGameEnd]);

  const handleTileClick = useCallback((tile: Tile) => {
    if (tile.removed || !isFree(tile, tiles) || gameOver) return;

    if (!selected) {
      setSelected(tile);
      return;
    }

    if (selected.id === tile.id) {
      setSelected(null);
      return;
    }

    if (selected.type === tile.type) {
      // Match!
      const now = Date.now();
      const timeSinceLast = now - lastMatchTime;
      const newCombo = timeSinceLast < 3000 ? combo + 1 : 1;
      setCombo(newCombo);
      setLastMatchTime(now);

      const baseScore = 100;
      const comboBonus = newCombo > 1 ? baseScore * (newCombo - 1) * 0.5 : 0;
      const points = Math.round(baseScore + comboBonus);

      setScore(s => s + points);
      setMoves(m => m + 1);
      setTiles(prev => prev.map(t =>
        t.id === selected.id || t.id === tile.id ? { ...t, removed: true } : t
      ));
      setSelected(null);
      setHintPair(null);
    } else {
      // Não combina
      setSelected(tile);
      setCombo(0);
    }
  }, [selected, tiles, gameOver, combo, lastMatchTime]);

  const useHint = useCallback(() => {
    if (hints <= 0) return;
    const freeTiles = tiles.filter(t => !t.removed && isFree(t, tiles));
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].type === freeTiles[j].type) {
          setHintPair([freeTiles[i].id, freeTiles[j].id]);
          setHints(h => h - 1);
          setTimeout(() => setHintPair(null), 2000);
          return;
        }
      }
    }
  }, [tiles, hints]);

  const restart = () => {
    setTiles(createBoard());
    setSelected(null);
    setScore(0);
    setMoves(0);
    setTimeLeft(300);
    setGameOver(false);
    setHints(3);
    setHintPair(null);
    setCombo(0);
  };

  const remaining = tiles.filter(t => !t.removed).length;
  const progress = ((TOTAL_PAIRS * 2 - remaining) / (TOTAL_PAIRS * 2)) * 100;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-gradient-to-b from-green-950 to-emerald-950 rounded-2xl p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white">🀄 Mahjong</h2>
          <p className="text-white/60 text-xs">{remaining} peças restantes</p>
        </div>
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <Badge className="bg-yellow-400 text-black animate-pulse">
              x{combo} COMBO!
            </Badge>
          )}
          <div className="flex items-center gap-1 text-white">
            <Clock className="w-4 h-4 text-red-400" />
            <span className={`font-mono font-bold ${timeLeft < 60 ? "text-red-400" : "text-white"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Board */}
      <div
        className="grid gap-1 mb-4"
        style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)` }}
      >
        {tiles.map(tile => {
          const free = isFree(tile, tiles);
          const isSelected = selected?.id === tile.id;
          const isHint = hintPair?.includes(tile.id);

          if (tile.removed) {
            return <div key={tile.id} className="aspect-square" />;
          }

          return (
            <motion.button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              whileTap={free ? { scale: 0.9 } : {}}
              className={`
                aspect-square flex items-center justify-center text-lg rounded-md border-2 transition-all
                ${tile.removed ? "invisible" : ""}
                ${!free ? "opacity-40 cursor-not-allowed border-white/5 bg-white/5" : "cursor-pointer"}
                ${free && !isSelected && !isHint ? "border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40" : ""}
                ${isSelected ? "border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : ""}
                ${isHint ? "border-blue-400 bg-blue-400/20 animate-pulse" : ""}
              `}
            >
              {TILE_DISPLAY[tile.type] || tile.type.slice(0, 2)}
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={useHint}
          disabled={hints <= 0}
          variant="outline"
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Dica ({hints})
        </Button>
        <Button
          onClick={restart}
          variant="outline"
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar
        </Button>
        <Button
          onClick={() => onGameEnd(score)}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white"
        >
          Encerrar
        </Button>
      </div>

      {/* Game Over overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center"
          >
            <div className="text-center p-8">
              <div className="text-6xl mb-4">{remaining === 0 ? "🏆" : "⏰"}</div>
              <h3 className="font-display text-3xl font-bold text-white mb-2">
                {remaining === 0 ? "Parabéns!" : "Tempo Esgotado!"}
              </h3>
              <p className="text-white/70 mb-2">Pontuação: <span className="text-yellow-400 font-bold text-2xl">{score}</span></p>
              <p className="text-white/50 text-sm mb-6">{moves} combinações | {remaining} peças restantes</p>
              <Button onClick={restart} className="bg-yellow-400 text-black hover:bg-yellow-300 mr-3">
                Jogar Novamente
              </Button>
              <Button onClick={() => onGameEnd(score)} variant="outline" className="border-white/20 text-white">
                Sair
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
