// === Security Utilities ===
// Simulated security features for educational demonstration

/**
 * Simple hash function for PIN (simulates bcrypt).
 * In production, use bcrypt on server-side. This is educational only.
 */
export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `hashed_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/** Generate unique transaction ID to prevent replay attacks */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `TXN_${timestamp}_${random}`.toUpperCase();
}

/** Generate simulated 6-digit OTP */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Generate CSRF token */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// Rate limiter: max attempts within a time window
const attempts: Map<string, number[]> = new Map();

export function checkRateLimit(key: string, maxAttempts = 3, windowMs = 60000): boolean {
  const now = Date.now();
  const userAttempts = (attempts.get(key) || []).filter(t => now - t < windowMs);
  if (userAttempts.length >= maxAttempts) return false; // blocked
  userAttempts.push(now);
  attempts.set(key, userAttempts);
  return true; // allowed
}

/** Sanitize user input to prevent XSS */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"&]/g, (char) => {
    const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' };
    return map[char] || char;
  });
}

// Session timeout: 5 minutes of inactivity
export const SESSION_TIMEOUT = 5 * 60 * 1000;
