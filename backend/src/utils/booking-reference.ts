/**
 * Generate a unique booking reference
 * Format: MCS-YYYYMMDD-XXXX
 * Example: MCS-20251031-A7K2
 */
export function generateBookingReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Generate 4-character random code (uppercase letters and numbers, excluding confusing chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes I, O, 0, 1
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `MCS-${year}${month}${day}-${code}`;
}

/**
 * Generate a unique change token for flexi tickets
 * Format: 32-character hex string
 */
export function generateChangeToken(): string {
  const chars = '0123456789abcdef';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
