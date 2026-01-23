import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Users, Trophy, Play, Star, Clock } from "lucide-react";

const games = [
  {
    id: "chess",
    name: "Xadrez",
    description: "O clássico jogo de estratégia que desafia mentes há séculos. Domine a arte do xeque-mate.",
    players: "12,450",
    tournaments: "45",
    activeTournaments: 5,
    icon: "♛",
    gradient: "from-amber-500 to-orange-600",
    difficulty: "Avançado",
    avgGameTime: "15-45 min",
    rating: 4.9,
  },
  {
    id: "checkers",
    name: "Damas",
    description: "Estratégia rápida e dinâmica. Capture todas as peças do adversário e conquiste a vitória.",
    players: "8,320",
    tournaments: "32",
    activeTournaments: 3,
    icon: "◉",
    gradient: "from-red-500 to-pink-600",
    difficulty: "Intermediário",
    avgGameTime: "10-20 min",
    rating: 4.7,
  },
  {
    id: "go",
    name: "Go",
    description: "Milenar jogo oriental de território. Simplicidade nas regras, profundidade infinita.",
    players: "5,670",
    tournaments: "18",
    activeTournaments: 2,
    icon: "⬤",
    gradient: "from-emerald-500 to-teal-600",
    difficulty: "Expert",
    avgGameTime: "30-60 min",
    rating: 4.8,
  },
  {
    id: "reversi",
    name: "Reversi",
    description: "Estratégia de controle territorial. Vire as peças e domine o tabuleiro.",
    players: "3,890",
    tournaments: "12",
    activeTournaments: 1,
    icon: "◐",
    gradient: "from-blue-500 to-indigo-600",
    difficulty: "Intermediário",
    avgGameTime: "15-25 min",
    rating: 4.5,
  },
  {
    id: "sudoku",
    name: "Sudoku Competitivo",
    description: "Desafio lógico contra o tempo. Complete o grid antes do oponente.",
    players: "9,120",
    tournaments: "28",
    activeTournaments: 4,
    icon: "⊞",
    gradient: "from-violet-500 to-purple-600",
    difficulty: "Variável",
    avgGameTime: "5-15 min",
    rating: 4.6,
  },
  {
    id: "quiz",
    name: "Quiz de Conhecimento",
    description: "Teste seus conhecimentos em diversas categorias. Velocidade e precisão contam!",
    players: "15,340",
    tournaments: "52",
    activeTournaments: 8,
    icon: "?",
    gradient: "from-cyan-500 to-blue-600",
    difficulty: "Variável",
    avgGameTime: "5-10 min",
    rating: 4.8,
  },
  {
    id: "puzzle",
    name: "Puzzle Rush",
    description: "Resolva puzzles em sequência contra o relógio. Quanto mais rápido, mais pontos!",
    players: "6,780",
    tournaments: "22",
    activeTournaments: 3,
    icon: "⧉",
    gradient: "from-pink-500 to-rose-600",
    difficulty: "Intermediário",
    avgGameTime: "3-10 min",
    rating: 4.4,
  },
  {
    id: "memory",
    name: "Memory Master",
    description: "Teste sua memória em competições intensas. Encontre os pares antes do tempo acabar.",
    players: "4,520",
    tournaments: "15",
    activeTournaments: 2,
    icon: "🎴",
    gradient: "from-yellow-500 to-amber-600",
    difficulty: "Fácil",
    avgGameTime: "2-5 min",
    rating: 4.3,
  },
];

const Games = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold mb-4"
          >
            Escolha Seu <span className="text-gradient-neon">Jogo</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Todos os nossos jogos são 100% baseados em habilidade. Sem sorte, apenas estratégia.
          </motion.p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                {/* Header with gradient */}
                <div className={`h-24 bg-gradient-to-r ${game.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-grid-pattern bg-[size:20px_20px] opacity-20" />
                  <div className="absolute top-4 left-4 text-5xl opacity-80">{game.icon}</div>
                  {game.activeTournaments > 0 && (
                    <Badge className="absolute top-4 right-4 bg-background/90 text-foreground">
                      <Trophy className="w-3 h-3 mr-1" />
                      {game.activeTournaments} torneios ativos
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{game.rating}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{game.description}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{game.players} jogadores</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{game.avgGameTime}</span>
                    </div>
                    <Badge variant="outline">{game.difficulty}</Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link to={`/games/${game.id}/play`} className="flex-1">
                      <Button variant="hero" className="w-full">
                        <Play className="w-4 h-4" />
                        Jogar
                      </Button>
                    </Link>
                    <Link to={`/tournaments?game=${game.id}`}>
                      <Button variant="outline">
                        <Trophy className="w-4 h-4" />
                        Torneios
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Games;
