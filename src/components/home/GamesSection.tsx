import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Trophy, Clock } from "lucide-react";

const games = [
  {
    id: "chess",
    name: "Xadrez",
    description: "O clássico jogo de estratégia",
    players: "12,450",
    tournaments: "45",
    icon: "♛",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "checkers",
    name: "Damas",
    description: "Estratégia rápida e dinâmica",
    players: "8,320",
    tournaments: "32",
    icon: "◉",
    gradient: "from-red-500 to-pink-600",
  },
  {
    id: "go",
    name: "Go",
    description: "Milenar jogo oriental",
    players: "5,670",
    tournaments: "18",
    icon: "⬤",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "reversi",
    name: "Reversi",
    description: "Estratégia de controle territorial",
    players: "3,890",
    tournaments: "12",
    icon: "◐",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Desafio lógico contra o tempo",
    players: "9,120",
    tournaments: "28",
    icon: "⊞",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "quiz",
    name: "Quiz",
    description: "Teste seus conhecimentos",
    players: "15,340",
    tournaments: "52",
    icon: "?",
    gradient: "from-cyan-500 to-blue-600",
  },
];

export function GamesSection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold mb-4"
          >
            Jogos <span className="text-gradient-neon">Disponíveis</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Escolha seu jogo favorito e entre em torneios competitivos. 
            Todos baseados 100% em habilidade.
          </motion.p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/games/${game.id}`}>
                <div className="group relative bg-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                  {/* Game Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {game.icon}
                  </div>

                  {/* Game Info */}
                  <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {game.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      <span>{game.tournaments} torneios</span>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/games">
            <Button variant="outline" size="lg">
              Ver Todos os Jogos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
