/**
 * IdempotencyInterface defines the structure for idempotency metadata.
 * It includes the idempotency key and a hash of the request body.
 */
export interface IdempotencyInterface {
    key: string;
    bodyHash: string;
}