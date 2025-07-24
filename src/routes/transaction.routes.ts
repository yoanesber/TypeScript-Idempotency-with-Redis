import Router from 'express';

import TransactionController from '../controllers/transaction.controller';
import CatchAsync from '../utils/catch-async.util';
import IdempotencyMiddleware from '../middlewares/idempotency.middleware';
import Validate from '../middlewares/validator.middleware';
import { TransactionRequestSchema } from '../dtos/transaction-request.dto';

/**
 * Transaction routes for handling transaction-related endpoints.
 * This module defines the routes for creating and retrieving transactions.
 * It uses the TransactionController to handle the business logic.
 */

const router = Router();

router.post('', IdempotencyMiddleware, Validate(TransactionRequestSchema), CatchAsync(TransactionController.createTransaction));
router.get('', CatchAsync(TransactionController.getAllTransactions));

export default router;
