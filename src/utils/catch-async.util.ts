import { RequestHandler } from "express";

/**
 * Utility function to catch asynchronous errors in Express middleware.
 * It wraps the provided async function and catches any errors,
 * passing them to the next middleware for error handling.
 * This is useful for avoiding repetitive try-catch blocks in async route handlers.
 *
 * @param fn - The async function to wrap.
 * @returns A new function that handles errors by calling next with the error.
 */
const catchAsync = (fn: RequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default catchAsync;
