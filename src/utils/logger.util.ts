import 'dotenv/config';
import path from "path";
import fs from "fs";
import winston from "winston";

/**
 * Logger utility class for logging messages.
 * This class uses Winston for logging and supports different log levels.
 */
class Logger {
    private logger: winston.Logger;

    constructor() {
        let logLevel = process.env.LOG_LEVEL;
        if (!logLevel) {
            logLevel = "info"; // Default log level if not set
        }

        let logDirectory = process.env.LOG_DIRECTORY;
        if (!logDirectory) {
            logDirectory = "../../logs"; // Default log directory if not set
        }

        let environment = process.env.NODE_ENV;
        if (!environment) {
            environment = "development"; // Default environment if not set
        }

        // Custom log format
        // This format includes the timestamp, log level, message, and any additional metadata
        const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        });

        // Ensure the log directory exists
        const logDir = path.join(__dirname, logDirectory);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // Create a Winston logger instance
        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), logFormat),
            transports: [
                new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
                new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
            ],
        });

        // If not in production, also log to console
        if (environment !== "production") {
            this.logger.add(
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), logFormat),
                })
            );
        }
    }

    public log(level: string, message: string, meta?: any) {
        this.logger.log(level, message, meta);
    }

    public info(message: string, meta?: any) {
        this.logger.info(message, meta);
    }

    public warn(message: string, meta?: any) {
        this.logger.warn(message, meta);
    }

    public error(message: string, meta?: any) {
        this.logger.error(message, meta);
    }

    public debug(message: string, meta?: any) {
        this.logger.debug(message, meta);
    }
}

export default new Logger();