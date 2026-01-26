import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Mission } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Gift, Zap, Coins, Ticket } from "lucide-react";
import { motion } from "framer-motion";

interface MissionCardProps {
  mission: Mission;
  onClaim?: (missionId: string) => void;
}

const typeColors = {
  daily: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  weekly: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  monthly: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const typeLabels = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
};

const rewardIcons = {
  xp: Zap,
  tokens: Coins,
  tickets: Ticket,
  credits: Gift,
};

export function MissionCard({ mission, onClaim }: MissionCardProps) {
  const progress = Math.min((mission.progress / mission.target) * 100, 100);
  const RewardIcon = rewardIcons[mission.reward.type];
  const isClaimable = mission.completed && onClaim;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all",
        mission.completed && "border-success/50 bg-success/5"
      )}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              mission.completed ? "bg-success/20" : "bg-primary/20"
            )}>
              {mission.completed ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <RewardIcon className="w-5 h-5 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{mission.title}</h4>
                <Badge className={cn("text-[10px]", typeColors[mission.type])}>
                  {typeLabels[mission.type]}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-2">{mission.description}</p>

              <div className="flex items-center gap-2 mb-2">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium">
                  {mission.progress}/{mission.target}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(mission.expiresAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <RewardIcon className="w-3 h-3 mr-1" />
                    +{mission.reward.amount} {mission.reward.type.toUpperCase()}
                  </Badge>

                  {isClaimable && (
                    <Button 
                      size="sm" 
                      variant="hero" 
                      className="h-7 text-xs"
                      onClick={() => onClaim(mission.id)}
                    >
                      Resgatar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
