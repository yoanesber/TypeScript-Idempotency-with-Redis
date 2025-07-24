import { z } from "zod";

/**
 * TransactionRequestSchema defines the structure of a transaction request.
 * It validates that the request contains a type, amount, and consumerId.
 * The type must be one of 'payment', 'withdrawal', or 'disbursement'.
 * The amount must be a positive number.
 * The consumerId must be a valid UUID format.
 */
export const TransactionRequestSchema = z.object({
    type: z.enum(['payment', 'withdrawal', 'disbursement']),
    amount: z.number().min(0, "Amount must be a positive number"),
    consumerId: z.string().uuid("Invalid consumer ID format"),
});

export type TransactionRequest = z.infer<typeof TransactionRequestSchema>;