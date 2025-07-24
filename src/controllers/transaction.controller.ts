import "dotenv/config";
import { Request, Response } from "express";

import AppError from "../exceptions/app-error.exception";
import FormatResponse from "../utils/response.util";
import TransactionService from "../services/transaction.service";
import { IdempotencyInterface } from "../types/idempotency.interface";
import { TransactionRequestSchema } from "../dtos/transaction-request.dto";
import { TransactionResponse } from "../dtos/transaction-response.dto";

/**
 * TransactionController handles the transaction-related endpoints.
 * It provides methods to create and retrieve transactions.
 * It uses TransactionService to handle the business logic.
 */
class TransactionController {
    async createTransaction(req: Request, res: Response): Promise<void> {
        // Validate the request body against the TransactionRequestSchema
        // This will throw a ZodError if validation fails
        const transactionRequest = TransactionRequestSchema.parse(req.body);

        // Extract the idempotency key from the idempotency request
        const idempotencyContext: IdempotencyInterface = req.idempotency;
        if (!idempotencyContext || !idempotencyContext.key || !idempotencyContext.bodyHash) {
            throw AppError.BadRequest("Invalid idempotency context", "Idempotency key and body hash are required for transaction creation.");
        }

        // Call the TransactionService to handle the transaction creation logic
        // This will throw an error if the creation fails for any reason
        const transaction: TransactionResponse = await TransactionService.createTransaction(idempotencyContext.key, idempotencyContext.bodyHash, transactionRequest);

        res.status(201).json(
            FormatResponse({
                message: "Transaction created successfully",
                data: transaction,
                req,
            })
        );
    }

    async getAllTransactions(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sortBy as string || 'createdAt';
        const sortOrder = req.query.sortOrder as string || 'desc';

        const transactions: TransactionResponse[] = await TransactionService.getAllTransactions(limit, offset, sortBy, sortOrder);
        if (!transactions || transactions.length === 0) {
            throw AppError.NotFound("No transactions found", "There are no transactions available at the moment.");
        }

        res.status(200).json(
            FormatResponse({
                message: "Transactions fetched successfully",
                data: transactions,
                req,
            })
        );
    }
}

export default new TransactionController();
