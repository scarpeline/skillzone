import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Achievement } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, CheckCircle, Zap } from "lucide-react";

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

const rarityColors = {
  common: "border-gray-500/30 bg-gray-500/10",
  rare: "border-blue-500/30 bg-blue-500/10",
  epic: "border-purple-500/30 bg-purple-500/10",
  legendary: "border-amber-400/30 bg-amber-400/10",
};

const rarityLabels = {
  common: "Comum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

const rarityBadgeColors = {
  common: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-400/20 text-amber-400 border-amber-400/30",
};

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const progress = Math.min((achievement.progress / achievement.requirement) * 100, 100);

  if (compact) {
    return (
      <div 
        className={cn(
          "relative w-12 h-12 rounded-lg border flex items-center justify-center text-2xl",
          achievement.completed ? rarityColors[achievement.rarity] : "bg-muted/50 border-border opacity-50"
        )}
        title={`${achievement.name}: ${achievement.description}`}
      >
        {achievement.completed ? (
          achievement.icon
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all",
        achievement.completed ? rarityColors[achievement.rarity] : "opacity-60"
      )}>
        {achievement.completed && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
        )}

        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 border",
              achievement.completed ? rarityColors[achievement.rarity] : "bg-muted/50 border-border"
            )}>
              {achievement.completed ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
                <Badge className={cn("text-[10px]", rarityBadgeColors[achievement.rarity])}>
                  {rarityLabels[achievement.rarity]}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>

              {!achievement.completed && (
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium">
                    {achievement.progress}/{achievement.requirement}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  +{achievement.xpReward} XP
                </Badge>

                {achievement.completed && achievement.unlockedAt && (
                  <span className="text-[10px] text-muted-foreground">
                    Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
