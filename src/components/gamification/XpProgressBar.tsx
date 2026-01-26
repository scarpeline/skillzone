import { Progress } from "@/components/ui/progress";
import { getPlayerLevel, getNextLevel, getLevelProgress } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Star, Zap } from "lucide-react";

interface XpProgressBarProps {
  xp: number;
  showLevel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function XpProgressBar({ xp, showLevel = true, size = "md", className }: XpProgressBarProps) {
  const currentLevel = getPlayerLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getLevelProgress(xp);

  const sizeStyles = {
    sm: { bar: "h-1.5", text: "text-xs", icon: "w-3 h-3" },
    md: { bar: "h-2", text: "text-sm", icon: "w-4 h-4" },
    lg: { bar: "h-3", text: "text-base", icon: "w-5 h-5" },
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLevel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className={cn("text-primary", sizeStyles[size].icon)} />
            <span className={cn("font-semibold", sizeStyles[size].text)}>
              Nível {currentLevel.level} - {currentLevel.name}
            </span>
          </div>
          <div className={cn("text-muted-foreground flex items-center gap-1", sizeStyles[size].text)}>
            <Zap className={sizeStyles[size].icon} />
            {xp.toLocaleString()} XP
          </div>
        </div>
      )}
      <Progress value={progress} className={sizeStyles[size].bar} />
      {nextLevel && (
        <div className={cn("text-muted-foreground flex justify-between", sizeStyles[size].text)}>
          <span>{currentLevel.xpRequired} XP</span>
          <span>{nextLevel.xpRequired} XP</span>
        </div>
      )}
    </div>
  );
}
