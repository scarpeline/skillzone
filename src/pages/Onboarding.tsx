import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Wallet, 
  Target, 
  Gift, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Crown,
  Star
} from "lucide-react";

const onboardingSteps = [
  {
    id: "welcome",
    title: "Bem-vindo ao SkillZone!",
    description: "A plataforma de jogos competitivos baseados em habilidade. Ganhe dinheiro real jogando!",
    icon: Gamepad2,
    color: "from-primary to-secondary",
    reward: null,
  },
  {
    id: "games",
    title: "Escolha seus Jogos",
    description: "Temos Xadrez, Damas, Go, Quiz e muito mais. Jogue o que você domina!",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    reward: { type: "XP", amount: 50 },
  },
  {
    id: "tournaments",
    title: "Participe de Torneios",
    description: "Torneios diários com prêmios em dinheiro. Taxa de apenas R$ 2,00 por partida.",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    reward: { type: "Ticket", amount: 1 },
  },
  {
    id: "wallet",
    title: "Sistema de Carteiras",
    description: "Carteira de Dinheiro para prêmios sacáveis e Carteira de Créditos para jogar.",
    icon: Wallet,
    color: "from-emerald-500 to-green-500",
    reward: { type: "Créditos", amount: 10 },
  },
  {
    id: "affiliates",
    title: "Indique e Ganhe",
    description: "Ganhe 10% sobre as taxas dos seus indicados e 5% dos indicados deles!",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    reward: { type: "XP", amount: 100 },
  },
  {
    id: "vip",
    title: "Programa VIP",
    description: "Jogue e suba de nível para desbloquear taxas menores e benefícios exclusivos.",
    icon: Crown,
    color: "from-amber-400 to-amber-600",
    reward: null,
  },
  {
    id: "complete",
    title: "Pronto para Jogar!",
    description: "Você completou o tutorial e ganhou suas recompensas iniciais. Boa sorte!",
    icon: Star,
    color: "from-primary to-secondary",
    reward: { type: "Bônus Total", amount: 160 },
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const navigate = useNavigate();

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (isLastStep) {
      navigate("/games");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    navigate("/games");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {onboardingSteps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Pular Tutorial
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-2 mb-8"
        >
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : completedSteps.includes(index)
                  ? "bg-success"
                  : "bg-muted"
              }`}
            />
          ))}
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              {/* Icon Header */}
              <div className={`bg-gradient-to-br ${step.color} p-8 text-center`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-4"
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-2xl md:text-3xl font-bold text-white mb-2"
                >
                  {step.title}
                </motion.h1>
              </div>

              <CardContent className="pt-6">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-muted-foreground mb-6"
                >
                  {step.description}
                </motion.p>

                {/* Reward Display */}
                {step.reward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mb-6"
                  >
                    <Badge className="bg-success/20 text-success border-success/30 text-base py-2 px-4">
                      <Gift className="w-4 h-4 mr-2" />
                      +{step.reward.amount} {step.reward.type}
                    </Badge>
                  </motion.div>
                )}

                {/* Collected Rewards (on last step) */}
                {isLastStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3 mb-6"
                  >
                    <p className="text-center text-sm text-muted-foreground mb-3">
                      Recompensas Coletadas:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {onboardingSteps
                        .filter(s => s.reward && s.id !== "complete")
                        .map((s, i) => (
                          <Badge key={i} variant="outline" className="py-1">
                            <CheckCircle className="w-3 h-3 mr-1 text-success" />
                            +{s.reward!.amount} {s.reward!.type}
                          </Badge>
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* Navigation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center"
                >
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleNext}
                    className="min-w-[200px]"
                  >
                    {isLastStep ? "Começar a Jogar" : "Próximo"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* First Mission Teaser */}
        {currentStep > 0 && !isLastStep && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Sua Primeira Missão</div>
                    <div className="text-xs text-muted-foreground">
                      Complete o tutorial e ganhe 50 XP bônus!
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {completedSteps.length}/{onboardingSteps.length - 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Onboarding;
