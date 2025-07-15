export interface IdempotencyInterface {
    key: string;
    bodyHash: string;
}