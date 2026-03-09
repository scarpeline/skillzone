import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet as WalletIcon, Coins, ArrowUpRight, ArrowDownLeft,
  TrendingUp, Gift, Plus, CreditCard, QrCode, Loader2, AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Transaction {
  id: string;
  type: string;
  description: string | null;
  amount: number;
  created_at: string;
  wallet: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.abs(value));
}

function getTransactionIcon(type: string) {
  switch (type) {
    case "prize": return <ArrowDownLeft className="w-4 h-4 text-success" />;
    case "credit": return <Plus className="w-4 h-4 text-primary" />;
    case "donation": return <Gift className="w-4 h-4 text-secondary" />;
    case "withdraw": return <ArrowUpRight className="w-4 h-4 text-destructive" />;
    case "entry": return <ArrowUpRight className="w-4 h-4 text-accent" />;
    case "bonus": return <TrendingUp className="w-4 h-4 text-success" />;
    default: return <Coins className="w-4 h-4" />;
  }
}

const Wallet = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (profile) fetchTransactions();
  }, [user, profile]);

  const fetchTransactions = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setTransactions(data);
    setLoading(false);
  };

  const handleBuyCredits = async () => {
    if (!profile || !buyAmount) return;
    setProcessing(true);
    try {
      const amount = Number(buyAmount);
      if (amount < 5) { toast({ title: "Erro", description: "Mínimo de 5 créditos", variant: "destructive" }); return; }

      await supabase.from("transactions").insert({
        user_id: profile.id, type: "credit", wallet: "credits",
        amount, description: `Compra de ${amount} créditos`,
      });
      await supabase.from("profiles").update({
        credits_balance: profile.credits_balance + amount,
      }).eq("id", profile.id);

      await refreshProfile();
      await fetchTransactions();
      setBuyAmount("");
      toast({ title: "Compra realizada!", description: `+${amount} créditos adicionados` });
    } catch { toast({ title: "Erro", description: "Falha ao processar", variant: "destructive" }); }
    finally { setProcessing(false); }
  };

  const handleWithdraw = async () => {
    if (!profile || !withdrawAmount || !pixKey) return;
    setProcessing(true);
    try {
      const amount = Number(withdrawAmount);
      if (amount > profile.cash_balance) { toast({ title: "Saldo insuficiente", variant: "destructive" }); return; }
      if (amount < 10) { toast({ title: "Erro", description: "Mínimo R$10 para saque", variant: "destructive" }); return; }

      await supabase.from("transactions").insert({
        user_id: profile.id, type: "withdraw", wallet: "cash",
        amount: -amount, description: `Saque PIX - ${pixKey}`,
      });
      await supabase.from("profiles").update({
        cash_balance: profile.cash_balance - amount,
      }).eq("id", profile.id);

      await refreshProfile();
      await fetchTransactions();
      setWithdrawAmount("");
      setPixKey("");
      toast({ title: "Saque solicitado!", description: `${formatCurrency(amount)} será enviado via PIX` });
    } catch { toast({ title: "Erro", description: "Falha ao processar", variant: "destructive" }); }
    finally { setProcessing(false); }
  };

  const cashBalance = profile?.cash_balance ?? 0;
  const creditsBalance = profile?.credits_balance ?? 0;

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Sua <span className="text-gradient-neon">Carteira</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg">
            Gerencie seu dinheiro e créditos
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base font-normal text-muted-foreground">
                <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-success" /> Dinheiro (Sacável)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl md:text-4xl font-bold text-success mb-3">{formatCurrency(cashBalance)}</div>
              <p className="text-xs md:text-sm text-muted-foreground mb-3">Prêmios de torneios. Pode ser sacado via PIX.</p>
              <Button variant="outline" className="border-success text-success hover:bg-success/10 text-sm" onClick={() => document.getElementById('withdraw-tab')?.click()}>
                <QrCode className="w-4 h-4" /> Sacar via PIX
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base font-normal text-muted-foreground">
                <Coins className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Créditos (Não Sacável)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">{creditsBalance} créditos</div>
              <p className="text-xs md:text-sm text-muted-foreground mb-3">Use para jogar, entrar em torneios ou doar.</p>
              <Button variant="hero" className="text-sm" onClick={() => document.getElementById('buy-tab')?.click()}>
                <Plus className="w-4 h-4" /> Comprar Créditos
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full max-w-md mb-4 md:mb-6 grid grid-cols-3 h-auto">
            <TabsTrigger value="history" className="text-xs md:text-sm py-2">Histórico</TabsTrigger>
            <TabsTrigger value="buy" id="buy-tab" className="text-xs md:text-sm py-2">Comprar</TabsTrigger>
            <TabsTrigger value="withdraw" id="withdraw-tab" className="text-xs md:text-sm py-2">Sacar</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle className="text-lg md:text-xl">Histórico de Transações</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma transação ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {transactions.map((tx, index) => (
                      <motion.div key={tx.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center justify-between py-2 md:py-3 border-b border-border last:border-0">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">{tx.description || tx.type}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs md:text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("pt-BR")}</span>
                              <Badge variant="outline" className="text-[10px] md:text-xs">{tx.wallet === "cash" ? "Dinheiro" : "Créditos"}</Badge>
                            </div>
                          </div>
                        </div>
                        <span className={`font-display font-bold text-sm md:text-base flex-shrink-0 ml-2 ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.wallet === "cash" ? formatCurrency(tx.amount) : `${tx.amount} cr`}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buy">
            <Card>
              <CardHeader><CardTitle className="text-lg md:text-xl">Comprar Créditos</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[50, 100, 200, 500].map((amount) => (
                      <Button key={amount} variant={buyAmount === String(amount) ? "default" : "outline"}
                        className="h-16 md:h-20 flex-col" onClick={() => setBuyAmount(String(amount))}>
                        <span className="font-display text-lg md:text-xl font-bold">{amount}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground">créditos</span>
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Ou digite um valor personalizado</Label>
                    <Input type="number" placeholder="Quantidade de créditos" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} />
                  </div>
                  <div className="p-3 md:p-4 bg-muted rounded-lg text-sm">
                    <div className="flex justify-between mb-2"><span>Créditos</span><span>{buyAmount || 0}</span></div>
                    <div className="flex justify-between mb-2"><span>Valor</span><span>{formatCurrency(Number(buyAmount) || 0)}</span></div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between font-bold"><span>Total</span><span>{formatCurrency(Number(buyAmount) || 0)}</span></div>
                  </div>
                  <Button variant="hero" className="w-full" disabled={!buyAmount || processing} onClick={handleBuyCredits}>
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {processing ? "Processando..." : "Pagar com Cartão"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader><CardTitle className="text-lg md:text-xl">Sacar via PIX</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 md:space-y-6">
                  <div className="p-3 md:p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-success" />
                      <span className="font-semibold text-sm md:text-base">Saldo disponível</span>
                    </div>
                    <p className="font-display text-xl md:text-2xl font-bold text-success">{formatCurrency(cashBalance)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Chave PIX</Label>
                    <Input placeholder="Digite sua chave PIX" value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Valor do saque</Label>
                    <Input type="number" placeholder="Digite o valor" value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)} max={cashBalance} />
                  </div>
                  <div className="p-3 md:p-4 bg-muted rounded-lg text-sm">
                    <div className="flex justify-between mb-2"><span>Valor do saque</span><span>{formatCurrency(Number(withdrawAmount) || 0)}</span></div>
                    <div className="flex justify-between mb-2 text-muted-foreground"><span>Taxa (0%)</span><span>R$ 0,00</span></div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between font-bold"><span>Você receberá</span><span className="text-success">{formatCurrency(Number(withdrawAmount) || 0)}</span></div>
                  </div>
                  <Button variant="default" className="w-full bg-success hover:bg-success/90"
                    disabled={!withdrawAmount || !pixKey || Number(withdrawAmount) > cashBalance || Number(withdrawAmount) < 10 || processing}
                    onClick={handleWithdraw}>
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    {processing ? "Processando..." : "Sacar via PIX"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Wallet;
