import Router from 'express';

import TransactionController from '../controllers/transaction.controller';
import CatchAsync from '../utils/catch-async.util';
import IdempotencyMiddleware from '../middlewares/idempotency.middleware';
import Validate from '../middlewares/validator.middleware';
import { TransactionRequestSchema } from '../dtos/transaction-request.dto';

const router = Router();

router.post('', IdempotencyMiddleware, Validate(TransactionRequestSchema), CatchAsync(TransactionController.createTransaction));
router.get('', CatchAsync(TransactionController.getAllTransactions));

export default router;
