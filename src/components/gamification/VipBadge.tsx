import { Badge } from "@/components/ui/badge";
import { VIP_LEVELS, VipLevel } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface VipBadgeProps {
  level: VipLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
};

const colorStyles: Record<VipLevel, string> = {
  bronze: "bg-amber-700/20 text-amber-600 border-amber-600/30",
  silver: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  gold: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  diamond: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30",
  elite: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function VipBadge({ level, size = "md", showLabel = true, className }: VipBadgeProps) {
  const vipInfo = VIP_LEVELS[level];

  return (
    <Badge 
      className={cn(
        "font-display font-semibold border",
        sizeStyles[size],
        colorStyles[level],
        className
      )}
    >
      <span className="mr-1">{vipInfo.icon}</span>
      {showLabel && <span>VIP {vipInfo.name}</span>}
    </Badge>
  );
}
