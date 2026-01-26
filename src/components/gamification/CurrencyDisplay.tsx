import { Badge } from "@/components/ui/badge";
import { PlayerCurrency } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Zap, Coins, Ticket } from "lucide-react";

interface CurrencyDisplayProps {
  currency: PlayerCurrency;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { badge: "text-[10px] px-1.5 py-0.5", icon: "w-3 h-3" },
  md: { badge: "text-xs px-2 py-1", icon: "w-3.5 h-3.5" },
  lg: { badge: "text-sm px-3 py-1.5", icon: "w-4 h-4" },
};

export function CurrencyDisplay({ currency, size = "md", showLabels = false, className }: CurrencyDisplayProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        className={cn(
          "bg-primary/20 text-primary border-primary/30 font-mono",
          styles.badge
        )}
        title="XP - Experiência"
      >
        <Zap className={cn("mr-1", styles.icon)} />
        {currency.xp.toLocaleString()}
        {showLabels && " XP"}
      </Badge>

      <Badge 
        className={cn(
          "bg-amber-400/20 text-amber-400 border-amber-400/30 font-mono",
          styles.badge
        )}
        title="Tokens"
      >
        <Coins className={cn("mr-1", styles.icon)} />
        {currency.tokens.toLocaleString()}
        {showLabels && " Tokens"}
      </Badge>

      <Badge 
        className={cn(
          "bg-purple-500/20 text-purple-400 border-purple-500/30 font-mono",
          styles.badge
        )}
        title="Tickets"
      >
        <Ticket className={cn("mr-1", styles.icon)} />
        {currency.tickets}
        {showLabels && " Tickets"}
      </Badge>
    </div>
  );
}
