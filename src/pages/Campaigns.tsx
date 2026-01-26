import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Trophy,
  Gift,
  Users,
  Zap,
  Clock,
  Star,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock campaign data
const activeCampaigns = [
  {
    id: "double_commission",
    title: "Comissão Dobrada",
    description: "Ganhe 2x comissão em todas as indicações por 7 dias!",
    type: "affiliate",
    reward: "Comissão 2x",
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    icon: Users,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "welcome_bonus",
    title: "Bônus de Boas-Vindas",
    description: "Novos jogadores ganham 50 créditos no primeiro depósito!",
    type: "promotion",
    reward: "+50 Créditos",
    endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    icon: Gift,
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "xp_weekend",
    title: "XP Dobrado no Fim de Semana",
    description: "Jogue no sábado e domingo e ganhe 2x XP em todas as partidas!",
    type: "event",
    reward: "XP 2x",
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    icon: Zap,
    color: "from-amber-500 to-orange-500",
  },
];

const currentSeason = {
  name: "Temporada de Inverno 2026",
  number: 3,
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-03-31"),
  currentDay: 26,
  totalDays: 90,
  rewards: [
    { position: "Top 1", prize: "R$ 10.000 + Badge Exclusivo" },
    { position: "Top 2-3", prize: "R$ 5.000" },
    { position: "Top 4-10", prize: "R$ 1.000" },
    { position: "Top 11-50", prize: "R$ 500" },
    { position: "Top 51-100", prize: "R$ 200" },
  ],
  leaderboard: [
    { rank: 1, name: "Carlos Silva", points: 15420 },
    { rank: 2, name: "Maria Santos", points: 14890 },
    { rank: 3, name: "João Pereira", points: 14320 },
  ],
};

const upcomingTournaments = [
  {
    name: "Torneio Semanal de Xadrez",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    prize: 5000,
    participants: 128,
    game: "Xadrez",
  },
  {
    name: "Copa Mensal de Damas",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    prize: 10000,
    participants: 256,
    game: "Damas",
  },
  {
    name: "Campeonato Quiz Master",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    prize: 3000,
    participants: 64,
    game: "Quiz",
  },
];

const retentionOffers = [
  {
    title: "Volte a Jogar!",
    description: "Você está ausente há 7 dias. Volte e ganhe 20 créditos grátis!",
    reward: "20 Créditos",
    forInactiveUsers: true,
  },
  {
    title: "Missão de Retorno",
    description: "Complete 3 partidas hoje e ganhe 1 Ticket grátis para torneios!",
    reward: "1 Ticket",
    forInactiveUsers: true,
  },
];

function formatTimeLeft(date: Date): string {
  const diff = date.getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h restantes`;
  return `${hours}h restantes`;
}

const Campaigns = () => {
  const seasonProgress = (currentSeason.currentDay / currentSeason.totalDays) * 100;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold mb-2"
          >
            <span className="text-gradient-neon">Campanhas</span> & Eventos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Promoções especiais, temporadas competitivas e eventos exclusivos
          </motion.p>
        </div>

        {/* Active Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Campanhas Ativas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeCampaigns.map((campaign) => {
              const Icon = campaign.icon;
              return (
                <Card key={campaign.id} className="overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${campaign.color}`} />
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${campaign.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeLeft(campaign.endsAt)}
                          </Badge>
                          <Badge className="bg-success/20 text-success border-success/30">
                            {campaign.reward}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Current Season */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>{currentSeason.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Temporada #{currentSeason.number}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  <Calendar className="w-3 h-3 mr-1" />
                  Dia {currentSeason.currentDay}/{currentSeason.totalDays}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso da Temporada</span>
                  <span>{Math.round(seasonProgress)}%</span>
                </div>
                <Progress value={seasonProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Leaderboard Preview */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Top 3 da Temporada
                  </h4>
                  <div className="space-y-2">
                    {currentSeason.leaderboard.map((player) => (
                      <div key={player.rank} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold w-6">{player.rank}º</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="font-mono text-sm">{player.points.toLocaleString()} pts</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/rankings">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Ver Ranking Completo
                    </Button>
                  </Link>
                </div>

                {/* Rewards */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Prêmios da Temporada
                  </h4>
                  <div className="space-y-2">
                    {currentSeason.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <span className="text-sm">{reward.position}</span>
                        <Badge variant="outline" className="text-xs">{reward.prize}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Próximos Torneios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingTournaments.map((tournament, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <Badge variant="outline" className="mb-2">{tournament.game}</Badge>
                  <h3 className="font-semibold mb-2">{tournament.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data</span>
                      <span>{tournament.date.toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prêmio</span>
                      <span className="text-success font-semibold">R$ {tournament.prize.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vagas</span>
                      <span>{tournament.participants}</span>
                    </div>
                  </div>
                  <Link to="/tournaments">
                    <Button variant="hero" size="sm" className="w-full mt-4">
                      Inscrever-se
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Retention Offers (would be shown to inactive users) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Ofertas Especiais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {retentionOffers.map((offer, index) => (
              <Card key={index} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{offer.title}</h3>
                      <p className="text-sm text-muted-foreground">{offer.description}</p>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30 ml-4">
                      {offer.reward}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Campaigns;
