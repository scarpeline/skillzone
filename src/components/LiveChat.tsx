import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  from: "user" | "support";
  time: string;
}

const autoReplies = [
  "Olá! Como posso te ajudar hoje? 😊",
  "Entendido! Vou verificar isso para você.",
  "Pode deixar, estou aqui para ajudar!",
  "Seu saque será processado em até 5 minutos via PIX.",
  "Para dúvidas sobre bônus, acesse a aba Promoções.",
  "Obrigado pelo contato! Há mais alguma coisa?",
];

export function LiveChat() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Bem-vindo ao suporte SkillZone. Como posso ajudar? 🎮",
      from: "support",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: input,
      from: "user",
      time: now,
    }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: reply,
        from: "support",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }]);
      if (!open) setUnread(n => n + 1);
    }, 1200);
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 z-50">
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-3 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🎮</div>
                <div>
                  <p className="text-white font-semibold text-sm">Suporte SkillZone</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-white/80 text-xs">Online agora</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setMinimized(true)} className="text-white/70 hover:text-white p-1">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-3 space-y-3 bg-background/50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    msg.from === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none"
              />
              <Button size="icon" className="rounded-full w-9 h-9 flex-shrink-0" onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setOpen(o => !o); setMinimized(false); }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center relative"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </motion.button>
    </div>
  );
}
