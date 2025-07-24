import { Request, Response } from 'express';
import rateLimit from "express-rate-limit";

import AppError from "../exceptions/app-error.exception";
import FormatResponse from '../utils/response.util';

/**
 * Rate limiter middleware to limit the number of requests.
 * This middleware is used to prevent abuse by limiting the number of requests
 * a user can make to the server within a specified time window.
 * It can be configured for different endpoints with different limits.
 */

// Handler when rate limit is exceeded
const rateLimitHandler = (req: Request, res: Response, next: Function, options: any) => {
    const error = AppError.TooManyRequests(options.message?.message || "Too many requests", {
        timeWindowInSeconds: options.windowMs / 1000,
        limit: options.max,
        remaining: res.get('RateLimit-Remaining'),
        retryAfter: res.get('Retry-After'),
    });

    res.status(error.statusCode).json(
        FormatResponse({
            message: error.message,
            error: error.details,
            data: null,
            req,
        })
    );
};

// Custom key generator for rate limiting
// This function generates a unique key based on the request's IP address, method, and path
export const customKeyGenerator = (req: Request): string => {
    const ip = req.ip;
    const method = req.method;
    const path = req.baseUrl;

    // Kombinasi: IP + Method + Path
    return `${ip}-${method}-${path}`;
};

// This rate limiter is used to limit the number of login attempts to prevent brute-force attacks
// It allows a maximum of 5 login attempts every 15 minutes
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: "Too many login attempts. Please try again later.",
    },
    keyGenerator: customKeyGenerator, // Use custom key generator to identify users
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: rateLimitHandler,
});

// This rate limiter is used to limit the number of requests to general endpoints
// It allows a maximum of 100 requests every hour
export const generalRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: {
        message: "Too many requests. Please wait and try again.",
    },
    keyGenerator: customKeyGenerator, // Use custom key generator to identify users
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: rateLimitHandler,
});

// This rate limiter is used to limit the number of requests to specific resources
// It allows a maximum of 20 requests every 10 minutes
export const resourceRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20,
    message: {
        message: "Too many requests. Please wait and try again.",
    },
    keyGenerator: customKeyGenerator, // Use custom key generator to identify users
    handler: rateLimitHandler,
});
