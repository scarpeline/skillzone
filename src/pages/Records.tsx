import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Trophy,
  Crown,
  Flame,
  DollarSign,
  Target,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  Zap,
} from "lucide-react";

const platformRecords = [
  {
    id: 1,
    category: "Maior Prêmio Disputado",
    value: "R$ 150.000",
    holder: "Campeonato Nacional de Xadrez 2025",
    holderType: "tournament",
    date: "Dezembro 2025",
    icon: DollarSign,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 2,
    category: "Maior Prêmio Vencido",
    value: "R$ 50.000",
    holder: "Carlos Silva",
    holderUsername: "carlosmaster",
    holderType: "player",
    date: "Dezembro 2025",
    icon: Crown,
    gradient: "from-amber-400 to-amber-600",
    verified: true,
  },
  {
    id: 3,
    category: "Maior Sequência de Vitórias",
    value: "47 vitórias",
    holder: "Maria Santos",
    holderUsername: "mariachess",
    holderType: "player",
    date: "Novembro 2025",
    icon: Flame,
    gradient: "from-red-500 to-orange-600",
    verified: true,
  },
  {
    id: 4,
    category: "Mais Títulos (Geral)",
    value: "156 títulos",
    holder: "Carlos Silva",
    holderUsername: "carlosmaster",
    holderType: "player",
    date: "Janeiro 2026",
    icon: Trophy,
    gradient: "from-primary to-secondary",
    verified: true,
  },
  {
    id: 5,
    category: "Mais Títulos de Xadrez",
    value: "89 títulos",
    holder: "Carlos Silva",
    holderUsername: "carlosmaster",
    holderType: "player",
    date: "Janeiro 2026",
    icon: Award,
    gradient: "from-emerald-500 to-teal-600",
    verified: true,
  },
  {
    id: 6,
    category: "Mais Títulos de Damas",
    value: "67 títulos",
    holder: "João Pereira",
    holderUsername: "joaopro",
    holderType: "player",
    date: "Janeiro 2026",
    icon: Target,
    gradient: "from-blue-500 to-indigo-600",
    verified: false,
  },
  {
    id: 7,
    category: "Torneio com Mais Participantes",
    value: "1.024 jogadores",
    holder: "Copa Brasil de Quiz 2025",
    holderType: "tournament",
    date: "Outubro 2025",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: 8,
    category: "Partida Mais Rápida (Xadrez)",
    value: "47 segundos",
    holder: "Ana Costa",
    holderUsername: "anacosta",
    holderType: "player",
    date: "Setembro 2025",
    icon: Zap,
    gradient: "from-cyan-500 to-blue-600",
    verified: true,
  },
];

const recentRecordsBroken = [
  {
    record: "Maior Sequência de Vitórias em Quiz",
    oldValue: "28 vitórias",
    newValue: "35 vitórias",
    player: "Pedro Lima",
    username: "pedrolima",
    date: "20 Jan 2026",
  },
  {
    record: "Mais Pontos em uma Temporada",
    oldValue: "12.450 pts",
    newValue: "15.890 pts",
    player: "Carlos Silva",
    username: "carlosmaster",
    date: "15 Jan 2026",
  },
  {
    record: "Melhor Taxa de Vitória (min. 100 partidas)",
    oldValue: "85%",
    newValue: "87%",
    player: "Maria Santos",
    username: "mariachess",
    date: "10 Jan 2026",
  },
];

function formatCurrency(value: string) {
  return value;
}

const Records = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 md:mb-6 glow-cyan"
          >
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4"
          >
            Recordes da <span className="text-gradient-neon">Plataforma</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
          >
            Os feitos mais impressionantes e marcas históricas da SkillZone.
            Atualizados automaticamente em tempo real.
          </motion.p>
        </div>

        {/* Main Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          {platformRecords.map((record, index) => {
            const Icon = record.icon;
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:border-primary/50 transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header with gradient */}
                    <div className={`h-2 bg-gradient-to-r ${record.gradient}`} />
                    
                    <div className="p-4 md:p-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${record.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                            {record.category}
                          </p>
                          <p className="font-display text-2xl md:text-3xl font-bold text-gradient-neon mb-2">
                            {record.value}
                          </p>
                          
                          {record.holderType === "player" ? (
                            <Link
                              to={`/player/${record.holderUsername}`}
                              className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                            >
                              <span className="font-medium truncate">{record.holder}</span>
                              {record.verified && (
                                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                            </Link>
                          ) : (
                            <span className="font-medium text-sm">{record.holder}</span>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{record.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recently Broken Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Flame className="w-5 h-5 text-destructive" />
            <h2 className="font-display text-xl md:text-2xl font-bold">Recordes Recentes Quebrados</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {recentRecordsBroken.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-r from-destructive/5 to-transparent border-destructive/20">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold mb-1 text-sm md:text-base">{item.record}</h3>
                        <Link
                          to={`/player/${item.username}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          por {item.player}
                        </Link>
                      </div>

                      <div className="flex items-center gap-3 md:gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Antigo</p>
                          <p className="font-medium text-muted-foreground line-through text-sm">{item.oldValue}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-destructive mb-1">Novo!</p>
                          <p className="font-display font-bold text-destructive text-sm md:text-base">{item.newValue}</p>
                        </div>
                        <Badge variant="outline" className="hidden sm:flex text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {item.date}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 md:mt-12 p-4 md:p-6 bg-muted/50 rounded-2xl border border-border"
        >
          <h3 className="font-display font-bold mb-2 text-sm md:text-base">Como funcionam os recordes?</h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
            Todos os recordes são atualizados automaticamente pelo sistema após cada partida e torneio.
            Para aparecer em categorias individuais, o jogador precisa ter no mínimo 50 partidas registradas.
            Recordes de temporada são resetados a cada 3 meses, mas os recordes históricos são permanentes.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Records;
