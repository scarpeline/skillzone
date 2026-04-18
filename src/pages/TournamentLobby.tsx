import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Trophy, Users, Clock, Calendar, DollarSign, ArrowLeft,
  Crown, Medal, Award, RefreshCw, Zap, CheckCircle, Timer, Loader2
} from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Tournament {
  id: string;
  name: string;
  game: string;
  gameIcon: string;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  startTime: string;
  status: "waiting" | "registering" | "starting" | "live" | "finished";
  prizeDistribution: { position: number; percent: number; label: string }[];
  rebuyAllowed: boolean;
  rebuyFee: number;
  maxRebuys: number;
  guaranteedPrize: number;
  description: string;
}

interface Participant {
  id: string;
  username: string;
  avatar: string;
  score: number;
  position: number;
  rebuys: number;
  status: "waiting" | "playing" | "eliminated";
}

// ── Dados mock (serão substituídos por Supabase) ─────────────────────────────

const MOCK_TOURNAMENT: Tournament = {
  id: "t1",
  name: "Torneio Tigrinho Semanal",
  game: "slot-tiger",
  gameIcon: "🐯",
  entryFee: 50,
  maxPlayers: 100,
  currentPlayers: 67,
  startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  status: "registering",
  prizeDistribution: [
    { position: 1, percent: 40, label: "🥇 1º Lugar" },
    { position: 2, percent: 25, label: "🥈 2º Lugar" },
    { position: 3, percent: 15, label: "🥉 3º Lugar" },
    { position: 4, percent: 10, label: "4º Lugar" },
    { position: 5, percent: 10, label: "5º Lugar" },
  ],
  rebuyAllowed: true,
  rebuyFee: 30,
  maxRebuys: 2,
  guaranteedPrize: 3000,
  description: "Torneio semanal de Slot Tigrinho! Os 5 melhores jogadores dividem o prêmio acumulado.",
};

const MOCK_PARTICIPANTS: Participant[] = [
  { id: "1", username: "TigerKing", avatar: "🐯", score: 4850, position: 1, rebuys: 0, status: "playing" },
  { id: "2", username: "SlotMaster", avatar: "🎰", score: 3920, position: 2, rebuys: 1, status: "playing" },
  { id: "3", username: "LuckyPaw", avatar: "🍀", score: 3100, position: 3, rebuys: 0, status: "playing" },
  { id: "4", username: "GoldRush", avatar: "💰", score: 2750, position: 4, rebuys: 2, status: "playing" },
  { id: "5", username: "SpinQueen", avatar: "👑", score: 2200, position: 5, rebuys: 0, status: "playing" },
];

// ── Componente ───────────────────────────────────────────────────────────────

export default function TournamentLobby() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRebuys, setUserRebuys] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  const [showRebuyModal, setShowRebuyModal] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    if (tournamentId) fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    setLoading(true);
    const { data: t } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single();

    if (t) {
      setTournament(t);

      // Contar inscritos
      const { count } = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .eq("tournament_id", tournamentId)
        .neq("status", "refunded");
      setPlayerCount(count ?? 0);

      // Verificar se usuário está inscrito
      if (profile) {
        const { data: reg } = await supabase
          .from("tournament_registrations")
          .select("*")
          .eq("tournament_id", tournamentId)
          .eq("user_id", profile.user_id)
          .maybeSingle();
        if (reg) {
          setIsRegistered(true);
          setUserRebuys(reg.rebuys ?? 0);
        }
      }

      // Ranking
      const { data: regs } = await supabase
        .from("tournament_registrations")
        .select("*, profiles(username, display_name, avatar_url)")
        .eq("tournament_id", tournamentId)
        .order("score", { ascending: false })
        .limit(20);
      if (regs) setParticipants(regs);
    }
    setLoading(false);
  };

  // Countdown
  useEffect(() => {
    if (!tournament) return;
    const update = () => {
      const diff = new Date(tournament.starts_at).getTime() - Date.now();
      setTimeUntilStart(Math.max(0, Math.floor(diff / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
    return `${sec}s`;
  };

  const prizePool = tournament
    ? Math.max(Number(tournament.guaranteed_prize), playerCount * Number(tournament.entry_fee))
    : 0;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleRegister = async () => {
    if (!profile) {
      toast({ title: "Faça login para se inscrever", variant: "destructive" });
      return;
    }
    setRegistering(true);
    try {
      const { data, error } = await supabase.rpc("register_tournament", {
        p_tournament_id: tournamentId,
        p_user_id: profile.user_id,
      });
      if (error || data?.error) {
        toast({ title: data?.error || error?.message, variant: "destructive" });
      } else {
        setIsRegistered(true);
        setPlayerCount(c => c + 1);
        await refreshProfile();
        toast({ title: "✅ Inscrito com sucesso!", description: `Você está na fila para ${tournament.name}` });
        fetchTournament();
      }
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setRegistering(false);
    }
  };

  const handleRebuy = async () => {
    if (!profile || !tournament) return;
    if (userRebuys >= tournament.max_rebuys) {
      toast({ title: "Limite de recompras atingido", variant: "destructive" });
      return;
    }
    setRegistering(true);
    try {
      // Debitar taxa de recompra
      const wallet = tournament.entry_wallet;
      const fee = Number(tournament.rebuy_fee);
      if (fee > 0) {
        await supabase.from("transactions").insert({
          user_id: profile.user_id,
          type: "entry",
          wallet,
          amount: -fee,
          description: `Recompra: ${tournament.name}`,
          reference: tournamentId,
        });
        await supabase.from("profiles").update({
          [wallet === "cash" ? "cash_balance" : "credits_balance"]:
            wallet === "cash"
              ? Number(profile.cash_balance) - fee
              : profile.credits_balance - fee,
        }).eq("user_id", profile.user_id);
      }
      // Atualizar registro
      await supabase.from("tournament_registrations")
        .update({ rebuys: userRebuys + 1, status: "playing", score: 0 })
        .eq("tournament_id", tournamentId)
        .eq("user_id", profile.user_id);

      setUserRebuys(r => r + 1);
      setShowRebuyModal(false);
      await refreshProfile();
      toast({ title: "🔄 Recompra realizada!", description: "Você voltou ao torneio!" });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setRegistering(false);
    }
  };

  const positionIcon = (pos: number) => {
    if (pos === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (pos === 2) return <Medal className="w-4 h-4 text-gray-300" />;
    if (pos === 3) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className="text-white/40 text-sm font-bold">#{pos}</span>;
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </Layout>
  );

  if (!tournament) return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Torneio não encontrado.</p>
        <Button onClick={() => navigate("/tournaments")} className="mt-4">Voltar</Button>
      </div>
    </Layout>
  );

  const prizeDistribution: any[] = tournament.prize_distribution ?? [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back */}
        <Button variant="ghost" onClick={() => navigate("/tournaments")} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Torneios
        </Button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center text-4xl">
              {tournament.game_icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-1">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {tournament.status === "registering" ? "Inscrições abertas" : "Ao vivo"}
                </Badge>
                {tournament.rebuy_allowed && (
                  <Badge variant="outline" className="text-green-400 border-green-400/30">
                    <RefreshCw className="w-3 h-3 mr-1" />Recompra disponível
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{tournament.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">{tournament.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                  <div className="font-display text-xl font-bold text-yellow-400">
                    R$ {prizePool.toLocaleString("pt-BR")}
                  </div>
                  <div className="text-xs text-muted-foreground">Prêmio Total</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                  <div className="font-display text-xl font-bold">
                    {playerCount}/{tournament.max_players}
                  </div>
                  <div className="text-xs text-muted-foreground">Jogadores</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <Timer className="w-5 h-5 mx-auto mb-1 text-green-400" />
                  <div className="font-display text-xl font-bold text-green-400">
                    {formatCountdown(timeUntilStart)}
                  </div>
                  <div className="text-xs text-muted-foreground">Para iniciar</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="font-display text-xl font-bold">
                    {formatCurrency(Number(tournament.entry_fee))}
                  </div>
                  <div className="text-xs text-muted-foreground">Inscrição</div>
                </CardContent>
              </Card>
            </div>

            {/* Progresso de inscrições */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Vagas preenchidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(playerCount / tournament.max_players) * 100} className="h-3 mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{playerCount} inscritos</span>
                  <span>{tournament.max_players - playerCount} vagas restantes</span>
                </div>
              </CardContent>
            </Card>

            {/* Ranking ao vivo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Ranking ao Vivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {participants.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i < 5 ? "border-yellow-400/20 bg-yellow-400/5" : "border-border bg-card/30"}`}>
                    <div className="w-8 flex justify-center">{positionIcon(i + 1)}</div>
                    <div className="text-2xl">🎮</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{p.profiles?.display_name || p.profiles?.username || "Jogador"}</div>
                      {p.rebuys > 0 && <div className="text-xs text-muted-foreground"><RefreshCw className="w-3 h-3 inline mr-1" />{p.rebuys} recompra{p.rebuys > 1 ? "s" : ""}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-yellow-400">{(p.score ?? 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">pts</div>
                    </div>
                    {i < prizeDistribution.length && (
                      <div className="text-right min-w-[60px]">
                        <div className="text-xs text-green-400 font-bold">
                          {formatCurrency(Math.round(prizePool * prizeDistribution[i].percent / 100))}
                        </div>
                        <div className="text-[10px] text-muted-foreground">prêmio</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Distribuição de prêmios */}
            <Card className="border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Distribuição de Prêmios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {prizeDistribution.map((d: any) => (
                  <div key={d.position} className="flex items-center justify-between">
                    <span className="text-sm">{d.label}</span>
                    <div className="text-right">
                      <span className="font-bold text-yellow-400">{formatCurrency(Math.round(prizePool * d.percent / 100))}</span>
                      <span className="text-xs text-muted-foreground ml-1">({d.percent}%)</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Prêmio garantido</span>
                    <span className="text-green-400">{formatCurrency(Number(tournament.guaranteed_prize))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {tournament.rebuy_allowed && (
              <Card className="border-green-400/20">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 text-green-400" />Recompra</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Valor</span><span className="font-bold">{formatCurrency(Number(tournament.rebuy_fee))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Máximo</span><span className="font-bold">{tournament.max_rebuys}x</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Suas recompras</span><span className="font-bold">{userRebuys}/{tournament.max_rebuys}</span></div>
                  <p className="text-xs text-muted-foreground">Se for eliminado, pode recomprar e continuar jogando.</p>
                </CardContent>
              </Card>
            )}

            {/* Ação principal */}
            <div className="space-y-3">
              {!isRegistered ? (
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black"
                >
                  {registering ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Inscrever-se — {formatCurrency(Number(tournament.entry_fee))}
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-400/10 border border-green-400/30">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-green-400">Inscrito!</p>
                      <p className="text-xs text-muted-foreground">Aguardando início em {formatCountdown(timeUntilStart)}</p>
                    </div>
                  </div>
                  {tournament.rebuy_allowed && userRebuys < tournament.max_rebuys && (
                    <Button onClick={() => setShowRebuyModal(true)} variant="outline" className="w-full border-green-400/30 text-green-400 hover:bg-green-400/10">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recompra — {formatCurrency(Number(tournament.rebuy_fee))}
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Início: {new Date(tournament.starts_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de recompra */}
        <AnimatePresence>
          {showRebuyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRebuyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🔄</div>
                  <h3 className="font-display text-xl font-bold">Fazer Recompra?</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    Você voltará ao torneio com pontuação zerada e poderá continuar competindo.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Custo da recompra</span><span className="font-bold">{formatCurrency(Number(tournament.rebuy_fee))}</span></div>
                  <div className="flex justify-between"><span>Recompras restantes</span><span className="font-bold">{tournament.max_rebuys - userRebuys - 1}x após esta</span></div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRebuyModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleRebuy} disabled={registering} className="flex-1 bg-green-600 hover:bg-green-500">
                    {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
