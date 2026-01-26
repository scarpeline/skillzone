// VIP System Types and Constants
export const VIP_LEVELS = {
  bronze: { name: "Bronze", minPoints: 0, color: "amber-600", icon: "🥉", platformFee: 5, withdrawPriority: 1, affiliateBoost: 0 },
  silver: { name: "Prata", minPoints: 1000, color: "gray-400", icon: "🥈", platformFee: 4.5, withdrawPriority: 2, affiliateBoost: 5 },
  gold: { name: "Ouro", minPoints: 5000, color: "amber-400", icon: "🥇", platformFee: 4, withdrawPriority: 3, affiliateBoost: 10 },
  diamond: { name: "Diamante", minPoints: 15000, color: "cyan-400", icon: "💎", platformFee: 3, withdrawPriority: 4, affiliateBoost: 15 },
  elite: { name: "Elite", minPoints: 50000, color: "purple-500", icon: "👑", platformFee: 2, withdrawPriority: 5, affiliateBoost: 25 },
} as const;

export type VipLevel = keyof typeof VIP_LEVELS;

export const AFFILIATE_LEVELS = {
  bronze: { name: "Bronze", minReferrals: 0, minVolume: 0, commission: 10, bonus: 0 },
  silver: { name: "Prata", minReferrals: 10, minVolume: 1000, commission: 12, bonus: 50 },
  gold: { name: "Ouro", minReferrals: 50, minVolume: 10000, commission: 15, bonus: 200 },
  diamond: { name: "Diamante", minReferrals: 200, minVolume: 50000, commission: 20, bonus: 1000 },
} as const;

export type AffiliateLevel = keyof typeof AFFILIATE_LEVELS;

// XP System
export const XP_REWARDS = {
  match_played: 10,
  match_won: 25,
  tournament_played: 50,
  tournament_won: 200,
  referral: 100,
  daily_login: 15,
  streak_bonus: 5, // per day
  mission_completed: 50,
  achievement_unlocked: 100,
} as const;

export const PLAYER_LEVELS = [
  { level: 1, name: "Iniciante", xpRequired: 0 },
  { level: 2, name: "Aprendiz", xpRequired: 100 },
  { level: 3, name: "Competidor", xpRequired: 300 },
  { level: 4, name: "Jogador", xpRequired: 600 },
  { level: 5, name: "Experiente", xpRequired: 1000 },
  { level: 6, name: "Veterano", xpRequired: 1500 },
  { level: 7, name: "Expert", xpRequired: 2200 },
  { level: 8, name: "Mestre", xpRequired: 3000 },
  { level: 9, name: "Grão-Mestre", xpRequired: 4000 },
  { level: 10, name: "Lenda", xpRequired: 5500 },
];

// Mission Types
export type MissionType = "daily" | "weekly" | "monthly";
export type MissionCategory = "matches" | "wins" | "streak" | "referrals" | "tournaments";

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  category: MissionCategory;
  target: number;
  progress: number;
  reward: {
    type: "xp" | "tokens" | "tickets" | "credits";
    amount: number;
  };
  completed: boolean;
  expiresAt: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "matches" | "wins" | "streak" | "earnings" | "referrals" | "special";
  requirement: number;
  progress: number;
  completed: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
}

// Default Achievements
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, "progress" | "completed" | "unlockedAt">[] = [
  { id: "first_win", name: "Primeira Vitória", description: "Vença sua primeira partida", icon: "🏆", category: "wins", requirement: 1, rarity: "common", xpReward: 50 },
  { id: "win_streak_5", name: "Sequência de Fogo", description: "Vença 5 partidas seguidas", icon: "🔥", category: "streak", requirement: 5, rarity: "rare", xpReward: 150 },
  { id: "win_streak_10", name: "Imparável", description: "Vença 10 partidas seguidas", icon: "⚡", category: "streak", requirement: 10, rarity: "epic", xpReward: 300 },
  { id: "matches_10", name: "Aquecendo", description: "Jogue 10 partidas", icon: "🎮", category: "matches", requirement: 10, rarity: "common", xpReward: 30 },
  { id: "matches_50", name: "Jogador Ativo", description: "Jogue 50 partidas", icon: "🎯", category: "matches", requirement: 50, rarity: "rare", xpReward: 100 },
  { id: "matches_100", name: "Veterano", description: "Jogue 100 partidas", icon: "⭐", category: "matches", requirement: 100, rarity: "epic", xpReward: 250 },
  { id: "wins_25", name: "Vencedor", description: "Vença 25 partidas", icon: "🥇", category: "wins", requirement: 25, rarity: "rare", xpReward: 100 },
  { id: "wins_100", name: "Campeão", description: "Vença 100 partidas", icon: "👑", category: "wins", requirement: 100, rarity: "epic", xpReward: 300 },
  { id: "first_withdraw", name: "Primeiro Saque", description: "Faça seu primeiro saque", icon: "💰", category: "earnings", requirement: 1, rarity: "common", xpReward: 50 },
  { id: "earnings_1000", name: "Milhar", description: "Ganhe R$ 1.000 em prêmios", icon: "💵", category: "earnings", requirement: 1000, rarity: "rare", xpReward: 200 },
  { id: "earnings_10000", name: "Rico", description: "Ganhe R$ 10.000 em prêmios", icon: "💎", category: "earnings", requirement: 10000, rarity: "legendary", xpReward: 500 },
  { id: "referrals_5", name: "Recrutador", description: "Indique 5 jogadores", icon: "👥", category: "referrals", requirement: 5, rarity: "rare", xpReward: 150 },
  { id: "referrals_20", name: "Influencer", description: "Indique 20 jogadores", icon: "📢", category: "referrals", requirement: 20, rarity: "epic", xpReward: 400 },
  { id: "hall_of_fame", name: "Lenda", description: "Entre no Hall da Fama", icon: "🌟", category: "special", requirement: 1, rarity: "legendary", xpReward: 1000 },
];

// Default Missions
export const generateDailyMissions = (): Mission[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return [
    { id: "daily_1", title: "Jogador do Dia", description: "Jogue 3 partidas hoje", type: "daily", category: "matches", target: 3, progress: 0, reward: { type: "xp", amount: 30 }, completed: false, expiresAt: tomorrow },
    { id: "daily_2", title: "Vencedor", description: "Vença 1 partida hoje", type: "daily", category: "wins", target: 1, progress: 0, reward: { type: "tokens", amount: 10 }, completed: false, expiresAt: tomorrow },
    { id: "daily_3", title: "Login Diário", description: "Faça login hoje", type: "daily", category: "streak", target: 1, progress: 1, reward: { type: "xp", amount: 15 }, completed: true, expiresAt: tomorrow },
  ];
};

export const generateWeeklyMissions = (): Mission[] => {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    { id: "weekly_1", title: "Maratonista", description: "Jogue 20 partidas esta semana", type: "weekly", category: "matches", target: 20, progress: 0, reward: { type: "xp", amount: 150 }, completed: false, expiresAt: nextWeek },
    { id: "weekly_2", title: "Dominante", description: "Vença 10 partidas esta semana", type: "weekly", category: "wins", target: 10, progress: 0, reward: { type: "tokens", amount: 50 }, completed: false, expiresAt: nextWeek },
    { id: "weekly_3", title: "Recrutador", description: "Indique 1 jogador esta semana", type: "weekly", category: "referrals", target: 1, progress: 0, reward: { type: "tickets", amount: 1 }, completed: false, expiresAt: nextWeek },
    { id: "weekly_4", title: "Torneeiro", description: "Participe de 2 torneios", type: "weekly", category: "tournaments", target: 2, progress: 0, reward: { type: "credits", amount: 20 }, completed: false, expiresAt: nextWeek },
  ];
};

// Helper Functions
export function getVipLevel(vipPoints: number): VipLevel {
  if (vipPoints >= VIP_LEVELS.elite.minPoints) return "elite";
  if (vipPoints >= VIP_LEVELS.diamond.minPoints) return "diamond";
  if (vipPoints >= VIP_LEVELS.gold.minPoints) return "gold";
  if (vipPoints >= VIP_LEVELS.silver.minPoints) return "silver";
  return "bronze";
}

export function getPlayerLevel(xp: number): typeof PLAYER_LEVELS[number] {
  for (let i = PLAYER_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= PLAYER_LEVELS[i].xpRequired) {
      return PLAYER_LEVELS[i];
    }
  }
  return PLAYER_LEVELS[0];
}

export function getNextLevel(xp: number): typeof PLAYER_LEVELS[number] | null {
  const currentLevel = getPlayerLevel(xp);
  const nextIndex = PLAYER_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  return nextIndex < PLAYER_LEVELS.length ? PLAYER_LEVELS[nextIndex] : null;
}

export function getLevelProgress(xp: number): number {
  const currentLevel = getPlayerLevel(xp);
  const nextLevel = getNextLevel(xp);
  if (!nextLevel) return 100;
  const xpInLevel = xp - currentLevel.xpRequired;
  const xpNeeded = nextLevel.xpRequired - currentLevel.xpRequired;
  return Math.round((xpInLevel / xpNeeded) * 100);
}

export function getAffiliateLevel(referrals: number, volume: number): AffiliateLevel {
  if (referrals >= AFFILIATE_LEVELS.diamond.minReferrals && volume >= AFFILIATE_LEVELS.diamond.minVolume) return "diamond";
  if (referrals >= AFFILIATE_LEVELS.gold.minReferrals && volume >= AFFILIATE_LEVELS.gold.minVolume) return "gold";
  if (referrals >= AFFILIATE_LEVELS.silver.minReferrals && volume >= AFFILIATE_LEVELS.silver.minVolume) return "silver";
  return "bronze";
}

// Currency Types
export interface PlayerCurrency {
  xp: number;
  tokens: number;
  tickets: number;
}

// Notification Types
export type NotificationChannel = "push" | "whatsapp";
export type NotificationEvent = 
  | "match_win"
  | "commission_earned"
  | "new_referral"
  | "mission_completed"
  | "vip_promotion"
  | "tournament_open"
  | "streak_bonus";

export interface NotificationPreferences {
  channels: {
    push: boolean;
    whatsapp: boolean;
  };
  events: Record<NotificationEvent, boolean>;
  whatsappNumber?: string;
}
