import "dotenv/config";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

import AppError from "../exceptions/app-error.exception";
import FormatResponse from '../utils/response.util';
import RedisUtil from "../utils/redis.util";
import { IdempotencyInterface } from "../types/idempotency.interface";
import { IdempotencyMeta } from "../models/idempotency-meta.model";

/**
 * Idempotency middleware for handling idempotent requests.
 * This middleware checks if a request with the same idempotency key and body hash
 * has already been processed, and returns the cached response if it exists.
 * If not, it allows the request to proceed and stores the response in Redis.
 */
const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ensure the request method is idempotent
    // This middleware is typically used for POST requests, but can be adapted for PUT/PATCH
    const idempotentMethods = ['POST', 'PUT', 'PATCH'];
    if (!idempotentMethods.includes(req.method)) {
        throw AppError.MethodNotAllowed("Method not allowed", `The ${req.method} method is not allowed for idempotent operations.`);
    }

    // Check if the idempotency key is provided in the headers
    // This is a required field for idempotent operations
    const idempotencyKeyHeaderName = process.env.IDEMPOTENCY_HEADER_NAME || 'idempotency-key';
    const idempotencyKey = req.headers[idempotencyKeyHeaderName] as string;
    if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.trim() === '') {
        throw AppError.BadRequest("Invalid idempotency key", "Idempotency key is required and must be a non-empty string");
    }

    try {
        // Hash the body of the request to create a unique identifier for the request
        // This is used to ensure that the same request body does not create multiple transactions
        // with the same idempotency key
        const requestBodyHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

        // Check if the idempotency key already exists in Redis
        const redisKey = process.env.IDEMPOTENCY_PREFIX ? `${process.env.IDEMPOTENCY_PREFIX}:${idempotencyKey}` : `idempotency:${idempotencyKey}`;
        const alreadyProcessed = await RedisUtil.get<IdempotencyMeta>(redisKey);
        if (alreadyProcessed) {
            // If it exists, check if the request body hash matches the one stored in Redis
            if (alreadyProcessed.bodyHash !== requestBodyHash) {
                // If it exists but does not match, throw an error
                throw AppError.Conflict("Idempotency key conflict", "A transaction with this idempotency key already exists with a different request body.");
            }

            // Check if the idempotency key is already expired
            const currentTime = new Date();
            if (alreadyProcessed.expiredAt && new Date(alreadyProcessed.expiredAt) < currentTime) {
                // And throw an error indicating that the idempotency key has expired
                throw AppError.Expired("Idempotency key expired", "The idempotency key has expired and cannot be used for this transaction.");
            }
            
            // If it exists and matches, return the unmarshalled response payload
            // This means the transaction has already been processed
            res.status(200).json(
                FormatResponse({
                    message: "Transaction already processed",
                    data: JSON.parse(alreadyProcessed.responsePayload),
                    req,
                })
            );

            return;
        } else {
            // Check if the idempotency key exists in the database
            const idempotencyMeta = await IdempotencyMeta.findOne({
                where: { key: idempotencyKey, bodyHash: requestBodyHash },
            });

            // If it exists in the database, check if the request body hash matches
            if (idempotencyMeta) {
                // If it exists but does not match, throw an error
                if (idempotencyMeta.bodyHash !== requestBodyHash) {
                    throw AppError.Conflict("Idempotency key conflict", "A transaction with this idempotency key already exists with a different request body.");
                }

                // Check if the idempotency key is already expired
                const currentTime = new Date();
                if (idempotencyMeta.expiredAt && new Date(idempotencyMeta.expiredAt) < currentTime) {
                    // Throw an error indicating that the idempotency key has expired
                    throw AppError.Expired("Idempotency key expired", "The idempotency key has expired and cannot be used for this transaction.");
                }

                // If it exists and matches, return the unmarshalled response payload
                res.status(200).json(
                    FormatResponse({
                        message: "Transaction already processed",
                        data: JSON.parse(idempotencyMeta.responsePayload),
                        req,
                    })
                );

                return;
            }
        }

        // If it does not exist, create a new entry in Redis
        const idempotencyContext: IdempotencyInterface = {
            key: idempotencyKey,
            bodyHash: requestBodyHash,
        };

        // Attach the idempotency context to the request object
        req.idempotency = idempotencyContext;
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // Re-throw known AppErrors
        }
        
        throw AppError.InternalServerError("Error checking idempotency key", error);
    }

    // Proceed to the next middleware or route handler
    next();
};

export default idempotencyMiddleware;