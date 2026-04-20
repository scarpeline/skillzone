import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Users, Clock, Flame, Search, Filter, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GAME_FILTERS = [
  { id: "all", label: "Todos os jogos" },
  { id: "slot-tiger", label: "🐯 Tigrinho" },
  { id: "gates-of-olympus", label: "⚡ Gates of Olympus" },
  { id: "fortune-ox", label: "🐂 Fortune Ox" },
  { id: "crash", label: "✈️ Crash" },
  { id: "chess", label: "♛ Xadrez" },
  { id: "quiz", label: "❓ Quiz" },
];

const MOCK_TOURNAMENTS = [
  { id: "t1", name: "Campeonato Tigrinho Semanal", game_id: "slot-tiger", game_icon: "🐯", guaranteed_prize: 25000, entry_fee: 50, max_players: 256, player_count: 128, starts_at: "2026-04-25T22:00:00", status: "registering" },
  { id: "t2", name: "Gates of Olympus Masters", game_id: "gates-of-olympus", game_icon: "⚡", guaranteed_prize: 50000, entry_fee: 200, max_players: 64, player_count: 32, starts_at: "2026-04-26T20:00:00", status: "starting" },
  { id: "t3", name: "Crash Championship", game_id: "crash", game_icon: "✈️", guaranteed_prize: 10000, entry_fee: 30, max_players: 100, player_count: 89, starts_at: "2026-04-24T21:00:00", status: "live" },
  { id: "t4", name: "Fortune Ox Weekly", game_id: "fortune-ox", game_icon: "🐂", guaranteed_prize: 8000, entry_fee: 25, max_players: 200, player_count: 156, starts_at: "2026-04-27T20:00:00", status: "registering" },
  { id: "t5", name: "Torneio de Xadrez", game_id: "chess", game_icon: "♛", guaranteed_prize: 3000, entry_fee: 15, max_players: 64, player_count: 42, starts_at: "2026-04-28T19:00:00", status: "registering" },
  { id: "t6", name: "Quiz Night Champions", game_id: "quiz", game_icon: "❓", guaranteed_prize: 5000, entry_fee: 20, max_players: 128, player_count: 67, starts_at: "2026-04-25T20:00:00", status: "registering" },
];

function getStatusBadge(status: string) {
  if (status === "starting") return <Badge className="bg-success/20 text-success border-success/30"><Clock className="w-3 h-3 mr-1" />Iniciando</Badge>;
  if (status === "live") return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><Flame className="w-3 h-3 mr-1" />Ao vivo</Badge>;
  return <Badge className="bg-primary/20 text-primary border-primary/30">Inscrições abertas</Badge>;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const Tournaments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");

  const filtered = MOCK_TOURNAMENTS.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGame = gameFilter === "all" || t.game_id === gameFilter;
    return matchSearch && matchGame;
  });

  const featured = filtered.filter(t => t.guaranteed_prize >= 5000);
  const regular = filtered.filter(t => t.guaranteed_prize < 5000);
  const prizePool = (t: typeof MOCK_TOURNAMENTS[0]) => Math.max(t.guaranteed_prize, t.player_count * t.entry_fee);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-gradient-gold">Torneios</span> Competitivos
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg">
            Participe de torneios e dispute prêmios reais
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar torneios..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por jogo" />
            </SelectTrigger>
            <SelectContent>
              {GAME_FILTERS.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum torneio encontrado.</p>
          </div>
        )}

        {featured.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="font-display text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" /> Em Destaque
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {featured.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <div className="relative bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl md:rounded-2xl border border-accent/30 p-4 md:p-6 hover:border-accent/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/tournaments/${t.id}`)}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">{t.game_icon}</div>
                      <div className="flex-1">{getStatusBadge(t.status)}</div>
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold mb-3">{t.name}</h3>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground">Prêmio</span>
                      <span className="font-display font-bold text-gradient-gold">{formatCurrency(prizePool(t))}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground" /><span>{t.player_count}/{t.max_players}</span></div>
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-muted-foreground" /><span>{formatDateTime(t.starts_at)}</span></div>
                      <div className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-muted-foreground" /><span>{formatCurrency(t.entry_fee)}</span></div>
                    </div>
                    <Button variant="gold" className="w-full" onClick={e => { e.stopPropagation(); navigate(`/tournaments/${t.id}`); }}>
                      Inscrever-se
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {regular.length > 0 && (
          <div>
            <h2 className="font-display text-lg md:text-xl font-bold mb-4">Todos os Torneios</h2>
            <div className="space-y-3 md:space-y-4">
              {regular.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <div className="bg-card rounded-xl border border-border p-4 md:p-6 hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/tournaments/${t.id}`)}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-muted flex items-center justify-center text-xl md:text-2xl flex-shrink-0">{t.game_icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">{getStatusBadge(t.status)}</div>
                          <h3 className="font-display text-base md:text-lg font-bold truncate">{t.name}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div><div className="font-display text-sm md:text-xl font-bold text-gradient-gold">{formatCurrency(prizePool(t))}</div><div className="text-[10px] md:text-xs text-muted-foreground">Prêmio</div></div>
                        <div><div className="flex items-center justify-center gap-1"><Users className="w-3 h-3 md:w-4 md:h-4" /><span className="font-semibold text-xs md:text-sm">{t.player_count}/{t.max_players}</span></div><div className="text-[10px] md:text-xs text-muted-foreground">Jogadores</div></div>
                        <div><div className="font-semibold text-xs md:text-sm">{formatDateTime(t.starts_at)}</div><div className="text-[10px] md:text-xs text-muted-foreground">Início</div></div>
                        <div><div className="font-semibold text-xs md:text-sm">{formatCurrency(t.entry_fee)}</div><div className="text-[10px] md:text-xs text-muted-foreground">Inscrição</div></div>
                      </div>
                      <Button variant="hero" className="w-full">Participar</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tournaments;
