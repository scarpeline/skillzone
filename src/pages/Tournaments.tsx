import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trophy, Users, Clock, Flame, Search, Filter, Calendar, DollarSign, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ALL_GAMES = [
  { id: "all",              label: "Todos os jogos" },
  { id: "slot-tiger",       label: "🐯 Tigrinho" },
  { id: "gates-of-olympus", label: "⚡ Gates of Olympus" },
  { id: "fortune-ox",       label: "🐂 Fortune Ox" },
  { id: "slot-fruits",      label: "🍒 Frutas da Sorte" },
  { id: "slot-gems",        label: "💎 Gemas Mágicas" },
  { id: "slot-egypt",       label: "🦅 Faraó do Egito" },
  { id: "crash",            label: "✈️ Crash" },
  { id: "mines",            label: "💣 Mines" },
  { id: "plinko",           label: "🎯 Plinko" },
  { id: "chess",            label: "♛ Xadrez" },
  { id: "checkers",         label: "◉ Damas" },
  { id: "quiz",             label: "❓ Quiz" },
  { id: "sudoku",           label: "⊞ Sudoku" },
  { id: "memory",           label: "🎴 Memory" },
  { id: "mahjong",          label: "🀄 Mahjong" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "starting": return <Badge className="bg-success/20 text-success border-success/30"><Clock className="w-3 h-3 mr-1" />Iniciando em breve</Badge>;
    case "live":     return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><Flame className="w-3 h-3 mr-1" />Ao vivo</Badge>;
    default:         return <Badge className="bg-primary/20 text-primary border-primary/30">Inscrições abertas</Badge>;
  }
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tournaments")
      .select(`*, tournament_player_counts(player_count)`)
      .in("status", ["registering", "starting", "live"])
      .order("starts_at", { ascending: true });

    if (data) setTournaments(data);
    setLoading(false);
  };

  const filtered = tournaments.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGame = gameFilter === "all" || t.game_id === gameFilter;
    return matchSearch && matchGame;
  });

  const featured = filtered.filter(t => Number(t.guaranteed_prize) >= 5000);
  const regular  = filtered.filter(t => Number(t.guaranteed_prize) < 5000);

  const prizePool = (t: any) => {
    const inscriptions = (t.tournament_player_counts?.player_count ?? 0) * Number(t.entry_fee);
    return Math.max(Number(t.guaranteed_prize), inscriptions);
  };

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

        {/* Filtros */}
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
              {ALL_GAMES.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum torneio encontrado.</p>
          </div>
        )}

        {/* Destaque */}
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
                      <div className="flex-1">
                        {getStatusBadge(t.status)}
                        <p className="text-sm text-muted-foreground mt-0.5">{t.game_id}</p>
                      </div>
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold mb-3">{t.name}</h3>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Prêmio</span>
                        <span className="font-display font-bold text-gradient-gold">{formatCurrency(prizePool(t))}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground" /><span>{t.tournament_player_counts?.player_count ?? 0}/{t.max_players}</span></div>
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

        {/* Todos */}
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
                        <div><div className="flex items-center justify-center gap-1"><Users className="w-3 h-3 md:w-4 md:h-4" /><span className="font-semibold text-xs md:text-sm">{t.tournament_player_counts?.player_count ?? 0}/{t.max_players}</span></div><div className="text-[10px] md:text-xs text-muted-foreground">Jogadores</div></div>
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

const tournaments = [
  {
    id: 1,
    name: "Campeonato Brasileiro de Xadrez",
    game: "Xadrez",
    gameIcon: "♛",
    prizePool: 25000,
    currentPool: 18500,
    players: 128,
    maxPlayers: 256,
    startTime: "2026-01-23T22:00:00",
    status: "registering",
    entryFee: 50,
    type: "eliminatório",
    featured: true,
  },
  {
    id: 2,
    name: "Torneio Relâmpago de Damas",
    game: "Damas",
    gameIcon: "◉",
    prizePool: 5000,
    currentPool: 3200,
    players: 48,
    maxPlayers: 64,
    startTime: "2026-01-23T20:30:00",
    status: "starting",
    entryFee: 20,
    type: "suíço",
    featured: false,
  },
  {
    id: 3,
    name: "Desafio Sudoku Master",
    game: "Sudoku",
    gameIcon: "⊞",
    prizePool: 10000,
    currentPool: 8900,
    players: 89,
    maxPlayers: 100,
    startTime: "2026-01-23T21:00:00",
    status: "registering",
    entryFee: 30,
    type: "pontos",
    featured: true,
  },
  {
    id: 4,
    name: "Quiz Night Champions",
    game: "Quiz",
    gameIcon: "?",
    prizePool: 8000,
    currentPool: 7800,
    players: 156,
    maxPlayers: 200,
    startTime: "2026-01-23T20:00:00",
    status: "registering",
    entryFee: 25,
    type: "eliminatório",
    featured: false,
  },
  {
    id: 5,
    name: "Go Masters Tournament",
    game: "Go",
    gameIcon: "⬤",
    prizePool: 50000,
    currentPool: 42000,
    players: 32,
    maxPlayers: 64,
    startTime: "2026-01-24T14:00:00",
    status: "registering",
    entryFee: 200,
    type: "eliminatório",
    featured: true,
  },
  {
    id: 6,
    name: "Reversi Weekly",
    game: "Reversi",
    gameIcon: "◐",
    prizePool: 3000,
    currentPool: 2100,
    players: 42,
    maxPlayers: 64,
    startTime: "2026-01-24T19:00:00",
    status: "registering",
    entryFee: 15,
    type: "suíço",
    featured: false,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "starting":
      return (
        <Badge className="bg-success/20 text-success border-success/30">
          <Clock className="w-3 h-3 mr-1" />
          Iniciando em breve
        </Badge>
      );
    case "live":
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <Flame className="w-3 h-3 mr-1" />
          Ao vivo
        </Badge>
      );
    default:
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          Inscrições abertas
        </Badge>
      );
  }
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const Tournaments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = gameFilter === "all" || t.game === gameFilter;
    return matchesSearch && matchesGame;
  });

  const featuredTournaments = filteredTournaments.filter((t) => t.featured);
  const regularTournaments = filteredTournaments.filter((t) => !t.featured);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4"
          >
            <span className="text-gradient-gold">Torneios</span> Competitivos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg"
          >
            Participe de torneios e dispute prêmios reais
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar torneios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por jogo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os jogos</SelectItem>
              <SelectItem value="Xadrez">Xadrez</SelectItem>
              <SelectItem value="Damas">Damas</SelectItem>
              <SelectItem value="Go">Go</SelectItem>
              <SelectItem value="Sudoku">Sudoku</SelectItem>
              <SelectItem value="Quiz">Quiz</SelectItem>
              <SelectItem value="Reversi">Reversi</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Featured Tournaments */}
        {featuredTournaments.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="font-display text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Em Destaque
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {featuredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="relative bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl md:rounded-2xl border border-accent/30 p-4 md:p-6 hover:border-accent/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-accent/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-accent/20 flex items-center justify-center text-xl md:text-2xl">
                          {tournament.gameIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(tournament.status)}
                            <Badge variant="outline" className="text-xs">{tournament.type}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{tournament.game}</span>
                        </div>
                      </div>

                      <h3 className="font-display text-lg md:text-xl font-bold mb-2 truncate">{tournament.name}</h3>

                      {/* Prize Pool Progress */}
                      <div className="mb-3 md:mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Pool do Prêmio</span>
                          <span className="font-display font-bold text-gradient-gold">
                            {formatCurrency(tournament.currentPool)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-amber-500 rounded-full"
                            style={{ width: `${(tournament.currentPool / tournament.prizePool) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Meta: {formatCurrency(tournament.prizePool)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 text-xs md:text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                          <span>{tournament.players}/{tournament.maxPlayers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                          <span>{formatDateTime(tournament.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                          <span>{formatCurrency(tournament.entryFee)}</span>
                        </div>
                      </div>

                      <Button variant="gold" className="w-full">
                        Inscrever-se
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Tournaments */}
        <div>
          <h2 className="font-display text-lg md:text-xl font-bold mb-4">Todos os Torneios</h2>
          <div className="space-y-3 md:space-y-4">
            {regularTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <div className="bg-card rounded-xl border border-border p-4 md:p-6 hover:border-primary/50 transition-all">
                  <div className="flex flex-col gap-4">
                    {/* Top Row */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-muted flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
                        {tournament.gameIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {getStatusBadge(tournament.status)}
                          <span className="text-xs md:text-sm text-muted-foreground">{tournament.game}</span>
                        </div>
                        <h3 className="font-display text-base md:text-lg font-bold truncate">{tournament.name}</h3>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="font-display text-sm md:text-xl font-bold text-gradient-gold">
                          {formatCurrency(tournament.currentPool)}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">Prêmio</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="font-semibold text-xs md:text-sm">{tournament.players}/{tournament.maxPlayers}</span>
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">Jogadores</div>
                      </div>
                      <div>
                        <div className="font-semibold text-xs md:text-sm">{formatDateTime(tournament.startTime)}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">Início</div>
                      </div>
                      <div>
                        <div className="font-semibold text-xs md:text-sm">{formatCurrency(tournament.entryFee)}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">Inscrição</div>
                      </div>
                    </div>

                    {/* Button */}
                    <Button variant="hero" className="w-full">Participar</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tournaments;
