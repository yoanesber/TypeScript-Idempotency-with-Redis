import cors from "cors";
import 'dotenv/config';

import AppError from "../exceptions/app-error.exception";

const devOrigins = process.env.FRONTEND_URL?.split(',') || [];
const prodOrigins = process.env.FRONTEND_URL_PRODUCTION?.split(',') || [];
const allowedOrigins = process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins;

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // If no origin is provided, allow the request
        if (!origin) {
            return callback(AppError.Forbidden("Missing Origin", "The request does not have an Origin header."));
        }

        // Validate the origin URL
		// Ensure the origin is a valid URL and uses HTTP or HTTPS scheme
		try {
            const parsedUrl = new URL(origin);
            if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
                return callback(AppError.Forbidden("Invalid Origin", "CORS policy: The request's origin is not allowed. Only HTTP and HTTPS protocols are permitted."));
            }
        } catch(error) {
            return callback(AppError.Forbidden("Invalid Origin", "CORS policy: The request's origin is not a valid URL."));
        }

        // Trim whitespace from allowed origins
        const allowedOriginsTrimmed = allowedOrigins.map(o => o.trim());

        // If allowedOrigins is empty, allow all origins
        if (!allowedOriginsTrimmed || allowedOriginsTrimmed.length === 0) {
            return callback(null, true);
        }

        // If allowedOriginsTrimmed length is 1 and it is an empty string, treat it as allowing all origins
        if (allowedOriginsTrimmed.length === 1 && allowedOriginsTrimmed[0] === '') {
            return callback(null, true); // allow all origins
        }
        
        // Check if the origin is in the allowed origins
        // If the origin is not in the allowed origins, return an error
        if (!origin || allowedOriginsTrimmed.includes(origin)) {
            return callback(null, true); // allow request
        } else {
            return callback(AppError.Forbidden("Invalid Origin", "CORS policy: The request's origin is not allowed."));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Length"],
};

export default cors(corsOptions);
