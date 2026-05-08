/**
 * Shared currency formatter.
 *
 * All monetary values in the application are stored as plain numbers (no currency
 * symbol). This utility formats them consistently as Indian Rupees (₹).
 *
 * Usage:
 *   import { formatCurrency } from '@/lib/formatCurrency';
 *   formatCurrency(120000)  // "₹1,20,000"
 *   formatCurrency(0)       // "₹0"
 */

const CURRENCY_SYMBOL = "₹";

/**
 * Format a number as Indian Rupees with grouping.
 *
 * Uses `en-IN` locale so the lakhs/crores grouping (1,00,000) is applied
 * automatically.
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-IN")}`;
}

/**
 * Short-hand for inline table cells where space is tight.
 * Omits the currency symbol when the context is obvious.
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-IN");
}
