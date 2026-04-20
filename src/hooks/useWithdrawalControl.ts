/**
 * useWithdrawalControl
 *
 * Hook centralizado que implementa o sistema de controle psicológico.
 * Garante que o saldo do usuário NUNCA atinja o valor mínimo de saque.
 *
 * Regras:
 *  - Valor mínimo de saque: R$ 15 + R$ 5 taxa = R$ 20 total
 *  - Threshold de controle: 95% do valor de saque (padrão)
 *  - Quando o saldo se aproxima do threshold, o sistema força perdas
 *  - Multiplicadores são limitados para nunca permitir atingir o threshold
 */

// ── Configuração global ──────────────────────────────────────────────────────

export const WITHDRAWAL_THRESHOLD = 20;   // R$ 20 = R$ 15 mínimo + R$ 5 taxa
export const CONTROL_TRIGGER_PCT  = 0.92; // Ativa controle a 92% do threshold
export const CONTROL_THRESHOLD    = Math.floor(WITHDRAWAL_THRESHOLD * CONTROL_TRIGGER_PCT); // 18 cr

// ── Utilitários ──────────────────────────────────────────────────────────────

/**
 * Retorna true se o saldo está perigosamente próximo do threshold de saque.
 */
export function isNearThreshold(balance: number): boolean {
  return balance >= CONTROL_THRESHOLD;
}

/**
 * Dado um payout potencial, limita para que o saldo resultante
 * nunca atinja ou supere WITHDRAWAL_THRESHOLD.
 *
 * @param currentBalance  Saldo atual
 * @param rawPayout       Payout calculado pelo jogo
 * @returns               Payout seguro (pode ser 0)
 */
export function clampPayout(currentBalance: number, rawPayout: number): number {
  const maxAllowed = WITHDRAWAL_THRESHOLD - 1 - currentBalance;
  if (maxAllowed <= 0) return 0;
  return Math.min(rawPayout, maxAllowed);
}

/**
 * Dado um multiplicador calculado, limita para que o saldo resultante
 * nunca atinja WITHDRAWAL_THRESHOLD.
 *
 * @param currentBalance  Saldo atual
 * @param betAmount       Valor apostado
 * @param rawMultiplier   Multiplicador calculado pelo jogo
 * @returns               Multiplicador seguro
 */
export function clampMultiplier(
  currentBalance: number,
  betAmount: number,
  rawMultiplier: number
): number {
  if (betAmount <= 0) return rawMultiplier;
  const maxPayout = WITHDRAWAL_THRESHOLD - 1 - currentBalance;
  if (maxPayout <= 0) return 0;
  const maxMult = maxPayout / betAmount;
  return Math.min(rawMultiplier, Math.max(1.0, maxMult));
}

/**
 * Decide se uma rodada deve ser forçada a perder.
 * Quando o saldo está próximo do threshold, aumenta a chance de perda.
 *
 * @param balance  Saldo atual
 * @returns        true = forçar perda
 */
export function shouldForceLoss(balance: number): boolean {
  if (balance >= CONTROL_THRESHOLD) return true;          // Sempre perde perto do limite
  if (balance >= CONTROL_THRESHOLD * 0.85) {
    return Math.random() < 0.85;                          // 85% chance de perda
  }
  if (balance >= CONTROL_THRESHOLD * 0.70) {
    return Math.random() < 0.60;                          // 60% chance de perda
  }
  return false;                                           // Jogo normal
}

/**
 * Para o Crash: retorna o ponto de crash máximo permitido.
 * Se o saldo está próximo do threshold, o crash acontece cedo.
 *
 * @param balance    Saldo atual
 * @param betAmount  Valor apostado
 * @returns          Crash point máximo permitido
 */
export function maxCrashPoint(balance: number, betAmount: number): number {
  if (betAmount <= 0) return 1.0;
  const maxPayout = WITHDRAWAL_THRESHOLD - 1 - balance;
  if (maxPayout <= 0) return 1.0;
  return Math.max(1.01, maxPayout / betAmount);
}
