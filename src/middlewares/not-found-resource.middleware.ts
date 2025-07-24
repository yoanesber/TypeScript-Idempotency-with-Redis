import { Request, Response, NextFunction } from "express";

import AppError from "../exceptions/app-error.exception";

/**
 * Middleware to handle requests for resources that are not found.
 * It captures requests that do not match any defined routes and throws a NotFound error.
 * This is useful for providing a consistent response for missing resources.
 */
const notFound = (req: Request, res: Response, next: NextFunction) => {
    next(AppError.NotFound("Resource not found", `The requested resource at '${req.originalUrl}' could not be found.`));
};

export default notFound;
