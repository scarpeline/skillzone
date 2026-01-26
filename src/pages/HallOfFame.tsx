import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VipBadge } from "@/components/gamification/VipBadge";
import { VipLevel } from "@/lib/gamification";
import { Link } from "react-router-dom";
import { Trophy, Crown, Star, Medal, CheckCircle, Calendar, ArrowRight } from "lucide-react";

const legends = [
  {
    name: "Carlos Silva",
    username: "carlosmaster",
    avatar: "CS",
    titles: 156,
    totalEarnings: 245000,
    records: ["Maior sequência de vitórias", "Mais títulos de xadrez"],
    inducted: "2025",
    game: "Xadrez",
    verified: true,
    vipLevel: "elite" as VipLevel,
  },
  {
    name: "Maria Santos",
    username: "mariachess",
    avatar: "MS",
    titles: 134,
    totalEarnings: 198000,
    records: ["Maior prêmio único"],
    inducted: "2025",
    game: "Xadrez",
    verified: true,
    vipLevel: "elite" as VipLevel,
  },
  {
    name: "João Pereira",
    username: "joaopro",
    avatar: "JP",
    titles: 98,
    totalEarnings: 145000,
    records: ["Mais títulos de damas"],
    inducted: "2025",
    game: "Damas",
    verified: false,
    vipLevel: "diamond" as VipLevel,
  },
  {
    name: "Ana Costa",
    username: "anacosta",
    avatar: "AC",
    titles: 87,
    totalEarnings: 112000,
    records: [],
    inducted: "2025",
    game: "Quiz",
    verified: true,
    vipLevel: "diamond" as VipLevel,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const HallOfFame = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-6 glow-gold">
            <Trophy className="w-10 h-10 text-amber-900" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-gold">Hall da Fama</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            As lendas que fizeram história na plataforma. Jogadores que alcançaram o topo
            e entraram para a eternidade.
          </p>
        </motion.div>

        {/* Criteria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {[
            { icon: Trophy, label: "50+ Títulos", description: "Vencer 50 ou mais torneios" },
            { icon: Star, label: "R$ 50.000+", description: "Acumular R$ 50.000 em prêmios" },
            { icon: Medal, label: "Recordes", description: "Quebrar recordes da plataforma" },
          ].map((criteria, index) => {
            const Icon = criteria.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/30 p-6 text-center"
              >
                <Icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="font-display font-bold mb-1">{criteria.label}</h3>
                <p className="text-sm text-muted-foreground">{criteria.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Legends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {legends.map((legend, index) => (
            <motion.div
              key={legend.username}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link to={`/player/${legend.username}`}>
                <div className="group relative bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/30 p-6 hover:border-amber-400/50 transition-all">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
                  <div className="absolute -top-2 -right-2">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-display font-bold text-xl text-amber-900">
                        {legend.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-xl font-bold group-hover:text-amber-400 transition-colors">
                            {legend.name}
                          </h3>
                          {legend.verified && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-muted-foreground">@{legend.username}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline">{legend.game}</Badge>
                          <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/30">
                            <Calendar className="w-3 h-3 mr-1" />
                            {legend.inducted}
                          </Badge>
                          <VipBadge level={legend.vipLevel} size="sm" />
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <div className="font-display text-2xl font-bold text-gradient-gold">
                          {legend.titles}
                        </div>
                        <div className="text-xs text-muted-foreground">Títulos</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 text-center">
                        <div className="font-display text-2xl font-bold text-gradient-gold">
                          {formatCurrency(legend.totalEarnings)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Ganho</div>
                      </div>
                    </div>

                    {/* Records */}
                    {legend.records.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Recordes
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {legend.records.map((record, i) => (
                            <Badge key={i} className="bg-amber-400/10 text-amber-300 border-amber-400/30">
                              <Star className="w-3 h-3 mr-1" />
                              {record}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Quer entrar para o Hall da Fama? Comece a competir agora!
          </p>
          <Link to="/tournaments">
            <Button variant="gold" size="lg">
              Ver Torneios
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default HallOfFame;
