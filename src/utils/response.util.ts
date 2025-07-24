import { Request } from "express";

/**
 * Utility function to format the response object for API responses.
 * It standardizes the structure of the response, including message, error, data, and request path.
 * This can be used across different parts of the application to ensure consistent response formatting.
 */
interface ResponseOptions {
    message: string;
    error?: any;
    data?: any;
    req: Request;
}

const formatResponse = ({ message, error = null, data = null, req }: ResponseOptions) => {
    return {
        message,
        error,
        data,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    };
};

export default formatResponse;
