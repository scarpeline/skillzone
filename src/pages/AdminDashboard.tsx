import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  TrendingUp,
  Trophy,
  Crown,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Mock data
const revenueData = [
  { month: "Jan", revenue: 45000, users: 1200 },
  { month: "Fev", revenue: 52000, users: 1450 },
  { month: "Mar", revenue: 48000, users: 1380 },
  { month: "Abr", revenue: 61000, users: 1720 },
  { month: "Mai", revenue: 55000, users: 1590 },
  { month: "Jun", revenue: 67000, users: 1890 },
];

const retentionData = [
  { day: "D1", rate: 85 },
  { day: "D7", rate: 62 },
  { day: "D14", rate: 48 },
  { day: "D30", rate: 35 },
  { day: "D60", rate: 28 },
  { day: "D90", rate: 22 },
];

const gameRevenueData = [
  { name: "Xadrez", value: 35, color: "#00f0ff" },
  { name: "Damas", value: 25, color: "#f97316" },
  { name: "Quiz", value: 20, color: "#8b5cf6" },
  { name: "Sudoku", value: 12, color: "#22c55e" },
  { name: "Outros", value: 8, color: "#64748b" },
];

const vipDistribution = [
  { level: "Bronze", count: 5420, percentage: 65 },
  { level: "Prata", count: 1850, percentage: 22 },
  { level: "Ouro", count: 680, percentage: 8 },
  { level: "Diamante", count: 320, percentage: 4 },
  { level: "Elite", count: 80, percentage: 1 },
];

const affiliateMetrics = [
  { label: "Afiliados Ativos", value: 1245, change: 12 },
  { label: "Conversão Média", value: "8.5%", change: 2.3 },
  { label: "Volume Gerado", value: "R$ 125K", change: 18 },
  { label: "Comissões Pagas", value: "R$ 15.2K", change: 15 },
];

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl md:text-4xl font-bold mb-2"
            >
              Painel <span className="text-gradient-neon">Administrativo</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Métricas e gestão da plataforma
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            <Badge variant="outline" className="py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Últimos 30 dias
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Users, label: "Usuários Ativos", value: "8,350", change: 12, color: "text-primary" },
            { icon: DollarSign, label: "Receita Mensal", value: "R$ 67K", change: 22, color: "text-success" },
            { icon: Trophy, label: "Torneios Ativos", value: "24", change: 5, color: "text-amber-400" },
            { icon: Crown, label: "Usuários VIP", value: "2,930", change: 18, color: "text-purple-400" },
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change > 0;
            return (
              <Card key={index}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                    <Badge className={isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(kpi.change)}%
                    </Badge>
                  </div>
                  <div className="font-display text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full max-w-2xl mb-6 grid grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="retention">Retenção</TabsTrigger>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Receita e Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.2)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Game Revenue Pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Receita por Jogo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={gameRevenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {gameRevenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {gameRevenueData.map((game) => (
                        <div key={game.name} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: game.color }} />
                          <span>{game.name}</span>
                          <span className="text-muted-foreground">{game.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retention">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Taxa de Retenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={retentionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => [`${value}%`, "Retenção"]}
                        />
                        <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estratégias de Retenção</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Usuários Inativos (7+ dias)", value: 1250, action: "Enviar Notificação" },
                    { label: "Streak Quebrado", value: 340, action: "Oferecer Bônus" },
                    { label: "Carrinho Abandonado", value: 89, action: "Email de Recuperação" },
                    { label: "VIP Prestes a Expirar", value: 156, action: "Promoção Especial" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.value} usuários</div>
                      </div>
                      <Button variant="outline" size="sm">{item.action}</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="affiliates">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {affiliateMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                      <Badge className="bg-success/20 text-success text-[10px]">
                        +{metric.change}%
                      </Badge>
                    </div>
                    <div className="font-display text-xl font-bold">{metric.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Afiliados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Carlos Silva", referrals: 156, volume: 45200, commission: 4520, level: "Diamante" },
                    { name: "Maria Santos", referrals: 98, volume: 32100, commission: 3210, level: "Ouro" },
                    { name: "João Pereira", referrals: 67, volume: 21500, commission: 2150, level: "Ouro" },
                    { name: "Ana Costa", referrals: 45, volume: 15800, commission: 1580, level: "Prata" },
                  ].map((affiliate, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-sm text-primary-foreground">
                          {affiliate.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium">{affiliate.name}</div>
                          <div className="text-sm text-muted-foreground">{affiliate.referrals} indicados</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">R$ {affiliate.volume.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Volume</div>
                        </div>
                        <Badge variant="outline">{affiliate.level}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vip">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Distribuição VIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vipDistribution.map((level) => (
                      <div key={level.level}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{level.level}</span>
                          <span className="text-sm text-muted-foreground">
                            {level.count.toLocaleString()} ({level.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${level.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas VIP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Receita VIP", value: "R$ 42.500", percentage: "63% do total" },
                    { label: "LTV Médio VIP", value: "R$ 1.250", percentage: "3x maior" },
                    { label: "Conversão para VIP", value: "35%", percentage: "+5% este mês" },
                    { label: "Churn VIP", value: "2.5%", percentage: "Abaixo da meta" },
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">{metric.label}</div>
                        <div className="text-sm text-muted-foreground">{metric.percentage}</div>
                      </div>
                      <div className="font-display text-xl font-bold">{metric.value}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
