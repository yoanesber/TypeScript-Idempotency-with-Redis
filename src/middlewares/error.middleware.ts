import { Request, Response, NextFunction } from "express";

import AppError from '../exceptions/app-error.exception';
import FormatResponse from '../utils/response.util';

/**
 * Error handling middleware.
 * This middleware catches errors thrown in the application,
 * formats them, and sends a response to the client.
 * It handles both custom AppError instances and unexpected errors.
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // AppError for custom application errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json(
            FormatResponse({
                message: err.message,
                error: err.details || "",
                data: null,
                req,
            })
        );

        return;
    }

    // Handle unknown/unexpected errors
    console.error('Unexpected error:', err);
    res.status(500).json(
        FormatResponse({
            message: 'Internal Server Error',
            error: 'An unexpected error occurred',
            data: null,
            req,
        })
    );
};

export default errorHandler;