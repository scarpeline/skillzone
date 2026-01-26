import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flame, Calendar, Gift } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  todayPlayed: boolean;
  className?: string;
}

export function StreakDisplay({ currentStreak, longestStreak, todayPlayed, className }: StreakDisplayProps) {
  const streakBonus = Math.min(currentStreak * 5, 50); // Max 50% bonus

  return (
    <Card className={cn("bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30", className)}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="font-display font-bold text-lg">Sequência de Dias</span>
          </div>
          {todayPlayed && (
            <Badge className="bg-success/20 text-success border-success/30">
              ✓ Jogou Hoje
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-display text-3xl font-bold text-orange-500">
              {currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Dias Seguidos</div>
          </div>

          <div>
            <div className="font-display text-3xl font-bold text-muted-foreground">
              {longestStreak}
            </div>
            <div className="text-xs text-muted-foreground">Recorde</div>
          </div>

          <div>
            <div className="font-display text-3xl font-bold text-amber-400">
              +{streakBonus}%
            </div>
            <div className="text-xs text-muted-foreground">Bônus XP</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-background/50">
          <Gift className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {currentStreak >= 7 ? "Bônus Semanal Ativo!" : `Jogue mais ${7 - currentStreak} dias para bônus semanal`}
            </div>
            <div className="text-xs text-muted-foreground">
              7 dias seguidos = 1 Ticket gratuito
            </div>
          </div>
        </div>

        {/* Weekly calendar visualization */}
        <div className="mt-4 flex justify-between">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => {
            const isActive = index < currentStreak % 7 || (currentStreak >= 7 && index < 7);
            return (
              <div 
                key={index}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                  isActive 
                    ? "bg-orange-500 text-white" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
