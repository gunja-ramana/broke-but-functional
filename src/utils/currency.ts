/**
 * Indian Rupee (₹) Currency and Number Formatter
 */

export function formatINR(
  amount: number,
  options?: {
    compact?: boolean;
    showSign?: boolean;
    maxDecimals?: number;
    absolute?: boolean;
  }
): string {
  const { compact = false, showSign = false, maxDecimals = 0, absolute = false } = options || {};
  
  const val = absolute ? Math.abs(amount) : amount;
  
  if (isNaN(val)) return '₹0';

  if (compact && Math.abs(val) >= 1000) {
    if (Math.abs(val) >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)}Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${(val / 1000).toFixed(1)}k`;
  }

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: maxDecimals > 0 && Math.abs(val % 1) > 0.001 ? 2 : 0,
  }).format(Math.abs(val));

  if (showSign) {
    if (amount > 0) return `+₹${formattedNumber}`;
    if (amount < 0) return `-₹${formattedNumber}`;
    return `₹${formattedNumber}`;
  }

  if (amount < 0) {
    return `-₹${formattedNumber}`;
  }

  return `₹${formattedNumber}`;
}

export function parseINR(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
