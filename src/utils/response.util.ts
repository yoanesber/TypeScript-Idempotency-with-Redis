import { Request } from "express";

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
