interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export async function rateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): Promise<{ success: boolean; resetTime?: number }> {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false, resetTime: entry.resetTime };
  }

  entry.count++;
  rateLimitMap.set(ip, entry);
  return { success: true };
}

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 60 * 1000);