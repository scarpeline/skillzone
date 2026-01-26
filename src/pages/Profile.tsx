import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { VipBadge } from "@/components/gamification/VipBadge";
import { XpProgressBar } from "@/components/gamification/XpProgressBar";
import { CurrencyDisplay } from "@/components/gamification/CurrencyDisplay";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { DEFAULT_ACHIEVEMENTS, PlayerCurrency } from "@/lib/gamification";
import {
  CheckCircle,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Star,
  Share2,
  Settings,
  Twitch,
  Youtube,
  Flame,
  Bell,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const performanceData = [
  { month: "Set", ranking: 450, earnings: 1200 },
  { month: "Out", ranking: 380, earnings: 2100 },
  { month: "Nov", ranking: 290, earnings: 3500 },
  { month: "Dez", ranking: 180, earnings: 5200 },
  { month: "Jan", ranking: 120, earnings: 8500 },
];

const achievements = [
  { name: "Primeiro Título", description: "Vença seu primeiro torneio", completed: true, icon: "🏆" },
  { name: "Sequência de Fogo", description: "Vença 5 partidas seguidas", completed: true, icon: "🔥" },
  { name: "Mestre do Xadrez", description: "Vença 50 partidas de xadrez", completed: true, icon: "♛" },
  { name: "Doador Generoso", description: "Doe 100 créditos", completed: false, icon: "💝" },
  { name: "Lenda", description: "Entre no Hall da Fama", completed: false, icon: "⭐" },
  { name: "Investidor", description: "Indique 10 jogadores", completed: false, icon: "📈" },
];

const recentMatches = [
  { game: "Xadrez", opponent: "@mariachess", result: "win", rating: "+15", date: "Hoje" },
  { game: "Quiz", opponent: "@joaopro", result: "win", rating: "+12", date: "Hoje" },
  { game: "Damas", opponent: "@pedrolima", result: "loss", rating: "-8", date: "Ontem" },
  { game: "Xadrez", opponent: "@anacosta", result: "win", rating: "+18", date: "Ontem" },
  { game: "Sudoku", opponent: "Torneio", result: "win", rating: "+25", date: "22 Jan" },
];

// Mock player gamification data
const playerCurrency: PlayerCurrency = { xp: 2450, tokens: 180, tickets: 3 };
const playerXp = 2450;
const playerVipLevel = "gold" as const;
const currentStreak = 12;
const longestStreak = 23;

const playerAchievements = DEFAULT_ACHIEVEMENTS.slice(0, 6).map((a, i) => ({
  ...a,
  progress: i < 4 ? a.requirement : Math.floor(a.requirement * 0.6),
  completed: i < 4,
  unlockedAt: i < 4 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
}));

const Profile = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-card rounded-2xl border border-border overflow-hidden mb-8"
        >
          {/* Banner */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary via-secondary to-primary relative">
            <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-20" />
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-3xl md:text-4xl text-primary-foreground ring-4 ring-background">
                CS
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl md:text-3xl font-bold">Carlos Silva</h1>
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <VipBadge level={playerVipLevel} size="md" />
                  <Badge className="bg-accent/20 text-accent border-accent/30">Top 10</Badge>
                </div>
                <p className="text-muted-foreground mb-2">@carlosmaster</p>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Jogador profissional de xadrez e estratégia. Campeão nacional 2025. 
                  Streaming ao vivo às terças e quintas.
                </p>
                <div className="mt-2">
                  <CurrencyDisplay currency={playerCurrency} size="sm" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link to="/notifications">
                  <Button variant="outline" size="icon">
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="hero">Seguir</Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <Button variant="ghost" size="sm">
                <Twitch className="w-4 h-4 mr-2" />
                Twitch
              </Button>
              <Button variant="ghost" size="sm">
                <Youtube className="w-4 h-4 mr-2" />
                YouTube
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { icon: Trophy, label: "Torneios Vencidos", value: "47", color: "text-accent" },
            { icon: Target, label: "Taxa de Vitória", value: "78%", color: "text-success" },
            { icon: TrendingUp, label: "Ranking Global", value: "#1", color: "text-primary" },
            { icon: Star, label: "Total Ganho", value: "R$ 45.230", color: "text-gradient-gold" },
            { icon: Flame, label: "Sequência", value: `${currentStreak} dias`, color: "text-orange-500" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <Icon className={`w-6 h-6 ${stat.color} mb-2`} />
                  <div className={`font-display text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <XpProgressBar xp={playerXp} size="lg" />
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="w-full max-w-2xl mb-6 grid grid-cols-5">
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="matches">Partidas</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="streak">Sequência</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ranking Evolution */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" reversed />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="ranking"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Ganhos Mensais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => [`R$ ${value}`, "Ganhos"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="hsl(var(--accent))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--accent))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Partidas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMatches.map((match, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{match.game}</Badge>
                        <span>vs {match.opponent}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{match.date}</span>
                        <Badge
                          className={
                            match.result === "win"
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-destructive/20 text-destructive border-destructive/30"
                          }
                        >
                          {match.result === "win" ? "Vitória" : "Derrota"} ({match.rating})
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement}
                />
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/missions">
                <Button variant="outline">Ver Todas as Conquistas</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="streak">
            <StreakDisplay 
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              todayPlayed={true}
            />
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas por Jogo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { game: "Xadrez", matches: 245, wins: 198, winRate: 81 },
                    { game: "Damas", matches: 120, wins: 89, winRate: 74 },
                    { game: "Quiz", matches: 85, wins: 62, winRate: 73 },
                    { game: "Sudoku", matches: 45, wins: 38, winRate: 84 },
                  ].map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{stat.game}</span>
                        <span className="text-sm text-muted-foreground">
                          {stat.wins}/{stat.matches} ({stat.winRate}%)
                        </span>
                      </div>
                      <Progress value={stat.winRate} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Total de Partidas", value: "495" },
                      { label: "Vitórias", value: "387" },
                      { label: "Derrotas", value: "108" },
                      { label: "Torneios Disputados", value: "89" },
                      { label: "Maior Prêmio", value: "R$ 5.000" },
                      { label: "Maior Sequência", value: "23 vitórias" },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
