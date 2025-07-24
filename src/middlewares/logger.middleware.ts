import { Request, Response, NextFunction } from "express";

import Logger from "../utils/logger.util";

/**
 * Logger middleware to log HTTP requests and responses.
 * It logs the details of each request and response, including method, URL, status code, and response time.
 * This can be useful for debugging and monitoring purposes.
 */
const httpLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        Logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
            requestId: res.get("X-Request-Id"),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });
    });

    next();
};

export default httpLogger;
