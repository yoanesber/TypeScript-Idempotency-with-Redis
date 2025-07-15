import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.util";

const httpLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
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
