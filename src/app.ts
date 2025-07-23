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

const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

// 1. Logger middleware
// This middleware is used to log HTTP requests and responses, which can be useful for debugging and monitoring purposes.
// It logs the details of each request and response, including method, URL, status code, and response time.
app.use(logger);

// 2. Use Helmet for security headers
// This middleware is used to set various HTTP headers to help protect your app from well-known web vulnerabilities by setting HTTP headers appropriately.
// Helmet helps secure your Express apps by setting various HTTP headers.
app.use(helmet());

// 3. Enable CORS
// This middleware is used to enable Cross-Origin Resource Sharing (CORS) for your application, allowing it to accept requests from different origins.
app.use(cors);

// 4. Parse JSON request bodies
// This middleware is used to parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.
app.use(express.json());

// 5. Detect and prevent HTTP Parameter Pollution
// It checks if any query parameters have multiple values and throws an error if it detects such pollution
app.use(detectParameterPollution);

// 6. Generate and attach a unique request ID
// This middleware is used to generate a unique identifier for each incoming request, which can be useful for tracking and logging purposes.
// It adds a unique `X-Request-Id` header to each request, which can be used to trace requests through your application.
app.use(requestId());

// 7. Use compression for response size reduction
// This middleware is used to compress the response bodies for all requests that traverse through the middleware,
// helping to reduce the size of the response body and hence increase the speed of web applications.
app.use(compression());

// 8. Validate Content-Type header
// This middleware is used to ensure that incoming requests have the correct `Content-Type` header.
app.use(validateContentType('application/json'));

// 9. Register all routes
app.use('/api/transactions', generalRateLimiter, transactionRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 10. Handle not found routes
// This middleware is used to handle requests to routes that do not exist in your application.
// It catches all requests that do not match any defined routes and returns a 404 Not Found
app.use(notFoundResource);

// 11. Centralized error handler
// This middleware is used to handle errors that occur in your application.
// It catches errors thrown in the application and formats them into a consistent response structure, including status code, message, and error details.
app.use(errorHandler);

export default app;
