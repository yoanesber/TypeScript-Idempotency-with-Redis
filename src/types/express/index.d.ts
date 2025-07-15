import { JwtPayload } from "../idempotency.interface";

declare global {
    namespace Express {
        interface Request {
            idempotency?: IdempotencyInterface;
        }
    }
}