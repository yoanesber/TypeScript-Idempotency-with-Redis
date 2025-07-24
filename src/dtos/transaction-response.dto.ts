/**
 * TransactionResponse defines the structure of a transaction response.
 * It includes fields such as id, type, amount, status, consumerId, createdAt, and updatedAt.
 * The type must be one of 'payment', 'withdrawal', or 'disbursement'.
 * The status can be 'pending', 'completed', or 'failed'.
 */
export interface TransactionResponse {
    id: string;
    type: string; // 'payment', 'withdrawal', or 'disbursement'
    amount: number;
    status: string; // 'pending', 'completed', or 'failed'
    consumerId: string;
    createdAt: Date;
    updatedAt?: Date;
}