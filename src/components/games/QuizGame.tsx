import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Star, Zap, CheckCircle, XCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const QUESTIONS: Question[] = [
  { question: "Qual o maior planeta do Sistema Solar?", options: ["Terra", "Marte", "Júpiter", "Saturno"], correct: 2, category: "Ciência" },
  { question: "Em que ano o Brasil foi descoberto?", options: ["1400", "1500", "1600", "1700"], correct: 1, category: "História" },
  { question: "Qual a capital da Austrália?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2, category: "Geografia" },
  { question: "Quem pintou a Mona Lisa?", options: ["Michelangelo", "Da Vinci", "Rafael", "Van Gogh"], correct: 1, category: "Arte" },
  { question: "Qual elemento químico tem símbolo 'Au'?", options: ["Prata", "Ouro", "Alumínio", "Argônio"], correct: 1, category: "Ciência" },
  { question: "Quantos lados tem um hexágono?", options: ["5", "6", "7", "8"], correct: 1, category: "Matemática" },
  { question: "Qual o oceano mais profundo?", options: ["Atlântico", "Índico", "Pacífico", "Ártico"], correct: 2, category: "Geografia" },
  { question: "Quem escreveu 'Dom Casmurro'?", options: ["José de Alencar", "Machado de Assis", "Monteiro Lobato", "Clarice Lispector"], correct: 1, category: "Literatura" },
  { question: "Qual a velocidade da luz em km/s?", options: ["100.000", "200.000", "300.000", "400.000"], correct: 2, category: "Ciência" },
  { question: "Em que continente fica o Egito?", options: ["Ásia", "Europa", "América", "África"], correct: 3, category: "Geografia" },
];

interface QuizGameProps {
  onGameEnd: (score: number) => void;
}

export function QuizGame({ onGameEnd }: QuizGameProps) {
  const [questions] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 7));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (gameOver || showResult) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver, showResult]);

  const handleTimeout = () => {
    setSelectedAnswer(-1);
    setShowResult(true);
    setStreak(0);
    setTimeout(nextQuestion, 1500);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correct;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = 100 + (timeLeft * 10) + (newStreak > 1 ? newStreak * 25 : 0);
      setScore(s => s + points);
      setCorrectCount(c => c + 1);
    } else {
      setStreak(0);
    }

    setTimeout(nextQuestion, 1500);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      onGameEnd(score);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setTimeLeft(15);
    setGameOver(false);
    setCorrectCount(0);
    setShowResult(false);
  };

  if (gameOver) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="p-6 text-center border-primary/50 bg-primary/5">
          <h3 className="font-display text-2xl font-bold text-primary mb-2">Quiz Finalizado!</h3>
          <p className="text-muted-foreground mb-4">
            {correctCount}/{questions.length} respostas corretas
          </p>
          <div className="font-display text-3xl font-bold text-accent mb-4">{score} pontos</div>
          <Button variant="hero" onClick={restartGame}>Jogar Novamente</Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Star className="w-3 h-3" /> {score} pts
          </Badge>
          <Badge variant="outline">
            {currentIndex + 1}/{questions.length}
          </Badge>
          {streak > 1 && (
            <Badge className="bg-accent/20 text-accent border-accent/30 gap-1 animate-pulse">
              <Zap className="w-3 h-3" /> Streak x{streak}
            </Badge>
          )}
        </div>
        <Badge className={`gap-1 ${timeLeft <= 5 ? "bg-destructive/20 text-destructive" : ""}`}>
          <Clock className="w-3 h-3" /> {timeLeft}s
        </Badge>
      </div>

      {/* Timer Bar */}
      <Progress value={(timeLeft / 15) * 100} className="h-2" />

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <Card className="p-6">
            <Badge variant="outline" className="mb-3">{currentQuestion.category}</Badge>
            <h3 className="font-display text-lg md:text-xl font-bold mb-6">
              {currentQuestion.question}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, i) => {
                let variant: "outline" | "default" | "destructive" = "outline";
                let extraClass = "hover:border-primary/50";
                if (showResult) {
                  if (i === currentQuestion.correct) {
                    extraClass = "border-success bg-success/10 text-success";
                  } else if (i === selectedAnswer && i !== currentQuestion.correct) {
                    extraClass = "border-destructive bg-destructive/10 text-destructive";
                  } else {
                    extraClass = "opacity-50";
                  }
                }
                return (
                  <Button
                    key={i}
                    variant={variant}
                    className={`h-auto py-4 text-left justify-start text-sm md:text-base ${extraClass}`}
                    onClick={() => handleAnswer(i)}
                    disabled={showResult}
                  >
                    <span className="mr-3 font-bold text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                    {option}
                    {showResult && i === currentQuestion.correct && <CheckCircle className="w-4 h-4 ml-auto text-success" />}
                    {showResult && i === selectedAnswer && i !== currentQuestion.correct && <XCircle className="w-4 h-4 ml-auto text-destructive" />}
                  </Button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
