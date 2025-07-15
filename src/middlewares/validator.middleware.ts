import { RequestHandler } from "express";
import { ZodSchema } from "zod";

import AppError from '../exceptions/app-error.exception';

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