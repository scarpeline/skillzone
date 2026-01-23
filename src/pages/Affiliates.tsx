import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Link as LinkIcon,
  TrendingUp,
  Wallet,
  Copy,
  Share2,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const affiliateStats = {
  level1Referrals: 45,
  level2Referrals: 128,
  totalEarnings: 3450,
  pendingWithdraw: 890,
  thisMonth: 450,
};

const referrals = [
  { name: "Pedro Lima", username: "@pedrolima", level: 1, earnings: 125, date: "2026-01-22" },
  { name: "Juliana Alves", username: "@julialves", level: 1, earnings: 98, date: "2026-01-21" },
  { name: "Ricardo Mendes", username: "@ricardogm", level: 2, earnings: 32, date: "2026-01-20" },
  { name: "Fernanda Oliveira", username: "@fernandao", level: 1, earnings: 87, date: "2026-01-19" },
  { name: "Bruno Souza", username: "@brunosouza", level: 2, earnings: 28, date: "2026-01-18" },
];

const commissionRates = {
  level1: 10,
  level2: 5,
};

const Affiliates = () => {
  const affiliateLink = "https://skillzone.com/ref/carlosmaster";

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast({
      title: "Link copiado!",
      description: "Seu link de afiliado foi copiado para a área de transferência.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold mb-4"
          >
            Programa de <span className="text-gradient-neon">Afiliados</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Indique jogadores e ganhe comissões em dois níveis. Quanto mais você indica, mais você ganha!
          </motion.p>
        </div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              step: "1",
              title: "Compartilhe seu Link",
              description: "Envie seu link exclusivo para amigos e nas redes sociais",
              icon: Share2,
            },
            {
              step: "2",
              title: "Eles se Cadastram",
              description: "Quando alguém se cadastra pelo seu link, vira seu indicado",
              icon: Users,
            },
            {
              step: "3",
              title: "Você Ganha Comissão",
              description: `${commissionRates.level1}% no nível 1 e ${commissionRates.level2}% no nível 2`,
              icon: Wallet,
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="relative">
                <Card className="h-full">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <Icon className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Commission Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Nível 1</h3>
                  <p className="text-sm text-muted-foreground">Indicações diretas</p>
                </div>
              </div>
              <div className="font-display text-4xl font-bold text-primary mb-2">
                {commissionRates.level1}%
              </div>
              <p className="text-muted-foreground text-sm">
                Você ganha {commissionRates.level1}% sobre as taxas de participação e compras de créditos 
                de todos que você indicar diretamente.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Nível 2</h3>
                  <p className="text-sm text-muted-foreground">Indicações dos seus indicados</p>
                </div>
              </div>
              <div className="font-display text-4xl font-bold text-secondary mb-2">
                {commissionRates.level2}%
              </div>
              <p className="text-muted-foreground text-sm">
                Você também ganha {commissionRates.level2}% sobre as taxas das pessoas que seus 
                indicados diretos trouxerem para a plataforma.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Affiliate Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Seu Link de Afiliado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input value={affiliateLink} readOnly className="font-mono" />
                <Button variant="hero" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Indicados Nível 1", value: affiliateStats.level1Referrals, icon: Users },
            { label: "Indicados Nível 2", value: affiliateStats.level2Referrals, icon: Users },
            { label: "Total Ganho", value: `R$ ${affiliateStats.totalEarnings}`, icon: Wallet },
            { label: "Este Mês", value: `R$ ${affiliateStats.thisMonth}`, icon: TrendingUp },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <Icon className="w-6 h-6 text-primary mb-2" />
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Indicações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-sm text-primary-foreground">
                      {referral.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">{referral.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={referral.level === 1 ? "default" : "secondary"}>
                      Nível {referral.level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{referral.date}</span>
                    <span className="font-display font-bold text-success">
                      +R$ {referral.earnings}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold mb-1">Saldo Disponível para Saque</h3>
                  <p className="text-muted-foreground">
                    Comissões confirmadas e prontas para sacar
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <div className="font-display text-3xl font-bold text-success mb-2">
                    R$ {affiliateStats.pendingWithdraw}
                  </div>
                  <Button variant="gold">
                    Solicitar Saque
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Affiliates;
