import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Plataforma #1 de Jogos Competitivos
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Prove Sua{" "}
            <span className="text-gradient-neon">Habilidade</span>
            <br />
            Ganhe{" "}
            <span className="text-gradient-gold">Prêmios Reais</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Compete em torneios de xadrez, damas, sudoku e mais. 
            Jogos 100% baseados em habilidade. Sem sorte, apenas estratégia.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/register">
              <Button variant="hero" size="xl">
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/games">
              <Button variant="outline" size="xl">
                Ver Jogos
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: "50K+", label: "Jogadores Ativos" },
              { value: "R$ 2M+", label: "Em Prêmios Pagos" },
              { value: "10K+", label: "Torneios Realizados" },
              { value: "8", label: "Jogos Disponíveis" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border"
              >
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient-neon">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Features */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span>Prêmios Reais</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Saque Instantâneo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
