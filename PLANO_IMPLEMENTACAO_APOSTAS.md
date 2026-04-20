# 🎯 Plano de Implementação: Apostas Esportivas no SkillZone

**Data**: 20/04/2024  
**Objetivo**: Adicionar funcionalidades de apostas esportivas baseado na 38V.Media

---

## 📋 Fase 1: Estrutura Base (Semana 1)

### 1.1 Criar Tabelas no Supabase

```sql
-- Esportes
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  slug VARCHAR(50) UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Eventos Esportivos
CREATE TABLE sports_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID REFERENCES sports(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  status VARCHAR(20), -- upcoming, live, finished
  home_team VARCHAR(100),
  away_team VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Odds (Cotações)
CREATE TABLE odds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES sports_events(id),
  market_type VARCHAR(50), -- 1x2, over_under, etc
  option_name VARCHAR(100),
  odd_value DECIMAL(5,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Apostas Esportivas
CREATE TABLE sports_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES sports_events(id),
  odd_id UUID REFERENCES odds(id),
  amount DECIMAL(10,2) NOT NULL,
  potential_win DECIMAL(10,2),
  status VARCHAR(20), -- pending, won, lost, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Métodos de Pagamento
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  method_type VARCHAR(50), -- pix, card, bank_transfer
  method_name VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(20), -- deposit, withdrawal, bet, win
  amount DECIMAL(10,2) NOT NULL,
  method_id UUID REFERENCES payment_methods(id),
  status VARCHAR(20), -- pending, completed, failed
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Criar Componentes React

```typescript
// src/pages/SportsPage.tsx
export default function SportsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1>Apostas Esportivas</h1>
        <SportsGrid />
        <EventsList />
      </div>
    </Layout>
  );
}

// src/components/Sports/SportsGrid.tsx
export function SportsGrid() {
  const sports = [
    { id: "1", name: "Futebol", icon: "⚽" },
    { id: "2", name: "Basquete", icon: "🏀" },
    { id: "3", name: "Tênis", icon: "🎾" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sports.map(sport => (
        <SportCard key={sport.id} sport={sport} />
      ))}
    </div>
  );
}

// src/components/Sports/EventsList.tsx
export function EventsList() {
  return (
    <div className="space-y-4">
      {/* Lista de eventos */}
    </div>
  );
}

// src/components/Sports/BetSlip.tsx
export function BetSlip() {
  return (
    <div className="fixed right-0 top-20 w-80 bg-card border-l">
      {/* Slip de apostas */}
    </div>
  );
}
```

### 1.3 Criar Hooks

```typescript
// src/hooks/useSports.ts
export function useSports() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar esportes do Supabase
  }, []);

  return { sports, loading };
}

// src/hooks/useSportsBets.ts
export function useSportsBets() {
  const [bets, setBets] = useState([]);
  
  const placeBet = async (eventId, oddId, amount) => {
    // Colocar aposta
  };

  return { bets, placeBet };
}

// src/hooks/usePaymentMethods.ts
export function usePaymentMethods() {
  const [methods, setMethods] = useState([]);
  
  const addMethod = async (method) => {
    // Adicionar método de pagamento
  };

  return { methods, addMethod };
}
```

---

## 📋 Fase 2: Sistema de Pagamento (Semana 2)

### 2.1 Integrar PIX

```typescript
// src/services/pixService.ts
export async function generatePixQRCode(amount: number) {
  // Gerar QR code PIX
  // Usar API de pagamento (Stripe, Mercado Pago, etc)
}

export async function verifyPixPayment(transactionId: string) {
  // Verificar se PIX foi recebido
}
```

### 2.2 Criar Componente de Depósito

```typescript
// src/components/Deposit/DepositModal.tsx
export function DepositModal() {
  return (
    <Dialog>
      <DialogContent>
        <h2>Fazer Depósito</h2>
        
        {/* Seleção de método */}
        <PaymentMethodSelector />
        
        {/* Entrada de valor */}
        <AmountInput />
        
        {/* Bônus automático */}
        <BonusPreview />
        
        {/* Botão de confirmar */}
        <Button>Confirmar Depósito</Button>
      </DialogContent>
    </Dialog>
  );
}
```

### 2.3 Criar Componente de Saque

```typescript
// src/components/Withdrawal/WithdrawalModal.tsx
export function WithdrawalModal() {
  return (
    <Dialog>
      <DialogContent>
        <h2>Solicitar Saque</h2>
        
        {/* Seleção de método */}
        <PaymentMethodSelector />
        
        {/* Entrada de valor */}
        <AmountInput />
        
        {/* Verificação de rollover */}
        <RolloverStatus />
        
        {/* Botão de confirmar */}
        <Button>Solicitar Saque</Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📋 Fase 3: Sistema de Apostas (Semana 3)

### 3.1 Criar Slip de Apostas

```typescript
// src/components/Sports/BetSlip.tsx
export function BetSlip() {
  const [selections, setSelections] = useState([]);
  const [totalOdd, setTotalOdd] = useState(1);
  const [betAmount, setBetAmount] = useState(0);

  const potentialWin = betAmount * totalOdd;

  return (
    <div className="bg-card p-4 rounded-lg border">
      <h3>Seu Slip</h3>
      
      {/* Seleções */}
      <div className="space-y-2">
        {selections.map(sel => (
          <BetSelection key={sel.id} selection={sel} />
        ))}
      </div>
      
      {/* Resumo */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between">
          <span>Odd Total:</span>
          <span className="font-bold">{totalOdd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Valor da Aposta:</span>
          <input 
            type="number" 
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-24 px-2 py-1 border rounded"
          />
        </div>
        <div className="flex justify-between bg-primary/10 p-2 rounded">
          <span>Ganho Potencial:</span>
          <span className="font-bold text-primary">{potentialWin.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Botão */}
      <Button className="w-full mt-4">Colocar Aposta</Button>
    </div>
  );
}
```

### 3.2 Criar Histórico de Apostas

```typescript
// src/components/Sports/BetsHistory.tsx
export function BetsHistory() {
  const [bets, setBets] = useState([]);

  return (
    <div className="space-y-4">
      <h3>Histórico de Apostas</h3>
      
      {bets.map(bet => (
        <BetCard key={bet.id} bet={bet} />
      ))}
    </div>
  );
}
```

---

## 📋 Fase 4: Live Chat e Notificações (Semana 4)

### 4.1 Implementar Live Chat

```typescript
// src/components/LiveChat/ChatWidget.tsx
export function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      {open && (
        <div className="bg-card border rounded-lg w-80 h-96 flex flex-col">
          <ChatHeader onClose={() => setOpen(false)} />
          <ChatMessages messages={messages} />
          <ChatInput onSend={(msg) => setMessages([...messages, msg])} />
        </div>
      )}
      
      <Button 
        onClick={() => setOpen(!open)}
        className="rounded-full w-12 h-12"
      >
        💬
      </Button>
    </div>
  );
}
```

### 4.2 Implementar Notificações

```typescript
// src/services/notificationService.ts
export async function sendNotification(userId: string, notification: Notification) {
  // Enviar notificação push
  // Salvar no banco de dados
  // Exibir toast
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Inscrever em notificações em tempo real
  }, []);

  return notifications;
}
```

---

## 🗂️ Estrutura de Pastas

```
src/
├── pages/
│   ├── SportsPage.tsx
│   ├── BetsHistoryPage.tsx
│   └── PaymentPage.tsx
├── components/
│   ├── Sports/
│   │   ├── SportsGrid.tsx
│   │   ├── EventsList.tsx
│   │   ├── BetSlip.tsx
│   │   ├── BetsHistory.tsx
│   │   └── SportCard.tsx
│   ├── Deposit/
│   │   ├── DepositModal.tsx
│   │   └── PaymentMethodSelector.tsx
│   ├── Withdrawal/
│   │   ├── WithdrawalModal.tsx
│   │   └── RolloverStatus.tsx
│   ├── LiveChat/
│   │   ├── ChatWidget.tsx
│   │   ├── ChatMessages.tsx
│   │   └── ChatInput.tsx
│   └── Notifications/
│       ├── NotificationCenter.tsx
│       └── NotificationItem.tsx
├── hooks/
│   ├── useSports.ts
│   ├── useSportsBets.ts
│   ├── usePaymentMethods.ts
│   └── useNotifications.ts
├── services/
│   ├── sportsService.ts
│   ├── pixService.ts
│   ├── betsService.ts
│   ├── paymentService.ts
│   └── notificationService.ts
└── types/
    ├── sports.ts
    ├── bets.ts
    ├── payments.ts
    └── notifications.ts
```

---

## 📊 Timeline

| Fase | Semana | Tarefas | Status |
|------|--------|---------|--------|
| 1 | 1 | Tabelas + Componentes + Hooks | ⏳ Não iniciado |
| 2 | 2 | PIX + Depósito + Saque | ⏳ Não iniciado |
| 3 | 3 | Slip + Histórico + Resultados | ⏳ Não iniciado |
| 4 | 4 | Chat + Notificações | ⏳ Não iniciado |

---

## 🎯 Próximos Passos

1. [ ] Criar tabelas no Supabase
2. [ ] Implementar componentes React
3. [ ] Integrar PIX
4. [ ] Testar fluxo completo
5. [ ] Deploy na Vercel

---

**Status**: 📋 Plano Criado  
**Data**: 20/04/2024  
**Próximo Passo**: Iniciar Fase 1
