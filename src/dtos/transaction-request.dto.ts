import { z } from "zod";

export const TransactionRequestSchema = z.object({
    type: z.enum(['payment', 'withdrawal', 'disbursement']),
    amount: z.number().min(0, "Amount must be a positive number"),
    consumerId: z.string().uuid("Invalid consumer ID format"),
});

export type TransactionRequest = z.infer<typeof TransactionRequestSchema>;