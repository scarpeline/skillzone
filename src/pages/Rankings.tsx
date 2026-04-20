import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VipBadge } from "@/components/gamification/VipBadge";
import { VipLevel } from "@/lib/gamification";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  Trophy, Crown, Medal, Award,
  CheckCircle, Loader2,
} from "lucide-react";

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
  if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
  return <span className="font-display font-bold text-lg text-muted-foreground">{rank}</span>;
}

function getRankStyle(rank: number) {
  if (rank === 1) return "border-amber-400/50 bg-gradient-to-r from-amber-400/10 to-transparent";
  if (rank === 2) return "border-gray-300/50 bg-gradient-to-r from-gray-300/10 to-transparent";
  if (rank === 3) return "border-amber-600/50 bg-gradient-to-r from-amber-600/10 to-transparent";
  return "border-border";
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const GAME_TABS = [
  { id: "global", label: "Global" },
  { id: "slot-tiger", label: "🐯 Tigrinho" },
  { id: "crash", label: "✈️ Crash" },
  { id: "chess", label: "♛ Xadrez" },
  { id: "quiz", label: "❓ Quiz" },
];

const Rankings = () => {
  const { profile } = useAuth();
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState("global");

  useEffect(() => {
    fetchRankings(activeGame);
  }, [activeGame]);

  const fetchRankings = async (gameId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, username, display_name, xp, total_matches, total_wins, total_earnings, vip_level")
      .order("xp", { ascending: false })
      .limit(50);

    if (data) {
      setRankings(data.map((p, i) => ({
        ...p,
        rank: i + 1,
        winRate: p.total_matches > 0 ? Math.round((p.total_wins / p.total_matches) * 100) : 0,
        points: p.xp,
        earnings: Number(p.total_earnings ?? 0),
        avatar: (p.display_name || p.username || "?").slice(0, 2).toUpperCase(),
        vipLevel: (p.vip_level || "bronze") as VipLevel,
      })));
    }
    setLoading(false);
  };

  const myRank = profile ? rankings.findIndex(r => r.user_id === profile.user_id) + 1 : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-gradient-neon">Rankings</span> Globais
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg">
            Os melhores jogadores da plataforma
          </motion.p>
          {myRank > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Sua posição: <strong className="text-primary">#{myRank}</strong></span>
            </motion.div>
          )}
        </div>

        <Tabs value={activeGame} onValueChange={setActiveGame} className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto mb-6 md:mb-8 grid grid-cols-5 h-auto">
            {GAME_TABS.map(t => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs md:text-sm py-2">{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {GAME_TABS.map(tab => (
            <TabsContent key={tab.id} value={tab.id}>
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <>
                  {rankings.length >= 3 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8 max-w-3xl mx-auto">
                      <div className="order-1">
                        <div className="bg-card rounded-xl border-2 border-gray-300/50 p-2 md:p-4 text-center mt-4 md:mt-8">
                          <div className="w-10 h-10 md:w-16 md:h-16 mx-auto rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center font-display font-bold text-sm md:text-xl text-gray-800 mb-1">{rankings[1].avatar}</div>
                          <Medal className="w-4 h-4 md:w-6 md:h-6 text-gray-300 mx-auto mb-1" />
                          <h3 className="font-display font-bold text-xs md:text-base truncate">{rankings[1].display_name || rankings[1].username}</h3>
                          <p className="font-display font-bold text-xs md:text-lg">{rankings[1].points.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">XP</p>
                        </div>
                      </div>
                      <div className="order-2">
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border-2 border-amber-400/50 p-2 md:p-4 text-center">
                          <div className="w-12 h-12 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-display font-bold text-lg md:text-2xl text-amber-900 mb-1 ring-2 ring-amber-400/50">{rankings[0].avatar}</div>
                          <Crown className="w-5 h-5 md:w-8 md:h-8 text-amber-400 mx-auto mb-1" />
                          <h3 className="font-display font-bold text-xs md:text-lg truncate">{rankings[0].display_name || rankings[0].username}</h3>
                          <p className="font-display font-bold text-sm md:text-2xl text-gradient-gold">{rankings[0].points.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">XP</p>
                        </div>
                      </div>
                      <div className="order-3">
                        <div className="bg-card rounded-xl border-2 border-amber-600/50 p-2 md:p-4 text-center mt-6 md:mt-12">
                          <div className="w-8 h-8 md:w-14 md:h-14 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-display font-bold text-xs md:text-lg text-amber-100 mb-1">{rankings[2].avatar}</div>
                          <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600 mx-auto mb-1" />
                          <h3 className="font-display font-bold text-[10px] md:text-sm truncate">{rankings[2].display_name || rankings[2].username}</h3>
                          <p className="font-display font-bold text-xs md:text-base">{rankings[2].points.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">XP</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2 md:space-y-3">
                    {rankings.map((player, index) => (
                      <motion.div key={player.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                        <Link to={`/player/${player.username}`}>
                          <div className={`flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl border bg-card hover:bg-card/80 transition-all ${getRankStyle(player.rank)} ${player.user_id === profile?.user_id ? "ring-2 ring-primary/50" : ""}`}>
                            <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">{getRankIcon(player.rank)}</div>
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-xs md:text-base text-primary-foreground flex-shrink-0">{player.avatar}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                <span className="font-semibold text-sm md:text-base truncate">{player.display_name || player.username}</span>
                                {player.user_id === profile?.user_id && <Badge className="text-[10px] bg-primary/20 text-primary">Você</Badge>}
                                <VipBadge level={player.vipLevel} size="sm" showLabel={false} className="hidden sm:inline-flex" />
                              </div>
                              <span className="text-xs md:text-sm text-muted-foreground">@{player.username}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-4 md:gap-8">
                              <div className="text-right">
                                <div className="font-display font-bold text-sm md:text-base">{player.points.toLocaleString()}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground">XP</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-success text-sm md:text-base">{player.winRate}%</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground">Vitórias</div>
                              </div>
                              <div className="text-right hidden md:block">
                                <div className="font-semibold text-gradient-gold">{formatCurrency(player.earnings)}</div>
                                <div className="text-xs text-muted-foreground">Ganhos</div>
                              </div>
                            </div>
                            <div className="flex sm:hidden flex-col items-end">
                              <div className="font-display font-bold text-xs">{player.points.toLocaleString()}</div>
                              <div className="text-[10px] text-muted-foreground">XP</div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {rankings.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhum jogador ainda. Seja o primeiro!</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Rankings;
