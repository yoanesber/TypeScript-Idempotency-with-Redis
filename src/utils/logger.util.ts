import 'dotenv/config';
import path from "path";
import fs from "fs";
import winston from "winston";

// Ensure the log directory exists
// If the LOG_DIRECTORY environment variable is not set, default to "../../logs"
const logDir = path.join(__dirname, process.env.LOG_DIRECTORY || "../../logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Custom log format
// This format includes the timestamp, log level, message, and any additional metadata
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
});

// Create a Winston logger instance
// This logger will log messages to both files and the console (in development mode)
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), logFormat),
    transports: [new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }), new winston.transports.File({ filename: path.join(logDir, "combined.log") })],
});

// If not in production, also log to console
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
        })
    );
}

export default logger;
