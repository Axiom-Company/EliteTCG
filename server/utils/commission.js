/**
 * Calculate marketplace commission based on tiered structure.
 * All amounts in ZAR (Rands), NOT cents.
 *
 * Tiers:
 *   Under R100:     flat R10
 *   R100 – R1,000:  7.5%
 *   R1,000 – R5,000: 5.5%
 *   R5,000+:         4%
 *
 * @param {number} subtotal - Order subtotal in ZAR (e.g. 150.00)
 * @returns {{ fee: number, percentage: number|null, description: string }}
 */
export function calculateCommission(subtotal) {
  if (subtotal < 100) {
    return { fee: 10, percentage: null, description: 'Flat R10 (under R100)' };
  }
  if (subtotal <= 1000) {
    return {
      fee: parseFloat((subtotal * 0.075).toFixed(2)),
      percentage: 7.5,
      description: '7.5% (R100–R1,000)',
    };
  }
  if (subtotal <= 5000) {
    return {
      fee: parseFloat((subtotal * 0.055).toFixed(2)),
      percentage: 5.5,
      description: '5.5% (R1,000–R5,000)',
    };
  }
  return {
    fee: parseFloat((subtotal * 0.04).toFixed(2)),
    percentage: 4.0,
    description: '4% (R5,000+)',
  };
}

export default calculateCommission;
