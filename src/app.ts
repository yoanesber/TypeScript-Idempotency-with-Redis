import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import requestId from 'express-request-id';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// routes
import transactionRoutes from './routes/transaction.routes';

// middlewares
import cors from './middlewares/cors.middleware';
import detectParameterPollution from './middlewares/pollution.middleware';
import errorHandler from './middlewares/error.middleware';
import logger from './middlewares/logger.middleware';
import notFoundResource from './middlewares/not-found-resource.middleware';
import validateContentType from './middlewares/validate-content-type.middleware';
import { generalRateLimiter } from './middlewares/rate-limiter.middleware';

/**
 * Main application entry point.
 * This file sets up the Express application, applies middlewares, and registers routes.
 * It also handles not found routes and errors.
 * The application is configured to use various middlewares for security, logging, request ID generation, and response compression.
 */
const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

// to log incoming requests to the console, which can be useful for debugging
app.use(logger);

// to protect your application from common web vulnerabilities by setting appropriate HTTP headers.
app.use(helmet());

// to enable Cross-Origin Resource Sharing (CORS) for your application, allowing it to accept requests from different origins.
app.use(cors);

// to parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.
app.use(express.json());

// to check if any query parameters have multiple values and throws an error if it detects such pollution
app.use(detectParameterPollution);

// to generate a unique request ID for each incoming request, which can be useful for tracking and debugging purposes.
app.use(requestId());

// to compress the response bodies of HTTP requests, which can help reduce the size of the response and improve performance.
app.use(compression());

// to validate the Content-Type header of incoming requests
app.use(validateContentType('application/json'));

// register all routes
app.use('/api/transactions', generalRateLimiter, transactionRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// to handle requests for resources that are not found
app.use(notFoundResource);

// to handle errors that occur in your application
app.use(errorHandler);

export default app;
