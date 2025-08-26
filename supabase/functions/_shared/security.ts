interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private cache = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async checkLimit(req: Request): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator?.(req) || this.getDefaultKey(req);
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    let entry = this.cache.get(key);

    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime };
      this.cache.set(key, entry);
    }

    const allowed = entry.count < this.config.maxRequests;
    
    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  private getDefaultKey(req: Request): string {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    return `${ip}:${userAgent.slice(0, 50)}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.resetTime) {
        this.cache.delete(key);
      }
    }
  }
}

export class SecurityValidator {
  private static readonly MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_ORIGINS = ['http://localhost:8000', 'https://your-domain.com'];

  static validateRequest(req: Request): { valid: boolean; error?: string } {
    // Check content length
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > this.MAX_BODY_SIZE) {
      return { valid: false, error: 'Request body too large' };
    }

    // Check origin for CORS
    const origin = req.headers.get('origin');
    if (origin && !this.ALLOWED_ORIGINS.includes(origin)) {
      return { valid: false, error: 'Invalid origin' };
    }

    // Check for common attack patterns
    const userAgent = req.headers.get('user-agent') || '';
    if (this.isSuspiciousUserAgent(userAgent)) {
      return { valid: false, error: 'Suspicious request' };
    }

    return { valid: true };
  }

  private static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /php/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Rate limiting configurations
export const RATE_LIMITS = {
  AI_EXTRACTION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req: Request) => {
      const authHeader = req.headers.get('Authorization');
      return authHeader ? `ai:${authHeader.split(' ')[1]?.slice(-10)}` : 'anonymous';
    }
  },
  
  USER_MANAGEMENT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyGenerator: (req: Request) => {
      const authHeader = req.headers.get('Authorization');
      return authHeader ? `user:${authHeader.split(' ')[1]?.slice(-10)}` : 'anonymous';
    }
  },
  
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyGenerator: (req: Request) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      return `general:${ip}`;
    }
  }
};

export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);
  
  return async (req: Request): Promise<Response | null> => {
    const result = await limiter.checkLimit(req);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    return null; // Allow request to continue
  };
}