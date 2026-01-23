import { motion } from "framer-motion";
import {
  Wallet,
  Shield,
  Zap,
  Trophy,
  Users,
  BarChart3,
  Gift,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Carteiras Separadas",
    description: "Dinheiro sacável e créditos não-sacáveis com controle total.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "100% Legal",
    description: "Jogos baseados em habilidade, sem elementos de sorte.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Zap,
    title: "Saque Rápido",
    description: "Receba seus prêmios via PIX em minutos.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Trophy,
    title: "Torneios Diários",
    description: "Competições 24/7 com premiações variadas.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Users,
    title: "Programa de Afiliados",
    description: "Ganhe comissões em dois níveis indicando jogadores.",
    color: "text-neon-purple",
    bg: "bg-secondary/10",
  },
  {
    icon: BarChart3,
    title: "Estatísticas Avançadas",
    description: "Acompanhe sua evolução com gráficos detalhados.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Gift,
    title: "Sistema de Doações",
    description: "Apoie jogadores e torneios com seus créditos.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: Star,
    title: "Jogador Verificado",
    description: "Selo especial para os melhores competidores.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold mb-4"
          >
            Por Que <span className="text-gradient-neon">SkillZone</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            A plataforma mais completa para jogos competitivos baseados em habilidade
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
