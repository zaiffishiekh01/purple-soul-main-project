import { Vendor, FeeWaiverRequest } from '../types';

/**
 * Calculate the effective commission rate for a vendor, considering any active fee waivers
 * @param vendor The vendor object
 * @param activeWaiver The vendor's active fee waiver request (if any)
 * @param defaultCommissionRate The platform's default commission rate (default: 0.05 = 5%)
 * @returns The effective commission rate as a decimal (0.0 - 1.0)
 */
export function getEffectiveCommissionRate(
  vendor: Vendor,
  activeWaiver?: FeeWaiverRequest | null,
  defaultCommissionRate: number = 0.05
): number {
  if (!activeWaiver || activeWaiver.status !== 'APPROVED') {
    return defaultCommissionRate;
  }

  if (!activeWaiver.valid_until) {
    return activeWaiver.commission_rate ?? defaultCommissionRate;
  }

  const validUntil = new Date(activeWaiver.valid_until);
  const now = new Date();

  if (validUntil > now) {
    return activeWaiver.commission_rate ?? defaultCommissionRate;
  }

  return defaultCommissionRate;
}

/**
 * Format a commission rate as a percentage string
 * @param rate The commission rate as a decimal (0.0 - 1.0)
 * @returns Formatted percentage string (e.g., "5.0%")
 */
export function formatCommissionRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Calculate platform commission for an order
 * @param orderAmount The order total amount
 * @param commissionRate The commission rate as a decimal (0.0 - 1.0)
 * @returns The commission amount
 */
export function calculateCommission(orderAmount: number, commissionRate: number): number {
  return orderAmount * commissionRate;
}

/**
 * Calculate vendor's net payout after commission
 * @param orderAmount The order total amount
 * @param commissionRate The commission rate as a decimal (0.0 - 1.0)
 * @returns The net payout amount
 */
export function calculateNetPayout(orderAmount: number, commissionRate: number): number {
  return orderAmount - calculateCommission(orderAmount, commissionRate);
}

/**
 * Check if a fee waiver is currently active
 * @param waiver The fee waiver request
 * @returns True if the waiver is approved and within its validity period
 */
export function isWaiverActive(waiver: FeeWaiverRequest | null): boolean {
  if (!waiver || waiver.status !== 'APPROVED') {
    return false;
  }

  if (!waiver.valid_until) {
    return true;
  }

  const validUntil = new Date(waiver.valid_until);
  const now = new Date();

  return validUntil > now;
}
