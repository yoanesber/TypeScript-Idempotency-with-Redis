import { RequestHandler } from "express";
import { ZodSchema } from "zod";

import AppError from '../exceptions/app-error.exception';

/**
 * Middleware to validate request body against a Zod schema.
 * It checks if the request body conforms to the specified schema.
 * If validation fails, it throws a BadRequest error with details of the validation errors.
 * This middleware is typically used for validating POST and PUT request bodies.
 */
const validate = (schema: ZodSchema): RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(
                AppError.BadRequest("Validation error", result.error.flatten().fieldErrors)
            );
        }

        req.body = result.data;
        next();
    };
};

export default validate;