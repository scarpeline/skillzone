import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, CreditCard, Zap, Gift, CheckCircle2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

const bonusTable = [
  { min: 10, max: 19.99, bonus: 20, label: "20% bônus" },
  { min: 20, max: 39.99, bonus: 30, label: "30% bônus" },
  { min: 40, max: 59.99, bonus: 40, label: "40% bônus" },
  { min: 60, max: 149.99, bonus: 60, label: "60% bônus" },
  { min: 150, max: Infinity, bonus: 100, label: "100% bônus 🔥" },
];

const quickAmounts = [10, 20, 40, 60, 100, 150, 200, 500];

function getBonus(amount: number) {
  const tier = bonusTable.find(t => amount >= t.min && amount <= t.max);
  return tier ? { pct: tier.bonus, label: tier.label, extra: (amount * tier.bonus) / 100 } : null;
}

const fakePix = "00020126580014BR.GOV.BCB.PIX0136skillzone@pix.com.br5204000053039865802BR5925SkillZone Pagamentos6009SAO PAULO62070503***6304ABCD";

export function DepositModal({ open, onClose }: DepositModalProps) {
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [amount, setAmount] = useState("50");
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");

  const numAmount = Number(amount) || 0;
  const bonus = getBonus(numAmount);
  const total = numAmount + (bonus?.extra ?? 0);

  const handleConfirm = () => {
    if (numAmount < 10) {
      toast({ title: "Valor mínimo é R$ 10", variant: "destructive" });
      return;
    }
    setStep("confirm");
  };

  const handleDone = () => {
    toast({
      title: "✅ Depósito confirmado!",
      description: `R$ ${numAmount.toFixed(2)} + ${bonus?.label ?? "sem bônus"} = R$ ${total.toFixed(2)} na sua conta`,
    });
    setStep("select");
    setAmount("50");
    onClose();
  };

  const copyPix = () => {
    navigator.clipboard.writeText(fakePix);
    toast({ title: "Código PIX copiado!" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Fazer Depósito
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-5">
            {/* Method */}
            <div>
              <p className="text-sm font-medium mb-2">Método de pagamento</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod("pix")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    method === "pix" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <QrCode className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-sm">PIX</span>
                  <span className="text-xs text-muted-foreground">Instantâneo</span>
                </button>
                <button
                  onClick={() => setMethod("card")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    method === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-sm">Cartão</span>
                  <span className="text-xs text-muted-foreground">Crédito/Débito</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="text-sm font-medium mb-2">Valor do depósito</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickAmounts.map(v => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                      amount === String(v)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    R${v}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Outro valor"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>

            {/* Bonus Preview */}
            {bonus && numAmount >= 10 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Bônus aplicado!</span>
                  <Badge className="ml-auto text-xs">{bonus.label}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-muted-foreground">Depósito</p>
                    <p className="font-bold">R$ {numAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bônus</p>
                    <p className="font-bold text-primary">+R$ {bonus.extra.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-success">R$ {total.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <Button className="w-full" onClick={handleConfirm} disabled={numAmount < 10}>
              Continuar → R$ {numAmount.toFixed(2)}
            </Button>
          </div>
        )}

        {step === "confirm" && method === "pix" && (
          <div className="space-y-4 text-center">
            <div className="bg-white rounded-xl p-4 mx-auto w-48 h-48 flex items-center justify-center">
              <QrCode className="w-32 h-32 text-black" />
            </div>
            <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código PIX</p>
            <div className="bg-muted rounded-lg p-3 text-xs font-mono break-all text-left">
              {fakePix.slice(0, 60)}...
            </div>
            <Button variant="outline" className="w-full" onClick={copyPix}>
              <Copy className="w-4 h-4" /> Copiar código PIX
            </Button>
            <Button className="w-full" onClick={handleDone}>
              <CheckCircle2 className="w-4 h-4" /> Já paguei!
            </Button>
            <button onClick={() => setStep("select")} className="text-xs text-muted-foreground hover:underline">
              Voltar
            </button>
          </div>
        )}

        {step === "confirm" && method === "card" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <input placeholder="Número do cartão" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="MM/AA" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                <input placeholder="CVV" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
              <input placeholder="Nome no cartão" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div className="flex justify-between font-bold">
                <span>Total a pagar</span>
                <span>R$ {numAmount.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full" onClick={handleDone}>
              <CreditCard className="w-4 h-4" /> Pagar R$ {numAmount.toFixed(2)}
            </Button>
            <button onClick={() => setStep("select")} className="text-xs text-muted-foreground hover:underline w-full text-center">
              Voltar
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
