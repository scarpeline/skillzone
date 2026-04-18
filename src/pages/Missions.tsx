import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MissionCard } from "@/components/gamification/MissionCard";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { XpProgressBar } from "@/components/gamification/XpProgressBar";
import { CurrencyDisplay } from "@/components/gamification/CurrencyDisplay";
import { generateDailyMissions, generateWeeklyMissions, DEFAULT_ACHIEVEMENTS, PlayerCurrency } from "@/lib/gamification";
import { Target, Trophy, Flame, Gift, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Missions = () => {
  const { profile } = useAuth();

  const playerCurrency: PlayerCurrency = {
    xp: profile?.xp ?? 0,
    tokens: profile?.tokens ?? 0,
    tickets: profile?.tickets ?? 0,
  };
  const playerXp = profile?.xp ?? 0;
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;

  const dailyMissions = generateDailyMissions();
  const weeklyMissions = generateWeeklyMissions();
  const achievements = DEFAULT_ACHIEVEMENTS.map((a, i) => ({
    ...a,
    progress: i < 4 ? a.requirement : Math.floor(a.requirement * 0.4),
    completed: i < 4,
    unlockedAt: i < 4 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
  }));

  const handleClaimMission = (missionId: string) => {
    toast({ title: "Missão Resgatada!", description: "Sua recompensa foi adicionada à sua conta." });
  };

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
              <span className="text-gradient-neon">Missões</span> & Conquistas
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Complete desafios e desbloqueie recompensas exclusivas
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CurrencyDisplay currency={playerCurrency} size="lg" showLabels />
          </motion.div>
        </div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <XpProgressBar xp={playerXp} size="lg" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Target, label: "Missões Ativas", value: dailyMissions.length + weeklyMissions.length, color: "text-primary" },
            { icon: Trophy, label: "Conquistas", value: `${achievements.filter(a => a.completed).length}/${achievements.length}`, color: "text-amber-400" },
            { icon: Flame, label: "Sequência", value: `${currentStreak} dias`, color: "text-orange-500" },
            { icon: Gift, label: "Recompensas", value: "3 pendentes", color: "text-success" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-4 pb-4">
                  <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <div className="font-display text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Streak Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} todayPlayed={currentStreak > 0} />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="w-full max-w-lg mb-6 grid grid-cols-3">
            <TabsTrigger value="daily">Diárias</TabsTrigger>
            <TabsTrigger value="weekly">Semanais</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Missões Diárias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyMissions.map((mission) => (
                  <MissionCard 
                    key={mission.id} 
                    mission={mission}
                    onClaim={mission.completed ? handleClaimMission : undefined}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Missões Semanais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyMissions.map((mission) => (
                  <MissionCard 
                    key={mission.id} 
                    mission={mission}
                    onClaim={mission.completed ? handleClaimMission : undefined}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Conquistas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Missions;
