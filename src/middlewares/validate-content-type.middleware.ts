import { Request, Response, NextFunction } from "express";
import AppError from "../exceptions/app-error.exception";

/**
 * Middleware to validate the Content-Type header of incoming requests.
 * It checks if the Content-Type matches the expected type (default is application/json).
 * If the Content-Type is invalid or missing, it throws a BadRequest error.
 * This middleware is typically used for POST, PUT, and PATCH requests.
 */
const validateContentType = (expectedType: string = "application/json") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const contentType = req.headers["content-type"];

        if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS" && 
            (!contentType || !contentType.includes(expectedType))) {
            return next(AppError.BadRequest("Invalid Content-Type", `Invalid Content-Type. Expected '${expectedType}', but received: '${contentType || "none"}'.`));
        }

        next();
    };
};

export default validateContentType;