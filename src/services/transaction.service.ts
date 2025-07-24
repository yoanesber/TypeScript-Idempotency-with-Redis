import "dotenv/config";
import { ValidationError, ValidationErrorItem, DatabaseError } from 'sequelize';

import AppError from "../exceptions/app-error.exception";
import DatabaseConfig from "../config/db.config";
import Transaction from "../models/transaction.model";
import RedisUtil from '../utils/redis.util';
import { IdempotencyMeta, IdempotencyMetaCreationAttributes } from "../models/idempotency-meta.model";
import { TransactionRequest, TransactionRequestSchema } from "../dtos/transaction-request.dto";
import { TransactionResponse } from "../dtos/transaction-response.dto";

/**
 * TransactionService handles the business logic for transactions.
 * It provides methods to create and retrieve transactions,
 * ensuring idempotency and proper error handling.
 */

class TransactionService {
    async createTransaction(idempotencyKey: string, bodyHash: string, transactionRequest: TransactionRequest): Promise<TransactionResponse> {
        // Validate the idempotency key
        if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.trim() === '') {
            throw AppError.BadRequest("Invalid idempotency key", "Idempotency key is required and must be a non-empty string");
        }

        // Validate the transaction request
        const validationResult = TransactionRequestSchema.safeParse(transactionRequest);
        if (!validationResult.success) {
            throw AppError.BadRequest("Invalid transaction request", validationResult.error.errors);
        }

        // Destructure the validated data
        const { type, amount, consumerId } = validationResult.data;

        // Start a transaction
        const t = await DatabaseConfig.beginTransaction();

        try {
            // Create a new transaction
            const transaction = await Transaction.create({
                type: type,
                amount: amount,
                status: 'pending', // Default status
                consumerId: consumerId,
            }, { transaction: t });

            // Prepare the response
            const transactionResponse: TransactionResponse = {
                id: transaction.id,
                type: transaction.type,
                amount: transaction.amount,
                status: transaction.status,
                consumerId: transaction.consumerId,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
            };

            // Prepare the idempotency metadata
            const idempotencyMeta: IdempotencyMetaCreationAttributes = {
                key: idempotencyKey,
                bodyHash: bodyHash,
                responsePayload: JSON.stringify(transactionResponse),
                expiredAt: new Date(Date.now() + (process.env.IDEMPOTENCY_TTL_HOURS ? parseInt(process.env.IDEMPOTENCY_TTL_HOURS) * 3600 * 1000 : 3600 * 1000)), // Default TTL of 1 hour
            };

            // Create the idempotency metadata
            const idempotencyMetaRecord = await IdempotencyMeta.create(idempotencyMeta, { transaction: t });

            // Store the transaction in Redis with the idempotency key
            const redisKey = process.env.IDEMPOTENCY_PREFIX ? `${process.env.IDEMPOTENCY_PREFIX}:${idempotencyKey}` : `idempotency:${idempotencyKey}`;
            const ttl = process.env.IDEMPOTENCY_TTL_HOURS ? parseInt(process.env.IDEMPOTENCY_TTL_HOURS) * 3600 : 3600; // Default TTL of 1 hour
            await RedisUtil.set(redisKey, idempotencyMetaRecord, ttl);

            // Commit the transaction
            await DatabaseConfig.commitTransaction();

            return transactionResponse;
        } catch (error) {
            // Rollback the transaction in case of error
            await DatabaseConfig.rollbackTransaction();

            if (error instanceof AppError) {
                throw error; // Re-throw known AppErrors
            }

            if (error instanceof ValidationError) {
                const messages = error.errors.map((e: ValidationErrorItem) => e.message);
                throw AppError.BadRequest("Validation errors occurred", messages);
            }

            if (error instanceof DatabaseError) {
                throw AppError.InternalServerError("Database error", `An error occurred while interacting with the database: ${error.message}`);
            }

            throw AppError.InternalServerError("An unexpected error occurred while creating the transaction", error);
        }
    }

    async getAllTransactions(limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'): Promise<TransactionResponse[]> {
        try {
            // Fetch all transactions with pagination and sorting
            const transactions = await Transaction.findAll({
                attributes: ['id', 'type', 'amount', 'status', 'consumerId', 'createdAt', 'updatedAt'],
                order: [[sortBy, sortOrder.toUpperCase()]],
                limit: limit,
                offset: offset,
            });

            return transactions.map(transaction => ({
                id: transaction.id,
                type: transaction.type,
                amount: transaction.amount,
                status: transaction.status,
                consumerId: transaction.consumerId,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
            }));
        } catch (error) {
            if (error instanceof AppError) {
                throw error; // Re-throw known AppErrors
            }

            if (error instanceof DatabaseError) {
                throw AppError.InternalServerError("Database error", `An error occurred while interacting with the database: ${error.message}`);
            }

            throw AppError.InternalServerError("An unexpected error occurred while fetching transactions", error);
        }
    }
}

export default new TransactionService();
