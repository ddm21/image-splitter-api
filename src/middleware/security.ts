import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// API Key Authentication Middleware
export const apiKeyAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Skip API key check for health endpoint
    if (req.path === '/health') {
        next();
        return;
    }

    // Skip API key check if not configured (development mode)
    if (!config.security.apiKey) {
        next();
        return;
    }

    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        res.status(401).json({
            success: false,
            error: {
                message: 'API key is required. Please provide x-api-key header.',
            },
        });
        return;
    }

    if (apiKey !== config.security.apiKey) {
        res.status(403).json({
            success: false,
            error: {
                message: 'Invalid API key.',
            },
        });
        return;
    }

    next();
};

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = config.security.rateLimitWindowMs;
    const maxRequests = config.security.rateLimitMaxRequests;

    const clientData = requestCounts.get(clientIp);

    if (!clientData || now > clientData.resetTime) {
        // New window
        requestCounts.set(clientIp, {
            count: 1,
            resetTime: now + windowMs,
        });
        next();
        return;
    }

    if (clientData.count >= maxRequests) {
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
            },
        });
        return;
    }

    clientData.count++;
    next();
};

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestCounts.entries()) {
        if (now > data.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 60000); // Cleanup every minute
