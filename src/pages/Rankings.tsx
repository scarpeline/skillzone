import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  Medal,
  Award,
  CheckCircle,
  Minus,
} from "lucide-react";

const globalRankings = [
  { rank: 1, name: "Carlos Silva", username: "carlosmaster", points: 15420, winRate: 78, earnings: 45230, verified: true, trend: 5, avatar: "CS" },
  { rank: 2, name: "Maria Santos", username: "mariachess", points: 14890, winRate: 75, earnings: 38150, verified: true, trend: 2, avatar: "MS" },
  { rank: 3, name: "João Pereira", username: "joaopro", points: 14320, winRate: 72, earnings: 32890, verified: false, trend: -1, avatar: "JP" },
  { rank: 4, name: "Ana Costa", username: "anacosta", points: 13980, winRate: 71, earnings: 28450, verified: true, trend: 3, avatar: "AC" },
  { rank: 5, name: "Pedro Lima", username: "pedrolima", points: 13540, winRate: 69, earnings: 24120, verified: false, trend: 0, avatar: "PL" },
  { rank: 6, name: "Juliana Alves", username: "julialves", points: 13200, winRate: 68, earnings: 21890, verified: true, trend: -2, avatar: "JA" },
  { rank: 7, name: "Ricardo Mendes", username: "ricardogm", points: 12850, winRate: 67, earnings: 19450, verified: false, trend: 4, avatar: "RM" },
  { rank: 8, name: "Fernanda Oliveira", username: "fernandao", points: 12500, winRate: 66, earnings: 17230, verified: true, trend: 1, avatar: "FO" },
  { rank: 9, name: "Bruno Souza", username: "brunosouza", points: 12150, winRate: 65, earnings: 15680, verified: false, trend: -3, avatar: "BS" },
  { rank: 10, name: "Camila Rocha", username: "camilar", points: 11800, winRate: 64, earnings: 14120, verified: true, trend: 2, avatar: "CR" },
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-amber-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="font-display font-bold text-lg text-muted-foreground">{rank}</span>;
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "border-amber-400/50 bg-gradient-to-r from-amber-400/10 to-transparent";
    case 2:
      return "border-gray-300/50 bg-gradient-to-r from-gray-300/10 to-transparent";
    case 3:
      return "border-amber-600/50 bg-gradient-to-r from-amber-600/10 to-transparent";
    default:
      return "border-border";
  }
}

function getTrendBadge(trend: number) {
  if (trend > 0) {
    return (
      <Badge className="bg-success/20 text-success border-success/30">
        <TrendingUp className="w-3 h-3 mr-1" />
        +{trend}
      </Badge>
    );
  } else if (trend < 0) {
    return (
      <Badge className="bg-destructive/20 text-destructive border-destructive/30">
        <TrendingDown className="w-3 h-3 mr-1" />
        {trend}
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <Minus className="w-3 h-3" />
    </Badge>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const Rankings = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4"
          >
            <span className="text-gradient-neon">Rankings</span> Globais
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg"
          >
            Os melhores jogadores da plataforma
          </motion.p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto mb-6 md:mb-8 grid grid-cols-4 h-auto">
            <TabsTrigger value="global" className="text-xs md:text-sm py-2">Global</TabsTrigger>
            <TabsTrigger value="chess" className="text-xs md:text-sm py-2">Xadrez</TabsTrigger>
            <TabsTrigger value="checkers" className="text-xs md:text-sm py-2">Damas</TabsTrigger>
            <TabsTrigger value="season" className="text-xs md:text-sm py-2">Temporada</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            {/* Top 3 Podium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8 max-w-3xl mx-auto"
            >
              {/* 2nd Place */}
              <div className="order-1 md:order-1">
                <div className="bg-card rounded-xl md:rounded-2xl border-2 border-gray-300/50 p-2 md:p-4 text-center mt-4 md:mt-8">
                  <div className="w-10 h-10 md:w-16 md:h-16 mx-auto rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center font-display font-bold text-sm md:text-xl text-gray-800 mb-1 md:mb-2">
                    {globalRankings[1].avatar}
                  </div>
                  <Medal className="w-4 h-4 md:w-6 md:h-6 text-gray-300 mx-auto mb-1 md:mb-2" />
                  <h3 className="font-display font-bold text-xs md:text-base truncate">{globalRankings[1].name}</h3>
                  <p className="text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-2">@{globalRankings[1].username}</p>
                  <p className="font-display font-bold text-xs md:text-lg">{globalRankings[1].points.toLocaleString()}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">pontos</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-2 md:order-2">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl md:rounded-2xl border-2 border-amber-400/50 p-2 md:p-4 text-center">
                  <div className="w-12 h-12 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-display font-bold text-lg md:text-2xl text-amber-900 mb-1 md:mb-2 ring-2 md:ring-4 ring-amber-400/50">
                    {globalRankings[0].avatar}
                  </div>
                  <Crown className="w-5 h-5 md:w-8 md:h-8 text-amber-400 mx-auto mb-1 md:mb-2" />
                  <h3 className="font-display font-bold text-xs md:text-lg truncate">{globalRankings[0].name}</h3>
                  <p className="text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-2">@{globalRankings[0].username}</p>
                  <p className="font-display font-bold text-sm md:text-2xl text-gradient-gold">{globalRankings[0].points.toLocaleString()}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">pontos</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 md:order-3">
                <div className="bg-card rounded-xl md:rounded-2xl border-2 border-amber-600/50 p-2 md:p-4 text-center mt-6 md:mt-12">
                  <div className="w-8 h-8 md:w-14 md:h-14 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-display font-bold text-xs md:text-lg text-amber-100 mb-1 md:mb-2">
                    {globalRankings[2].avatar}
                  </div>
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600 mx-auto mb-1 md:mb-2" />
                  <h3 className="font-display font-bold text-[10px] md:text-sm truncate">{globalRankings[2].name}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">@{globalRankings[2].username}</p>
                  <p className="font-display font-bold text-xs md:text-base">{globalRankings[2].points.toLocaleString()}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">pontos</p>
                </div>
              </div>
            </motion.div>

            {/* Full Rankings Table */}
            <div className="space-y-2 md:space-y-3">
              {globalRankings.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/player/${player.username}`}>
                    <div
                      className={`flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl border bg-card hover:bg-card/80 transition-all ${getRankStyle(player.rank)}`}
                    >
                      {/* Rank */}
                      <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
                        {getRankIcon(player.rank)}
                      </div>

                      {/* Avatar */}
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-xs md:text-base text-primary-foreground flex-shrink-0">
                        {player.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="font-semibold text-sm md:text-base truncate">{player.name}</span>
                          {player.verified && (
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground">@{player.username}</span>
                      </div>

                      {/* Stats - Hidden on very small screens */}
                      <div className="hidden sm:flex items-center gap-4 md:gap-8">
                        <div className="text-right">
                          <div className="font-display font-bold text-sm md:text-base">{player.points.toLocaleString()}</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">Pontos</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-success text-sm md:text-base">{player.winRate}%</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">Vitórias</div>
                        </div>
                        <div className="text-right hidden md:block">
                          <div className="font-semibold text-gradient-gold">{formatCurrency(player.earnings)}</div>
                          <div className="text-xs text-muted-foreground">Ganhos</div>
                        </div>
                      </div>

                      {/* Mobile Stats */}
                      <div className="flex sm:hidden flex-col items-end">
                        <div className="font-display font-bold text-xs">{player.points.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">pts</div>
                      </div>

                      {/* Trend */}
                      <div className="hidden sm:block">{getTrendBadge(player.trend)}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-6 md:mt-8">
              <Button variant="outline" size="lg">
                Carregar mais
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="chess">
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ranking de Xadrez em breve...</p>
            </div>
          </TabsContent>

          <TabsContent value="checkers">
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ranking de Damas em breve...</p>
            </div>
          </TabsContent>

          <TabsContent value="season">
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ranking da Temporada em breve...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Rankings;
