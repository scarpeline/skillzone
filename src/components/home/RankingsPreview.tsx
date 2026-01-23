import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, ArrowRight, Crown, Medal, Award, CheckCircle } from "lucide-react";

const topPlayers = [
  {
    rank: 1,
    name: "Carlos Silva",
    username: "@carlosmaster",
    avatar: "CS",
    points: 15420,
    winRate: "78%",
    earnings: "R$ 45.230",
    verified: true,
    trend: "+5",
  },
  {
    rank: 2,
    name: "Maria Santos",
    username: "@mariachess",
    avatar: "MS",
    points: 14890,
    winRate: "75%",
    earnings: "R$ 38.150",
    verified: true,
    trend: "+2",
  },
  {
    rank: 3,
    name: "João Pereira",
    username: "@joaopro",
    avatar: "JP",
    points: 14320,
    winRate: "72%",
    earnings: "R$ 32.890",
    verified: false,
    trend: "-1",
  },
  {
    rank: 4,
    name: "Ana Costa",
    username: "@anacosta",
    avatar: "AC",
    points: 13980,
    winRate: "71%",
    earnings: "R$ 28.450",
    verified: true,
    trend: "+3",
  },
  {
    rank: 5,
    name: "Pedro Lima",
    username: "@pedrolima",
    avatar: "PL",
    points: 13540,
    winRate: "69%",
    earnings: "R$ 24.120",
    verified: false,
    trend: "0",
  },
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-accent" />;
    case 2:
      return <Medal className="w-5 h-5 text-muted-foreground" />;
    case 3:
      return <Award className="w-5 h-5 text-accent" />;
    default:
      return <span className="font-display font-bold text-muted-foreground">{rank}</span>;
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "border-accent/50 bg-accent/5";
    case 2:
      return "border-muted/50 bg-muted/5";
    case 3:
      return "border-accent/50 bg-accent/5";
    default:
      return "border-border";
  }
}

export function RankingsPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Rankings Table */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">
                  Ranking <span className="text-gradient-neon">Global</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  Os melhores jogadores da plataforma
                </p>
              </div>
              <Link to="/rankings">
                <Button variant="ghost" size="sm">
                  Ver Completo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="space-y-3">
              {topPlayers.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/player/${player.username.slice(1)}`}>
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-card/80 transition-all ${getRankStyle(player.rank)}`}
                    >
                      {/* Rank */}
                      <div className="w-8 h-8 flex items-center justify-center">
                        {getRankIcon(player.rank)}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-primary-foreground">
                        {player.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">
                            {player.name}
                          </span>
                          {player.verified && (
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {player.username}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-display font-bold">
                            {player.points.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pontos
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-success">
                            {player.winRate}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Vitórias
                          </div>
                        </div>
                      </div>

                      {/* Trend */}
                      <div className="flex items-center">
                        {player.trend.startsWith("+") ? (
                          <Badge className="bg-success/20 text-success border-success/30">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {player.trend}
                          </Badge>
                        ) : player.trend === "0" ? (
                          <Badge variant="outline">—</Badge>
                        ) : (
                          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                            {player.trend}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Records & Hall of Fame Preview */}
          <div className="space-y-8">
            {/* Records */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-xl font-bold mb-4">
                Recordes da <span className="text-gradient-gold">Plataforma</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Maior Prêmio", value: "R$ 125.000", holder: "@carlosmaster" },
                  { label: "Sequência de Vitórias", value: "47 vitórias", holder: "@mariachess" },
                  { label: "Mais Títulos", value: "156 títulos", holder: "@carlosmaster" },
                  { label: "Maior Pool", value: "R$ 500.000", holder: "Campeonato Nacional" },
                ].map((record, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-xl border border-border p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="font-display text-xl md:text-2xl font-bold text-gradient-gold mb-1">
                      {record.value}
                    </div>
                    <div className="text-sm text-foreground mb-1">{record.label}</div>
                    <div className="text-xs text-muted-foreground">{record.holder}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hall of Fame Teaser */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">Hall da Fama</h3>
                      <p className="text-sm text-muted-foreground">Lendas da plataforma</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    Conheça os jogadores que fizeram história e entraram para a eternidade.
                  </p>
                  
                  <Link to="/hall-of-fame">
                    <Button variant="gold" size="sm">
                      Explorar
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
