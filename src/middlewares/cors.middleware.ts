import cors from "cors";
import 'dotenv/config';

import AppError from "../exceptions/app-error.exception";

const devOrigins = ['http://localhost:3000'];
const prodOrigins = ['https://your-production-frontend.com'];
const allowedOrigins = process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins;

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // allow request
        } else {
            callback(AppError.Forbidden("Forbidden", "CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource."));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

export default cors(corsOptions);
