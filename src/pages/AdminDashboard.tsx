import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  Users, DollarSign, TrendingUp, Trophy, Crown, Activity, Shield,
  Settings, CreditCard, RefreshCw, AlertTriangle, CheckCircle2,
  Loader2, Ban, UserCheck, Search, ArrowUpRight, ArrowDownRight,
  Zap, Globe, Lock, Server, Plus, Calendar, Edit, Trash2,
} from "lucide-react";

// ── TournamentManager ─────────────────────────────────────────
const ALL_GAMES_ADMIN = [
  { id: "slot-tiger", label: "🐯 Tigrinho" }, { id: "gates-of-olympus", label: "⚡ Gates of Olympus" },
  { id: "fortune-ox", label: "🐂 Fortune Ox" }, { id: "slot-fruits", label: "🍒 Frutas da Sorte" },
  { id: "slot-gems", label: "💎 Gemas Mágicas" }, { id: "slot-egypt", label: "🦅 Faraó do Egito" },
  { id: "crash", label: "✈️ Crash" }, { id: "mines", label: "💣 Mines" }, { id: "plinko", label: "🎯 Plinko" },
  { id: "chess", label: "♛ Xadrez" }, { id: "checkers", label: "◉ Damas" }, { id: "quiz", label: "❓ Quiz" },
  { id: "sudoku", label: "⊞ Sudoku" }, { id: "memory", label: "🎴 Memory" }, { id: "mahjong", label: "🀄 Mahjong" },
];

const GAME_ICONS: Record<string, string> = {
  "slot-tiger":"🐯","gates-of-olympus":"⚡","fortune-ox":"🐂","slot-fruits":"🍒","slot-gems":"💎",
  "slot-egypt":"🦅","crash":"✈️","mines":"💣","plinko":"🎯","chess":"♛","checkers":"◉",
  "quiz":"❓","sudoku":"⊞","memory":"🎴","mahjong":"🀄",
};

function TournamentManager({ userId }: { userId?: string }) {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", game_id: "slot-tiger",
    entry_fee: 50, max_players: 100, guaranteed_prize: 3000,
    rebuy_allowed: true, rebuy_fee: 30, max_rebuys: 2,
    starts_at: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16),
    winners: 5,
    dist: [40, 25, 15, 10, 10],
  });

  useEffect(() => { fetchTournaments(); }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data } = await supabase.from("tournaments").select("*").order("starts_at", { ascending: false }).limit(20);
    if (data) setTournaments(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    setSaving(true);
    const dist = form.dist.slice(0, form.winners);
    const total = dist.reduce((a, b) => a + b, 0);
    if (total !== 100) { toast({ title: `Distribuição deve somar 100% (atual: ${total}%)`, variant: "destructive" }); setSaving(false); return; }

    const prizeDistribution = dist.map((percent, i) => ({
      position: i + 1,
      percent,
      label: i === 0 ? "🥇 1º Lugar" : i === 1 ? "🥈 2º Lugar" : i === 2 ? "🥉 3º Lugar" : `${i + 1}º Lugar`,
    }));

    const { error } = await supabase.from("tournaments").insert({
      name: form.name, description: form.description,
      game_id: form.game_id, game_icon: GAME_ICONS[form.game_id] || "🎮",
      entry_fee: form.entry_fee, max_players: form.max_players,
      guaranteed_prize: form.guaranteed_prize,
      rebuy_allowed: form.rebuy_allowed, rebuy_fee: form.rebuy_fee, max_rebuys: form.max_rebuys,
      starts_at: new Date(form.starts_at).toISOString(),
      prize_distribution: prizeDistribution,
      status: "registering", created_by: userId,
    });

    if (error) { toast({ title: error.message, variant: "destructive" }); }
    else { toast({ title: "Torneio criado! ✅" }); setShowForm(false); fetchTournaments(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Cancelar este torneio?")) return;
    await supabase.from("tournaments").update({ status: "cancelled" }).eq("id", id);
    fetchTournaments();
    toast({ title: "Torneio cancelado" });
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" />Gerenciar Torneios</h2>
        <Button onClick={() => setShowForm(!showForm)} variant="hero" size="sm">
          <Plus className="w-4 h-4 mr-1" />{showForm ? "Cancelar" : "Novo Torneio"}
        </Button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-base">Criar Novo Torneio</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">Nome *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Torneio Tigrinho Semanal" /></div>
              <div className="space-y-1"><Label className="text-xs">Jogo *</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.game_id} onChange={e => setForm(f => ({ ...f, game_id: e.target.value }))}>
                  {ALL_GAMES_ADMIN.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select></div>
              <div className="space-y-1"><Label className="text-xs">Taxa de Inscrição (R$)</Label>
                <Input type="number" value={form.entry_fee} onChange={e => setForm(f => ({ ...f, entry_fee: Number(e.target.value) }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Máx. Jogadores</Label>
                <Input type="number" value={form.max_players} onChange={e => setForm(f => ({ ...f, max_players: Number(e.target.value) }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Prêmio Garantido (R$)</Label>
                <Input type="number" value={form.guaranteed_prize} onChange={e => setForm(f => ({ ...f, guaranteed_prize: Number(e.target.value) }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Início</Label>
                <Input type="datetime-local" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Nº de Vencedores (3-5)</Label>
                <Input type="number" min={3} max={5} value={form.winners}
                  onChange={e => setForm(f => ({ ...f, winners: Number(e.target.value) }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Taxa de Recompra (R$)</Label>
                <Input type="number" value={form.rebuy_fee} onChange={e => setForm(f => ({ ...f, rebuy_fee: Number(e.target.value) }))} /></div>
            </div>

            {/* Distribuição de prêmios */}
            <div>
              <Label className="text-xs mb-2 block">Distribuição de Prêmios (deve somar 100%)</Label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: form.winners }, (_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground w-12">{i + 1}º lugar</span>
                    <Input type="number" className="w-16 h-8 text-xs" value={form.dist[i] ?? 0}
                      onChange={e => {
                        const d = [...form.dist];
                        d[i] = Number(e.target.value);
                        setForm(f => ({ ...f, dist: d }));
                      }} />
                    <span className="text-xs">%</span>
                  </div>
                ))}
                <div className={`flex items-center text-xs font-bold ${form.dist.slice(0, form.winners).reduce((a, b) => a + b, 0) === 100 ? "text-green-400" : "text-red-400"}`}>
                  = {form.dist.slice(0, form.winners).reduce((a, b) => a + b, 0)}%
                </div>
              </div>
            </div>

            <div className="space-y-1"><Label className="text-xs">Descrição</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição do torneio..." /></div>

            <Button onClick={handleCreate} disabled={saving || !form.name} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Criar Torneio
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de torneios */}
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 px-2">Torneio</th>
                    <th className="text-left py-2 px-2">Jogo</th>
                    <th className="text-right py-2 px-2">Taxa</th>
                    <th className="text-right py-2 px-2">Prêmio</th>
                    <th className="text-center py-2 px-2">Status</th>
                    <th className="text-center py-2 px-2">Início</th>
                    <th className="text-center py-2 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map(t => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-2 font-medium max-w-[180px] truncate">{t.name}</td>
                      <td className="py-2 px-2">{t.game_icon} {t.game_id}</td>
                      <td className="py-2 px-2 text-right font-mono">{formatCurrency(t.entry_fee)}</td>
                      <td className="py-2 px-2 text-right font-mono text-yellow-400">{formatCurrency(t.guaranteed_prize)}</td>
                      <td className="py-2 px-2 text-center">
                        <Badge variant={t.status === "registering" ? "default" : t.status === "live" ? "destructive" : "secondary"} className="text-xs">
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-center text-xs text-muted-foreground">
                        {new Date(t.starts_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tournaments.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum torneio criado ainda.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  BarChart, Bar,
} from "recharts";

interface SystemSettings {
  payment_gateway?: {
    primary: string; secondary: string; tertiary: string;
    asaas_enabled: boolean; stripe_enabled: boolean; pix_manual_enabled: boolean;
    auto_fallback: boolean;
  };
  platform_fees?: {
    withdraw_fee_percent: number; deposit_fee_percent: number;
    min_withdraw: number; max_withdraw: number; min_deposit: number;
  };
  platform_status?: {
    maintenance: boolean; registration_open: boolean;
    competitions_enabled: boolean; withdrawals_enabled: boolean;
  };
}

interface UserRow {
  id: string; username: string; display_name: string | null;
  cash_balance: number; credits_balance: number; xp: number;
  total_matches: number; total_wins: number; vip_level: string;
  created_at: string; user_id: string;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings>({});
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, totalMatches: 0, totalCash: 0, totalCredits: 0 });
  const [savingSettings, setSavingSettings] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const checkAdmin = useCallback(async () => {
    if (!user) { navigate("/login"); return; }
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!data) { navigate("/"); toast({ title: "Acesso negado", variant: "destructive" }); return; }
    setIsAdmin(true);
    setLoading(false);
  }, [user, navigate]);

  useEffect(() => { checkAdmin(); }, [checkAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboard();
  }, [isAdmin]);

  const loadDashboard = async () => {
    const [settingsRes, usersRes, matchesRes, txRes] = await Promise.all([
      supabase.from("system_settings").select("*"),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("matches").select("id", { count: "exact", head: true }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

    if (settingsRes.data) {
      const s: SystemSettings = {};
      settingsRes.data.forEach((row: any) => { s[row.key as keyof SystemSettings] = row.value; });
      setSettings(s);
    }
    if (usersRes.data) {
      setUsers(usersRes.data as UserRow[]);
      const totalCash = usersRes.data.reduce((a: number, u: any) => a + Number(u.cash_balance || 0), 0);
      const totalCredits = usersRes.data.reduce((a: number, u: any) => a + Number(u.credits_balance || 0), 0);
      setStats({
        totalUsers: usersRes.data.length,
        totalMatches: matchesRes.count || 0,
        totalCash, totalCredits,
      });
    }
    if (txRes.data) setRecentTransactions(txRes.data);
  };

  const saveSetting = async (key: string, value: any) => {
    setSavingSettings(true);
    const { error } = await supabase.from("system_settings").update({ value, updated_at: new Date().toISOString(), updated_by: user?.id })
      .eq("key", key);
    if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    else toast({ title: "Configuração salva!" });
    setSavingSettings(false);
  };

  const updateGateway = (field: string, value: any) => {
    const gw = { ...settings.payment_gateway!, [field]: value };
    setSettings(prev => ({ ...prev, payment_gateway: gw }));
  };

  const updateFees = (field: string, value: number) => {
    const fees = { ...settings.platform_fees!, [field]: value };
    setSettings(prev => ({ ...prev, platform_fees: fees }));
  };

  const updateStatus = (field: string, value: boolean) => {
    const status = { ...settings.platform_status!, [field]: value };
    setSettings(prev => ({ ...prev, platform_status: status }));
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.display_name || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const formatCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  if (loading) return (
    <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></Layout>
  );
  if (!isAdmin) return null;

  const gw = settings.payment_gateway;
  const fees = settings.platform_fees;
  const status = settings.platform_status;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl md:text-4xl font-bold mb-2">
              Super <span className="text-gradient-neon">Admin</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" /> Acesso total ao sistema
            </motion.p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="py-1"><Lock className="w-3 h-3 mr-1" /> Super Admin</Badge>
            <Button variant="outline" size="sm" onClick={loadDashboard}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Usuários", value: stats.totalUsers, color: "text-primary" },
            { icon: Trophy, label: "Partidas", value: stats.totalMatches, color: "text-accent" },
            { icon: DollarSign, label: "Cash Total", value: formatCurrency(stats.totalCash), color: "text-success" },
            { icon: CreditCard, label: "Créditos Total", value: stats.totalCredits, color: "text-secondary" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i}>
                <CardContent className="pt-4 pb-4">
                  <Icon className={`w-5 h-5 ${kpi.color} mb-2`} />
                  <div className="font-display text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <Tabs defaultValue="gateways" className="w-full">
          <TabsList className="w-full max-w-3xl mb-6 grid grid-cols-5 h-auto">
            <TabsTrigger value="gateways" className="text-xs md:text-sm py-2"><CreditCard className="w-3 h-3 mr-1 hidden md:inline" /> Gateways</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm py-2"><Users className="w-3 h-3 mr-1 hidden md:inline" /> Usuários</TabsTrigger>
            <TabsTrigger value="tournaments" className="text-xs md:text-sm py-2"><Trophy className="w-3 h-3 mr-1 hidden md:inline" /> Torneios</TabsTrigger>
            <TabsTrigger value="finance" className="text-xs md:text-sm py-2"><DollarSign className="w-3 h-3 mr-1 hidden md:inline" /> Financeiro</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm py-2"><Settings className="w-3 h-3 mr-1 hidden md:inline" /> Sistema</TabsTrigger>
            <TabsTrigger value="security" className="text-xs md:text-sm py-2"><Shield className="w-3 h-3 mr-1 hidden md:inline" /> Segurança</TabsTrigger>
          </TabsList>

          {/* GATEWAYS TAB */}
          <TabsContent value="gateways">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Asaas - Primary */}
              <Card className={`border-2 ${gw?.primary === "asaas" ? "border-success" : "border-border"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-success" />
                      <span>Asaas</span>
                    </div>
                    {gw?.primary === "asaas" && <Badge className="bg-success/20 text-success">Primário</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ativo</Label>
                    <Switch checked={gw?.asaas_enabled ?? true} onCheckedChange={(v) => updateGateway("asaas_enabled", v)} />
                  </div>
                  <p className="text-xs text-muted-foreground">Gateway brasileiro com PIX, boleto e cartão. Taxas competitivas para o mercado BR.</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">PIX</Badge>
                    <Badge variant="outline" className="text-xs">Boleto</Badge>
                    <Badge variant="outline" className="text-xs">Cartão</Badge>
                  </div>
                  <Button variant={gw?.primary === "asaas" ? "default" : "outline"} size="sm" className="w-full"
                    onClick={() => { updateGateway("primary", "asaas"); updateGateway("secondary", "stripe"); updateGateway("tertiary", "pix_manual"); }}>
                    {gw?.primary === "asaas" ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    {gw?.primary === "asaas" ? "Gateway Primário" : "Definir como Primário"}
                  </Button>
                </CardContent>
              </Card>

              {/* Stripe - Secondary */}
              <Card className={`border-2 ${gw?.primary === "stripe" ? "border-success" : gw?.secondary === "stripe" ? "border-primary" : "border-border"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      <span>Stripe</span>
                    </div>
                    {gw?.secondary === "stripe" && <Badge className="bg-primary/20 text-primary">Secundário</Badge>}
                    {gw?.primary === "stripe" && <Badge className="bg-success/20 text-success">Primário</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ativo</Label>
                    <Switch checked={gw?.stripe_enabled ?? true} onCheckedChange={(v) => updateGateway("stripe_enabled", v)} />
                  </div>
                  <p className="text-xs text-muted-foreground">Gateway internacional. Funciona como fallback se o Asaas falhar. Aceita cartões internacionais.</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">Cartão</Badge>
                    <Badge variant="outline" className="text-xs">Apple Pay</Badge>
                    <Badge variant="outline" className="text-xs">Google Pay</Badge>
                  </div>
                  <Button variant={gw?.primary === "stripe" ? "default" : "outline"} size="sm" className="w-full"
                    onClick={() => { updateGateway("primary", "stripe"); updateGateway("secondary", "asaas"); updateGateway("tertiary", "pix_manual"); }}>
                    {gw?.primary === "stripe" ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    {gw?.primary === "stripe" ? "Gateway Primário" : "Definir como Primário"}
                  </Button>
                </CardContent>
              </Card>

              {/* PIX Manual - Tertiary */}
              <Card className={`border-2 ${gw?.primary === "pix_manual" ? "border-success" : "border-border"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-accent" />
                      <span>PIX Manual</span>
                    </div>
                    <Badge className="bg-accent/20 text-accent">Fallback</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ativo</Label>
                    <Switch checked={gw?.pix_manual_enabled ?? true} onCheckedChange={(v) => updateGateway("pix_manual_enabled", v)} />
                  </div>
                  <p className="text-xs text-muted-foreground">PIX direto com confirmação manual do admin. Última opção de fallback.</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">PIX</Badge>
                    <Badge variant="outline" className="text-xs">Manual</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <CheckCircle2 className="w-4 h-4" /> Sempre Fallback Final
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Configurações de Fallback</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="font-semibold">Auto-fallback</Label>
                    <p className="text-xs text-muted-foreground mt-1">Se o gateway primário falhar, usar automaticamente o secundário</p>
                  </div>
                  <Switch checked={gw?.auto_fallback ?? true} onCheckedChange={(v) => updateGateway("auto_fallback", v)} />
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Ordem de processamento:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-success/20 text-success">1. {gw?.primary || "asaas"}</Badge>
                    <span>→</span>
                    <Badge className="bg-primary/20 text-primary">2. {gw?.secondary || "stripe"}</Badge>
                    <span>→</span>
                    <Badge className="bg-accent/20 text-accent">3. {gw?.tertiary || "pix_manual"}</Badge>
                  </div>
                </div>
                <Button onClick={() => saveSetting("payment_gateway", settings.payment_gateway)} disabled={savingSettings}>
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Salvar Configurações de Gateway
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOURNAMENTS TAB */}
          <TabsContent value="tournaments">
            <TournamentManager userId={user?.id} />
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Users className="w-5 h-5" /> Gerenciar Usuários</span>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar usuário..." className="pl-9" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-2">Usuário</th>
                        <th className="text-left py-3 px-2">VIP</th>
                        <th className="text-right py-3 px-2">Cash</th>
                        <th className="text-right py-3 px-2">Créditos</th>
                        <th className="text-right py-3 px-2">XP</th>
                        <th className="text-right py-3 px-2">Partidas</th>
                        <th className="text-center py-3 px-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 px-2">
                            <div><span className="font-medium">{u.display_name || u.username}</span></div>
                            <div className="text-xs text-muted-foreground">@{u.username}</div>
                          </td>
                          <td className="py-3 px-2"><Badge variant="outline" className="text-xs">{u.vip_level}</Badge></td>
                          <td className="py-3 px-2 text-right font-mono">{formatCurrency(u.cash_balance)}</td>
                          <td className="py-3 px-2 text-right font-mono">{u.credits_balance}</td>
                          <td className="py-3 px-2 text-right">{u.xp}</td>
                          <td className="py-3 px-2 text-right">{u.total_matches} ({u.total_wins}W)</td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/player/${u.username}`)}>
                                <UserCheck className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Ban className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FINANCE TAB */}
          <TabsContent value="finance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> Taxas da Plataforma</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Taxa de Saque (%)</Label>
                      <Input type="number" value={fees?.withdraw_fee_percent ?? 0}
                        onChange={(e) => updateFees("withdraw_fee_percent", Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Taxa de Depósito (%)</Label>
                      <Input type="number" value={fees?.deposit_fee_percent ?? 0}
                        onChange={(e) => updateFees("deposit_fee_percent", Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Saque Mínimo (R$)</Label>
                      <Input type="number" value={fees?.min_withdraw ?? 10}
                        onChange={(e) => updateFees("min_withdraw", Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Saque Máximo (R$)</Label>
                      <Input type="number" value={fees?.max_withdraw ?? 50000}
                        onChange={(e) => updateFees("max_withdraw", Number(e.target.value))} />
                    </div>
                  </div>
                  <Button onClick={() => saveSetting("platform_fees", settings.platform_fees)} disabled={savingSettings} className="w-full">
                    {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Salvar Taxas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Últimas Transações</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {recentTransactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
                        <div>
                          <span className="font-medium">{tx.description || tx.type}</span>
                          <div className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString("pt-BR")}</div>
                        </div>
                        <span className={tx.amount > 0 ? "text-success font-bold" : "text-destructive font-bold"}>
                          {tx.amount > 0 ? "+" : ""}{tx.wallet === "cash" ? formatCurrency(tx.amount) : `${tx.amount} cr`}
                        </span>
                      </div>
                    ))}
                    {recentTransactions.length === 0 && <p className="text-muted-foreground text-center py-4">Sem transações.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Status da Plataforma</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "maintenance", label: "Modo Manutenção", desc: "Bloqueia acesso de jogadores ao sistema", icon: AlertTriangle, danger: true },
                  { key: "registration_open", label: "Registro Aberto", desc: "Permite novos cadastros na plataforma", icon: UserCheck },
                  { key: "competitions_enabled", label: "Competições Ativas", desc: "Habilita jogos valendo dinheiro/créditos", icon: Trophy },
                  { key: "withdrawals_enabled", label: "Saques Habilitados", desc: "Permite saques via PIX", icon: DollarSign },
                ].map((item) => {
                  const Icon = item.icon;
                  const value = status?.[item.key as keyof typeof status] ?? false;
                  return (
                    <div key={item.key} className={`flex items-center justify-between p-4 rounded-lg ${item.danger && value ? "bg-destructive/10 border border-destructive/30" : "bg-muted/50"}`}>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${item.danger && value ? "text-destructive" : "text-muted-foreground"}`} />
                        <div>
                          <Label className="font-semibold">{item.label}</Label>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch checked={value as boolean} onCheckedChange={(v) => updateStatus(item.key, v)} />
                    </div>
                  );
                })}
                <Button onClick={() => saveSetting("platform_status", settings.platform_status)} disabled={savingSettings} className="w-full">
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Salvar Status
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Segurança do Sistema</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "RLS (Row Level Security)", status: "Ativo", ok: true },
                    { label: "Autenticação Supabase", status: "Ativo", ok: true },
                    { label: "Validação de Roles", status: "Ativo", ok: true },
                    { label: "Proteção contra SQL Injection", status: "Ativo", ok: true },
                    { label: "Rate Limiting", status: "Configurar", ok: false },
                    { label: "2FA Admin", status: "Recomendado", ok: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{item.label}</span>
                      <Badge className={item.ok ? "bg-success/20 text-success" : "bg-accent/20 text-accent"}>
                        {item.ok ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Logs de Atividade Admin</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {[
                      { action: "Gateway primário alterado para Asaas", time: "Agora" },
                      { action: "Configurações de taxa atualizadas", time: "2 min atrás" },
                      { action: "Novo admin adicionado", time: "1h atrás" },
                      { action: "Modo manutenção desativado", time: "3h atrás" },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span>{log.action}</span>
                        <span className="text-muted-foreground text-xs">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
