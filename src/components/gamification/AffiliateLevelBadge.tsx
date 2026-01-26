import { Badge } from "@/components/ui/badge";
import { AFFILIATE_LEVELS, AffiliateLevel } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface AffiliateLevelBadgeProps {
  level: AffiliateLevel;
  size?: "sm" | "md" | "lg";
  showCommission?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
};

const colorStyles: Record<AffiliateLevel, string> = {
  bronze: "bg-amber-700/20 text-amber-600 border-amber-600/30",
  silver: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  gold: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  diamond: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30",
};

const icons: Record<AffiliateLevel, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  diamond: "💎",
};

export function AffiliateLevelBadge({ level, size = "md", showCommission = false, className }: AffiliateLevelBadgeProps) {
  const affiliateInfo = AFFILIATE_LEVELS[level];

  return (
    <Badge 
      className={cn(
        "font-display font-semibold border",
        sizeStyles[size],
        colorStyles[level],
        className
      )}
    >
      <span className="mr-1">{icons[level]}</span>
      <span>Afiliado {affiliateInfo.name}</span>
      {showCommission && (
        <span className="ml-1 opacity-70">({affiliateInfo.commission}%)</span>
      )}
    </Badge>
  );
}
