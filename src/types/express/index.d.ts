import { JwtPayload } from "../idempotency.interface";

/**
 * Extends the Express Request interface to include idempotency metadata.
 * This allows controllers and middleware to access idempotency information
 * from the request object.
 */
declare global {
    namespace Express {
        interface Request {
            idempotency?: IdempotencyInterface;
        }
    }
}