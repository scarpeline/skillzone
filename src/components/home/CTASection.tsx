import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2, Trophy, Wallet } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Pronto para{" "}
            <span className="text-gradient-neon">Competir</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de jogadores que já estão ganhando prêmios reais
            competindo em jogos de habilidade. Cadastre-se agora e ganhe bônus de boas-vindas!
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Gamepad2,
                step: "1",
                title: "Crie sua Conta",
                description: "Cadastro rápido e gratuito",
              },
              {
                icon: Wallet,
                step: "2",
                title: "Adicione Créditos",
                description: "Compre créditos ou jogue grátis",
              },
              {
                icon: Trophy,
                step: "3",
                title: "Ganhe Prêmios",
                description: "Compete e saque seus ganhos",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="hero" size="xl">
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/games">
              <Button variant="outline" size="xl">
                Explorar Jogos
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Ao se cadastrar você concorda com nossos{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
