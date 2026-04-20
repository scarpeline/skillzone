import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { TrendingUp, Clock, Users, Star, Zap, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Odd {
  id: string;
  label: string;
  value: number;
}

interface Event {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeIcon: string;
  awayIcon: string;
  league: string;
  time: string;
  status: "live" | "upcoming";
  odds: { home: Odd; draw: Odd; away: Odd };
  viewers?: number;
}

const sports = [
  { id: "all", label: "Todos", icon: "⚡" },
  { id: "football", label: "Futebol", icon: "⚽" },
  { id: "basketball", label: "Basquete", icon: "🏀" },
  { id: "tennis", label: "Tênis", icon: "🎾" },
  { id: "mma", label: "MMA", icon: "🥊" },
  { id: "esports", label: "E-Sports", icon: "🎮" },
];

const events: (Event & { sport: string })[] = [
  {
    id: "1", sport: "football",
    homeTeam: "Flamengo", awayTeam: "Palmeiras",
    homeIcon: "🔴", awayIcon: "🟢",
    league: "Brasileirão Série A", time: "AO VIVO 67'",
    status: "live", viewers: 12400,
    odds: {
      home: { id: "1h", label: "Flamengo", value: 2.10 },
      draw: { id: "1d", label: "Empate", value: 3.20 },
      away: { id: "1a", label: "Palmeiras", value: 3.50 },
    },
  },
  {
    id: "2", sport: "football",
    homeTeam: "Real Madrid", awayTeam: "Barcelona",
    homeIcon: "⚪", awayIcon: "🔵",
    league: "La Liga", time: "AO VIVO 34'",
    status: "live", viewers: 45200,
    odds: {
      home: { id: "2h", label: "Real Madrid", value: 1.85 },
      draw: { id: "2d", label: "Empate", value: 3.60 },
      away: { id: "2a", label: "Barcelona", value: 4.20 },
    },
  },
  {
    id: "3", sport: "football",
    homeTeam: "Manchester City", awayTeam: "Arsenal",
    homeIcon: "🔵", awayIcon: "🔴",
    league: "Premier League", time: "Hoje 21:00",
    status: "upcoming", viewers: undefined,
    odds: {
      home: { id: "3h", label: "Man City", value: 1.65 },
      draw: { id: "3d", label: "Empate", value: 3.80 },
      away: { id: "3a", label: "Arsenal", value: 5.00 },
    },
  },
  {
    id: "4", sport: "basketball",
    homeTeam: "Lakers", awayTeam: "Warriors",
    homeIcon: "💛", awayIcon: "🔵",
    league: "NBA", time: "AO VIVO Q3",
    status: "live", viewers: 8900,
    odds: {
      home: { id: "4h", label: "Lakers", value: 1.90 },
      draw: { id: "4d", label: "OT", value: 12.00 },
      away: { id: "4a", label: "Warriors", value: 1.95 },
    },
  },
  {
    id: "5", sport: "tennis",
    homeTeam: "Alcaraz", awayTeam: "Djokovic",
    homeIcon: "🇪🇸", awayIcon: "🇷🇸",
    league: "Roland Garros", time: "Hoje 15:00",
    status: "upcoming", viewers: undefined,
    odds: {
      home: { id: "5h", label: "Alcaraz", value: 2.30 },
      draw: { id: "5d", label: "-", value: 0 },
      away: { id: "5a", label: "Djokovic", value: 1.65 },
    },
  },
  {
    id: "6", sport: "esports",
    homeTeam: "FURIA", awayTeam: "NAVI",
    homeIcon: "🇧🇷", awayIcon: "🇺🇦",
    league: "CS2 Major", time: "AO VIVO MAP 2",
    status: "live", viewers: 22100,
    odds: {
      home: { id: "6h", label: "FURIA", value: 2.80 },
      draw: { id: "6d", label: "-", value: 0 },
      away: { id: "6a", label: "NAVI", value: 1.45 },
    },
  },
  {
    id: "7", sport: "mma",
    homeTeam: "Poatan", awayTeam: "Pereira",
    homeIcon: "🇧🇷", awayIcon: "🇧🇷",
    league: "UFC 310", time: "Amanhã 23:00",
    status: "upcoming", viewers: undefined,
    odds: {
      home: { id: "7h", label: "Poatan", value: 1.75 },
      draw: { id: "7d", label: "Empate", value: 25.00 },
      away: { id: "7a", label: "Pereira", value: 2.10 },
    },
  },
];

interface BetSelection {
  eventId: string;
  oddId: string;
  label: string;
  value: number;
  match: string;
}

export default function Sports() {
  const { user } = useAuth();
  const [activeSport, setActiveSport] = useState("all");
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [betAmount, setBetAmount] = useState("10");

  const filtered = activeSport === "all"
    ? events
    : events.filter(e => e.sport === activeSport);

  const liveEvents = filtered.filter(e => e.status === "live");
  const upcomingEvents = filtered.filter(e => e.status === "upcoming");

  const totalOdd = betSlip.reduce((acc, b) => acc * b.value, 1);
  const potentialWin = Number(betAmount) * totalOdd;

  const toggleSelection = (event: Event & { sport: string }, odd: Odd, matchLabel: string) => {
    if (!user) {
      toast({ title: "Faça login para apostar", variant: "destructive" });
      return;
    }
    const exists = betSlip.find(b => b.oddId === odd.id);
    if (exists) {
      setBetSlip(prev => prev.filter(b => b.oddId !== odd.id));
    } else {
      // Remove other odds from same event
      const filtered = betSlip.filter(b => b.eventId !== event.id);
      setBetSlip([...filtered, {
        eventId: event.id,
        oddId: odd.id,
        label: odd.label,
        value: odd.value,
        match: matchLabel,
      }]);
    }
  };

  const placeBet = () => {
    if (!user) { toast({ title: "Faça login para apostar", variant: "destructive" }); return; }
    if (betSlip.length === 0) { toast({ title: "Selecione pelo menos uma odd", variant: "destructive" }); return; }
    toast({
      title: "✅ Aposta registrada!",
      description: `R$ ${betAmount} → Ganho potencial: R$ ${potentialWin.toFixed(2)}`,
    });
    setBetSlip([]);
    setBetAmount("10");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Apostas <span className="text-gradient-neon">Esportivas</span>
          </h1>
          <p className="text-muted-foreground">Aposte nos melhores eventos ao vivo e futuros</p>
        </motion.div>

        {/* Sport Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {sports.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSport(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                activeSport === s.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live */}
            {liveEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="font-bold text-lg">Ao Vivo</h2>
                  <Badge variant="destructive" className="text-xs">{liveEvents.length}</Badge>
                </div>
                <div className="space-y-3">
                  {liveEvents.map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={i}
                      betSlip={betSlip}
                      onSelect={toggleSelection}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-bold text-lg">Em Breve</h2>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={i}
                      betSlip={betSlip}
                      onSelect={toggleSelection}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bet Slip */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4 text-primary" />
                    Seu Slip
                    {betSlip.length > 0 && (
                      <Badge className="ml-auto">{betSlip.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {betSlip.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Clique nas odds para adicionar ao slip</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {betSlip.map(sel => (
                          <div key={sel.oddId} className="flex items-center justify-between bg-muted rounded-lg p-2 text-sm">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{sel.match}</p>
                              <p className="text-muted-foreground text-xs">{sel.label}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <span className="font-bold text-primary">{sel.value.toFixed(2)}</span>
                              <button
                                onClick={() => setBetSlip(prev => prev.filter(b => b.oddId !== sel.oddId))}
                                className="text-muted-foreground hover:text-destructive text-xs"
                              >✕</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Valor da aposta (R$)</label>
                        <div className="flex gap-2">
                          {["5", "10", "25", "50"].map(v => (
                            <button
                              key={v}
                              onClick={() => setBetAmount(v)}
                              className={`flex-1 py-1.5 rounded text-xs font-medium border transition-all ${
                                betAmount === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={e => setBetAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                          placeholder="Valor personalizado"
                        />
                      </div>

                      <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Odd total</span>
                          <span className="font-bold">{totalOdd.toFixed(2)}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aposta</span>
                          <span>R$ {Number(betAmount).toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between font-bold text-primary">
                          <span>Ganho potencial</span>
                          <span>R$ {potentialWin.toFixed(2)}</span>
                        </div>
                      </div>

                      {user ? (
                        <Button className="w-full" onClick={placeBet}>
                          <Zap className="w-4 h-4" /> Apostar Agora
                        </Button>
                      ) : (
                        <Link to="/login">
                          <Button className="w-full" variant="outline">
                            <Lock className="w-4 h-4" /> Entrar para Apostar
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function EventCard({
  event,
  index,
  betSlip,
  onSelect,
}: {
  event: Event & { sport: string };
  index: number;
  betSlip: BetSelection[];
  onSelect: (event: Event & { sport: string }, odd: Odd, match: string) => void;
}) {
  const matchLabel = `${event.homeTeam} vs ${event.awayTeam}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:border-primary/40 transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{event.league}</span>
            <div className="flex items-center gap-2">
              {event.status === "live" && (
                <>
                  {event.viewers && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {event.viewers.toLocaleString()}
                    </span>
                  )}
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 animate-pulse">
                    ● AO VIVO
                  </Badge>
                </>
              )}
              {event.status === "upcoming" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {event.time}
                </span>
              )}
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{event.homeIcon}</span>
              <span className="font-bold text-sm">{event.homeTeam}</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium px-2">VS</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{event.awayTeam}</span>
              <span className="text-2xl">{event.awayIcon}</span>
            </div>
          </div>

          {/* Odds */}
          <div className="grid grid-cols-3 gap-2">
            {[event.odds.home, event.odds.draw, event.odds.away].map(odd => {
              if (odd.value === 0) return <div key={odd.id} />;
              const selected = betSlip.some(b => b.oddId === odd.id);
              return (
                <button
                  key={odd.id}
                  onClick={() => onSelect(event, odd, matchLabel)}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="text-[10px] mb-0.5 opacity-70">{odd.label}</span>
                  <span className="font-bold text-sm">{odd.value.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
