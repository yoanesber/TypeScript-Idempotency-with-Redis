export interface TransactionResponse {
    id: string;
    type: string; // 'payment', 'withdrawal', or 'disbursement'
    amount: number;
    status: string; // 'pending', 'completed', or 'failed'
    consumerId: string;
    createdAt: Date;
    updatedAt?: Date;
}