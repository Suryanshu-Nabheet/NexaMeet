/**
 * Production Security Features
 * Rate limiting, authentication, and security middleware
 */

import { Socket } from 'socket.io';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class SecurityService {
  private rateLimitStore: RateLimitStore = {};
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly blockedIPs: Set<string> = new Set();

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup old entries every minute
    setInterval(() => {
      this.cleanupRateLimitStore();
    }, 60000);
  }

  /**
   * Rate limiting middleware for Express
   */
  public rateLimitMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = this.getClientIP(req);
      
      if (this.blockedIPs.has(ip)) {
        return res.status(403).json({ error: 'IP address blocked' });
      }

      const key = `rate_limit:${ip}`;
      const now = Date.now();
      const record = this.rateLimitStore[key];

      if (!record || now > record.resetTime) {
        this.rateLimitStore[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        return next();
      }

      record.count++;

      if (record.count > this.maxRequests) {
        // Block IP after exceeding limit
        this.blockedIPs.add(ip);
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

      next();
    };
  }

  /**
   * Rate limiting for Socket.IO
   */
  public socketRateLimitMiddleware() {
    return (socket: Socket, next: (err?: Error) => void) => {
      const ip = socket.handshake.address;
      
      if (this.blockedIPs.has(ip)) {
        return next(new Error('IP address blocked'));
      }

      const key = `socket_rate_limit:${ip}`;
      const now = Date.now();
      const record = this.rateLimitStore[key];

      if (!record || now > record.resetTime) {
        this.rateLimitStore[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        return next();
      }

      record.count++;

      if (record.count > this.maxRequests) {
        this.blockedIPs.add(ip);
        return next(new Error('Too many connection attempts'));
      }

      next();
    };
  }

  /**
   * Validate meeting ID format
   */
  public validateMeetingId(meetingId: string): boolean {
    // UUID v4 format or alphanumeric 8-32 chars
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const alphanumericRegex = /^[a-zA-Z0-9]{8,32}$/;
    
    return uuidRegex.test(meetingId) || alphanumericRegex.test(meetingId);
  }

  /**
   * Validate participant ID format
   */
  public validateParticipantId(participantId: string): boolean {
    // UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(participantId);
  }

  /**
   * Sanitize user input
   */
  public sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 100); // Limit length
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }

  /**
   * Cleanup old rate limit entries
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    Object.keys(this.rateLimitStore).forEach((key) => {
      if (this.rateLimitStore[key].resetTime < now) {
        delete this.rateLimitStore[key];
      }
    });
  }

  /**
   * Unblock IP address
   */
  public unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  /**
   * Get blocked IPs (for admin)
   */
  public getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }
}

