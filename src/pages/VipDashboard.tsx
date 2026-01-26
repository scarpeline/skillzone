import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VipBadge } from "@/components/gamification/VipBadge";
import { VIP_LEVELS, VipLevel, getVipLevel } from "@/lib/gamification";
import { Crown, TrendingUp, Wallet, Percent, Zap, Trophy, Users, ArrowRight, CheckCircle, Lock } from "lucide-react";
import { Link } from "react-router-dom";

// Mock player data
const playerVipData = {
  currentPoints: 8500,
  level: "gold" as VipLevel,
  monthlyVolume: 12500,
  totalWins: 234,
  totalReferrals: 45,
  totalEarnings: 28500,
};

const vipBenefits = {
  bronze: [
    { name: "Taxa da Plataforma", value: "5%", icon: Percent },
    { name: "Prioridade de Saque", value: "Normal", icon: Wallet },
    { name: "Torneios Exclusivos", value: "Nenhum", icon: Trophy },
  ],
  silver: [
    { name: "Taxa da Plataforma", value: "4.5%", icon: Percent },
    { name: "Prioridade de Saque", value: "Média", icon: Wallet },
    { name: "Torneios Exclusivos", value: "Silver+", icon: Trophy },
    { name: "Boost Afiliado", value: "+5%", icon: Users },
  ],
  gold: [
    { name: "Taxa da Plataforma", value: "4%", icon: Percent },
    { name: "Prioridade de Saque", value: "Alta", icon: Wallet },
    { name: "Torneios Exclusivos", value: "Gold+", icon: Trophy },
    { name: "Boost Afiliado", value: "+10%", icon: Users },
    { name: "Badge Dourado", value: "Ativo", icon: Crown },
  ],
  diamond: [
    { name: "Taxa da Plataforma", value: "3%", icon: Percent },
    { name: "Prioridade de Saque", value: "Máxima", icon: Wallet },
    { name: "Torneios Exclusivos", value: "Diamond+", icon: Trophy },
    { name: "Boost Afiliado", value: "+15%", icon: Users },
    { name: "Badge Diamante", value: "Ativo", icon: Crown },
    { name: "Suporte VIP", value: "24/7", icon: Zap },
  ],
  elite: [
    { name: "Taxa da Plataforma", value: "2%", icon: Percent },
    { name: "Prioridade de Saque", value: "Instantânea", icon: Wallet },
    { name: "Torneios Exclusivos", value: "Todos", icon: Trophy },
    { name: "Boost Afiliado", value: "+25%", icon: Users },
    { name: "Badge Elite", value: "Ativo", icon: Crown },
    { name: "Suporte VIP", value: "Dedicado", icon: Zap },
    { name: "Bônus Mensais", value: "Exclusivos", icon: TrendingUp },
  ],
};

function VipTierCard({ level, current, unlocked }: { level: VipLevel; current: boolean; unlocked: boolean }) {
  const vipInfo = VIP_LEVELS[level];
  const benefits = vipBenefits[level];

  return (
    <Card className={`relative overflow-hidden transition-all ${current ? "ring-2 ring-primary" : ""} ${!unlocked ? "opacity-60" : ""}`}>
      {current && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-semibold">
          ATUAL
        </div>
      )}
      {!unlocked && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{vipInfo.icon}</div>
          <div>
            <CardTitle className="text-lg">VIP {vipInfo.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {vipInfo.minPoints.toLocaleString()}+ pontos
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span>{benefit.name}</span>
                </div>
                <Badge variant="outline" className="font-mono">{benefit.value}</Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const VipDashboard = () => {
  const currentLevel = getVipLevel(playerVipData.currentPoints);
  const currentLevelInfo = VIP_LEVELS[currentLevel];
  const levels = Object.keys(VIP_LEVELS) as VipLevel[];
  const currentLevelIndex = levels.indexOf(currentLevel);
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
  const nextLevelInfo = nextLevel ? VIP_LEVELS[nextLevel] : null;

  const progressToNext = nextLevelInfo
    ? ((playerVipData.currentPoints - currentLevelInfo.minPoints) / (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100
    : 100;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4"
          >
            <Crown className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold mb-2"
          >
            Programa <span className="text-gradient-gold">VIP</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Jogue, vença e suba de nível para desbloquear benefícios exclusivos
          </motion.p>
        </div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{currentLevelInfo.icon}</div>
                  <div>
                    <VipBadge level={currentLevel} size="lg" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {playerVipData.currentPoints.toLocaleString()} pontos VIP
                    </p>
                  </div>
                </div>

                {nextLevelInfo && (
                  <div className="flex-1 max-w-md w-full">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{currentLevelInfo.name}</span>
                      <span>{nextLevelInfo.name}</span>
                    </div>
                    <Progress value={progressToNext} className="h-3" />
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      Faltam {(nextLevelInfo.minPoints - playerVipData.currentPoints).toLocaleString()} pontos
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Sua taxa atual</p>
                  <div className="font-display text-4xl font-bold text-success">
                    {currentLevelInfo.platformFee}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-xl mb-4">Como Ganhar Pontos VIP</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎮", label: "Jogar", value: "1 pt/R$1" },
              { icon: "🏆", label: "Vencer", value: "+50 pts" },
              { icon: "👥", label: "Indicar", value: "+100 pts" },
              { icon: "💰", label: "Depositar", value: "1 pt/R$1" },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* VIP Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display font-bold text-xl mb-4">Níveis VIP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level, index) => (
              <VipTierCard
                key={level}
                level={level}
                current={level === currentLevel}
                unlocked={index <= currentLevelIndex}
              />
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Comece a jogar agora e acumule pontos VIP!
          </p>
          <Link to="/tournaments">
            <Button variant="hero" size="lg">
              Ver Torneios
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default VipDashboard;
