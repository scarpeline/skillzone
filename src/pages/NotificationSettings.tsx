import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NotificationPreferences, NotificationEvent } from "@/lib/gamification";
import { Bell, Smartphone, MessageCircle, Trophy, Users, Target, Crown, Calendar, Gift, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const notificationEvents: { key: NotificationEvent; label: string; description: string; icon: React.ComponentType<any> }[] = [
  { key: "match_win", label: "Vitória em Partida", description: "Quando você vencer uma partida", icon: Trophy },
  { key: "commission_earned", label: "Comissão Recebida", description: "Quando ganhar comissão de afiliado", icon: Gift },
  { key: "new_referral", label: "Novo Indicado", description: "Quando alguém se cadastrar pelo seu link", icon: Users },
  { key: "mission_completed", label: "Missão Concluída", description: "Quando completar uma missão", icon: Target },
  { key: "vip_promotion", label: "Promoção VIP", description: "Quando subir de nível VIP", icon: Crown },
  { key: "tournament_open", label: "Torneio Aberto", description: "Quando um novo torneio estiver disponível", icon: Calendar },
  { key: "streak_bonus", label: "Bônus de Sequência", description: "Lembretes para manter sua sequência", icon: Bell },
];

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    channels: {
      push: true,
      whatsapp: false,
    },
    events: {
      match_win: true,
      commission_earned: true,
      new_referral: true,
      mission_completed: true,
      vip_promotion: true,
      tournament_open: true,
      streak_bonus: true,
    },
    whatsappNumber: "",
  });

  const [whatsappNumber, setWhatsappNumber] = useState("");

  const handleChannelToggle = (channel: "push" | "whatsapp") => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleEventToggle = (event: NotificationEvent) => {
    setPreferences(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [event]: !prev.events[event],
      },
    }));
  };

  const handleSave = () => {
    // Here you would save to the backend
    toast({
      title: "Preferências Salvas!",
      description: "Suas configurações de notificação foram atualizadas.",
    });
  };

  const requestPushPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Notificações Ativadas!",
          description: "Você receberá notificações push no navegador.",
        });
        handleChannelToggle("push");
      } else {
        toast({
          title: "Permissão Negada",
          description: "Você precisa permitir notificações no navegador.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4"
          >
            <Bell className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold mb-2"
          >
            Configurações de <span className="text-gradient-neon">Notificações</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Escolha como e quando deseja receber notificações
          </motion.p>
        </div>

        {/* Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canais de Notificação</CardTitle>
              <CardDescription>Escolha onde deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Notificações no navegador</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!preferences.channels.push && (
                    <Button variant="outline" size="sm" onClick={requestPushPermission}>
                      Ativar
                    </Button>
                  )}
                  <Switch
                    checked={preferences.channels.push}
                    onCheckedChange={() => handleChannelToggle("push")}
                  />
                </div>
              </div>

              <Separator />

              {/* WhatsApp */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        WhatsApp
                        <Badge variant="outline" className="text-[10px]">Opt-in</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Receba mensagens no WhatsApp</div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.channels.whatsapp}
                    onCheckedChange={() => handleChannelToggle("whatsapp")}
                  />
                </div>

                {preferences.channels.whatsapp && (
                  <div className="pl-13 ml-13">
                    <Label htmlFor="whatsapp" className="text-sm">Número do WhatsApp</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="whatsapp"
                        placeholder="+55 11 99999-9999"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Você receberá um código de confirmação
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Notificação</CardTitle>
              <CardDescription>Escolha quais eventos deseja ser notificado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationEvents.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div key={event.key}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{event.label}</div>
                          <div className="text-xs text-muted-foreground">{event.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.events[event.key]}
                        onCheckedChange={() => handleEventToggle(event.key)}
                      />
                    </div>
                    {index < notificationEvents.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button variant="hero" size="lg" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Salvar Preferências
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotificationSettings;
