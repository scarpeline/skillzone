import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trophy, Users, Clock, Flame, ArrowRight } from "lucide-react";

const tournaments = [
  {
    id: 1,
    name: "Campeonato Brasileiro de Xadrez",
    game: "Xadrez",
    prizePool: "R$ 25.000",
    players: "128/256",
    startTime: "Em 2 horas",
    status: "hot",
    entryFee: "R$ 50",
  },
  {
    id: 2,
    name: "Torneio Relâmpago de Damas",
    game: "Damas",
    prizePool: "R$ 5.000",
    players: "48/64",
    startTime: "Em 30 min",
    status: "starting",
    entryFee: "R$ 20",
  },
  {
    id: 3,
    name: "Desafio Sudoku Master",
    game: "Sudoku",
    prizePool: "R$ 10.000",
    players: "89/100",
    startTime: "Em 1 hora",
    status: "hot",
    entryFee: "R$ 30",
  },
  {
    id: 4,
    name: "Quiz Night Champions",
    game: "Quiz",
    prizePool: "R$ 8.000",
    players: "156/200",
    startTime: "Hoje 20h",
    status: "open",
    entryFee: "R$ 25",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "hot":
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <Flame className="w-3 h-3 mr-1" />
          Em alta
        </Badge>
      );
    case "starting":
      return (
        <Badge className="bg-success/20 text-success border-success/30">
          <Clock className="w-3 h-3 mr-1" />
          Iniciando
        </Badge>
      );
    default:
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          Aberto
        </Badge>
      );
  }
}

export function TournamentsSection() {
  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold mb-2"
            >
              Torneios <span className="text-gradient-gold">em Destaque</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Participe agora e dispute prêmios incríveis
            </motion.p>
          </div>
          <Link to="/tournaments">
            <Button variant="outline">
              Ver Todos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Tournaments List */}
        <div className="space-y-4">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="group bg-card rounded-xl border border-border p-4 md:p-6 hover:border-primary/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Tournament Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(tournament.status)}
                      <span className="text-sm text-muted-foreground">
                        {tournament.game}
                      </span>
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold group-hover:text-primary transition-colors">
                      {tournament.name}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-8">
                    <div className="text-center">
                      <div className="font-display text-xl md:text-2xl font-bold text-gradient-gold">
                        {tournament.prizePool}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Premiação
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-foreground">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{tournament.players}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Jogadores
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{tournament.startTime}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Início</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">
                        {tournament.entryFee}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Inscrição
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <Button variant="hero" size="default">
                      Participar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
