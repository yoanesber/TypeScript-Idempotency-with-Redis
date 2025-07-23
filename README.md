# Idempotency Demo with Redis

This project demonstrates implementing an idempotency mechanism in a **TypeScript-based API** using **Express** and **Redis**. It ensures duplicate requests (from retries, refreshes, etc.) do not cause repeated processing, especially in `POST`/`PUT` operations like payments or transactions.

---

## 🔁 Flow

Below is the high-level flow describing how the Idempotency Middleware and Transaction Service work together to ensure safe and reliable processing of requests:

```text
┌──────────────────────────────────────────────┐
│            [1] Client Sends Request          │
│----------------------------------------------│
│ - POST /transactions                         │
│ - Headers:                                   │
│   - Idempotency-Key: <UUID>                  │
│ - Body: { type, amount, consumerId }         │
└──────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│     [2] Middleware: Validate Idempotency     │
│----------------------------------------------│
│ - Ensure Idempotency-Key is present          │
│ - Hash request body using SHA256             │
└──────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│     [3] Redis Lookup: Cached Response?       │
│----------------------------------------------│
│ - If found →                                 │
│     - Compare stored bodyHash                │
│       - Mismatch → reject (409 Conflict)     │
│       - Match →                              │
│         - Check expiredAt (in payload)       │
│           - If expired → reject (419 Expired)│
│           - If valid   → return 200          │
│ - If not found → check PostgreSQL DB [4]     │
└──────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│ [4] DB Lookup: Idempotency Record Exists?    │
│----------------------------------------------│
│ - If found →                                 │
│     - Compare stored bodyHash with current   │
│       - Mismatch → reject (409 Conflict)     │
│       - Match →                              │
│         - If expired → reject (419 Expired)  │
│         - If valid   → return 200            │
│ - If not found → proceed to service [5]      │
└──────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│    [5] Service Layer Processing                │
│------------------------------------------------│
│ - Validate and parse request body              │
│ - Destructure the validated data               │
│ - Begin database transaction                   │
│   - Create transaction with status = "pending" │
│   - Create idempotency_meta with:              │
│     (key, bodyHash, responsePayload, expiredAt)│
│   - Save response to Redis (short TTL)         │
│ - Commit transaction                           │
└────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│        [6] API Response Handler              │
│----------------------------------------------│
│ - HTTP 201 Created                           │
│ - Body: { transactionId, status, ... }       │
└──────────────────────────────────────────────┘
```

---


## 🤖 Tech Stack

This project leverages a modern and robust **Node.js-based** stack to implement an idempotent-safe REST API using Redis as a caching mechanism. Below is an overview of the core technologies and tools used:

| **Component**          | **Description**                                                                                          |
|------------------------|----------------------------------------------------------------------------------------------------------|
| Language               | **TypeScript** — statically typed superset of JavaScript for safer and scalable development              |
| Runtime                | **Node.js** — JavaScript runtime built on Chrome’s V8 engine                                             |
| Web Framework          | **Express.js** — minimalist and flexible web application framework                                       |
| Caching Layer          | **Redis** — in-memory data structure store used for idempotency key tracking and response caching        |
| Idempotency Logic      | **Custom Middleware** — detects repeated requests and replays cached responses using key + body hash     |
| Request Hashing        | **Crypto (SHA256)** — used to hash request bodies to detect changes in content                           |
| Environment Config     | **dotenv** — loads environment variables from `.env` file into `process.env`                             |
| Rate Limiting          | **express-rate-limit** — limits repeated requests to APIs to prevent abuse                               |
| Validation             | **Zod** — TypeScript-first schema declaration and validation library                                     |
| Migration & Seeding    | **Sequelize CLI** — for database schema generation and initial data population                           |
| Containerization       | **Docker** — optional, Redis can be containerized for local testing and production deployment            |


---

## 🧱 Architecture Overview

The project follows a modular and layered folder structure for maintainability, scalability, and separation of concerns. Below is a high-level overview of the folder architecture:

```
📁typescript-idempotency-demo/
├── 📁docker/
│   ├── 📁app/                # Dockerfile and setup for Node.js app container
│   ├── 📁postgres/           # PostgreSQL Docker setup with init scripts or volumes
│   └── 📁redis/              # Redis Docker setup
├── 📁logs/                   # Directory for application and HTTP logs
├── 📁migrations/             # Sequelize migrations
├── 📁src/                    # Application source code
│   ├── 📁config/             # Configuration files (DB, environment, Sequelize)
│   ├── 📁controllers/        # Express route handlers, business logic endpoints
│   ├── 📁dtos/               # Data Transfer Objects for validation and typing
│   ├── 📁exceptions/         # Custom error classes for centralized error handling
│   ├── 📁middlewares/        # Express middlewares (security, logging, rate limiters, etc.)
│   ├── 📁models/             # Sequelize models representing DB entities
│   ├── 📁routes/             # API route definitions and registration
│   ├── 📁services/           # Business logic and service layer between controllers and models
│   ├── 📁types/              # Custom global TypeScript type definitions
│   └── 📁utils/              # Utility functions (e.g., redis operations, logger)
├── .env                    # Environment variables for configuration (DB credentials, Redis, Idempotency settings)
├── .sequelizerc            # Sequelize CLI configuration
├── entrypoint.sh           # Script executed at container startup (wait-for-db, run migrations, start app)
├── package.json            # Node.js project metadata and scripts
├── sequelize.config.js     # Wrapper to load TypeScript Sequelize config via ts-node
├── tsconfig.json           # TypeScript compiler configuration
└── README.md               # Project documentation
```

---

## 🛠️ Installation & Setup  

Follow the instructions below to get the project up and running in your local development environment. You may run it natively or via Docker depending on your preference.  

### ✅ Prerequisites

Make sure the following tools are installed on your system:

| **Tool**                                                    | **Description**                                    |
|-------------------------------------------------------------|----------------------------------------------------|
| [Node.js](https://nodejs.org/)                              | JavaScript runtime environment (v20+)              |
| [npm](https://www.npmjs.com/)                               | Node.js package manager (bundled with Node.js)     |
| [Make](https://www.gnu.org/software/make/)                  | Build automation tool (`make`)                     |
| [PostgreSQL](https://www.postgresql.org/)                   | Relational database system (v14+)                  |
| [Redis](https://redis.io/)                                  | In-memory data structure store (v7+)               |
| [Docker](https://www.docker.com/)                           | Containerization platform (optional)               |

### 🔁 Clone the Project  

Clone the repository:  

```bash
git clone https://github.com/yoanesber/TypeScript-Idempotency-with-Redis.git
cd TypeScript-Idempotency-with-Redis
```

### ⚙️ Configure `.env` File  

Set up your **database** and **Redis** configurations by creating a `.env` file in the project root directory:

```properties
# Application Configuration
PORT=4000
# development, production, test
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
LOG_DIRECTORY=../../logs

# Postgre Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=P@ssw0rd
DB_NAME=nodejs_demo
DB_DIALECT=postgres

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASS=
REDIS_DB=0
REDIS_FLUSH_DB=TRUE
REDIS_CONNECT_TIMEOUT=10000 # 10 seconds

# Idempotency configuration
IDEMPOTENCY_ENABLED=TRUE
IDEMPOTENCY_HEADER_NAME=idempotency-key
IDEMPOTENCY_PREFIX=idempotency
IDEMPOTENCY_TTL_HOURS=24
```

### 👤 Create Dedicated PostgreSQL User (Recommended)

For security reasons, it's recommended to avoid using the default postgres superuser. Use the following SQL script to create a dedicated user (`appuser`) and assign permissions:

```sql
-- Create appuser and database
CREATE USER appuser WITH PASSWORD 'app@123';

-- Allow user to connect to database
GRANT CONNECT, TEMP, CREATE ON DATABASE nodejs_demo TO appuser;

-- Grant permissions on public schema
GRANT USAGE, CREATE ON SCHEMA public TO appuser;

-- Grant all permissions on existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO appuser;

-- Grant all permissions on sequences (if using SERIAL/BIGSERIAL ids)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO appuser;

-- Ensure future tables/sequences will be accessible too
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO appuser;

-- Ensure future sequences will be accessible too
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO appuser;
```

Update your `.env` accordingly:
```properties
DB_USER=appuser
DB_PASS=app@123
```

---


## 🚀 Running the Application  

This section provides step-by-step instructions to run the application either **locally** or via **Docker containers**.

- **Notes**:  
  - All commands are defined in the `Makefile`.
  - To run using `make`, ensure that `make` is installed on your system.
  - To run the application in containers, make sure `Docker` is installed and running.
  - Ensure you have `NodeJs` and `npm` installed on your system

### 📦 Install Dependencies

Make sure all dependencies are properly installed:  

```bash
make install
```

### 🔧 Run Locally (Non-containerized)

Ensure PostgreSQL and Redis are running locally, then:

```bash
make dev
```

This command will run the application in development mode, listening on port `4000` by default.

### Run Migrations

To create the database schema, run:

```bash
make refresh-migrate
```

This will apply all pending migrations to your PostgreSQL database.

### 🐳 Run Using Docker

To build and run all services (PostgreSQL, Redis, and TypeScript app):

```bash
make docker-up
```

To stop and remove all containers:

```bash
make docker-down
```

- **Notes**:  
  - Before running the application inside Docker, make sure to update your environment variables `.env`
    - Change `DB_HOST=localhost` to `DB_HOST=postgres-server`.
    - Change `REDIS_HOST=localhost` to `REDIS_HOST=redis-server`.

### 🟢 Application is Running

Now your application is accessible at:
```bash
http://localhost:4000
```

---

## 🧪 Testing Scenarios  

This section outlines various test scenarios to validate the idempotency mechanism and middleware functionalities. Each scenario includes the request method, endpoint, preconditions, expected responses, and any relevant headers.

### 🔄 Idempotency Key Usage
#### Scenario 1: Create a Payment with Idempotency Key
- **Method**: `POST`
- **Endpoint**: `/api/transactions`
- **Request Body**:
```json
{
    "type": "payment",
    "amount": 12000.00,
    "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6"
}
```
- **Headers**:
```http
Content-Type: application/json
Idempotency-Key: unique-key-123
```
- **Expected Response**: Get `201 Created` response with transaction details.
```json
{
    "message": "Transaction created successfully",
    "error": null,
    "data": {
        "id": "8c825416-f74d-4a9d-aea6-9b5c82c5d22b",
        "type": "payment",
        "amount": "12000.00",
        "status": "pending",
        "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6",
        "createdAt": "2025-07-08T19:03:12.741Z",
        "updatedAt": "2025-07-08T19:03:12.741Z"
    },
    "path": "/api/transactions",
    "timestamp": "2025-07-08T19:03:12.754Z"
}
```

#### Scenario 2: Retry the Same Payment Request
- **Method**: `POST`
- **Endpoint**: `/api/transactions`
- **Request Body**:
```json
{
    "type": "payment",
    "amount": 12000.00,
    "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6"
}
```
- **Headers**:
```http
Content-Type: application/json
Idempotency-Key: unique-key-123
```
- **Expected Response**: Get `200 OK` response with the same transaction details, indicating the request was idempotent and already processed.
```json
{
    "message": "Transaction already processed",
    "error": null,
    "data": {
        "id": "8c825416-f74d-4a9d-aea6-9b5c82c5d22b",
        "type": "payment",
        "amount": "12000.00",
        "status": "pending",
        "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6",
        "createdAt": "2025-07-08T19:03:12.741Z",
        "updatedAt": "2025-07-08T19:03:12.741Z"
    },
    "path": "/api/transactions",
    "timestamp": "2025-07-08T19:04:40.975Z"
}
```


#### Scenario 3: Create a Payment with a Different Body but Same Idempotency Key
- **Method**: `POST`
- **Endpoint**: `/api/transactions`
- **Request Body**:
```json
{
    "type": "payment",
    "amount": 15000.00,
    "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6"
}
```
- **Headers**:
```http
Content-Type: application/json
Idempotency-Key: unique-key-123
```
- **Expected Response**: Get `409 Conflict` response indicating idempotency key conflict.
```json
{
    "message": "Idempotency key conflict",
    "error": "A transaction with this idempotency key already exists with a different request body.",
    "data": null,
    "path": "/api/transactions",
    "timestamp": "2025-07-08T19:07:48.718Z"
}
```

#### Scenario 4: Create a Payment with a Different Idempotency Key
- **Method**: `POST`
- **Endpoint**: `/api/transactions`
- **Request Body**:
```json
{
    "type": "payment",
    "amount": 12000.00,
    "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6"
}
```
- **Headers**:
```http
Content-Type: application/json
Idempotency-Key: unique-key-456
```
- **Expected Response**: Get `201 Created` response with new transaction details, indicating a new request was processed successfully.
```json
{
    "message": "Transaction created successfully",
    "error": null,
    "data": {
        "id": "46f704f5-cfd6-43b8-8a3f-563f0a97ccea",
        "type": "payment",
        "amount": "12000.00",
        "status": "pending",
        "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6",
        "createdAt": "2025-07-08T19:05:23.029Z",
        "updatedAt": "2025-07-08T19:05:23.029Z"
    },
    "path": "/api/transactions",
    "timestamp": "2025-07-08T19:05:23.048Z"
}
```

#### Scenario 5: Create a Payment with No Idempotency Key
- **Method**: `POST`
- **Endpoint**: `/api/transactions`
- **Request Body**:
```json
{
    "type": "payment",
    "amount": 12000.00,
    "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6"
}
```
- **Headers**:
```http
Content-Type: application/json
```
- **Expected Response**: Get `400 Bad Request` response indicating the idempotency key is required.
```json
{
    "message": "Invalid idempotency key",
    "error": "Idempotency key is required and must be a non-empty string",
    "data": null,
    "path": "/api/transactions",
    "timestamp": "2025-07-08T19:10:17.104Z"
}
```

#### Scenario 6: Create a Payment with Invalid Idempotency Key
- **Method**: `POST`
- **Endpoint**: `/api/transactions`
- **Request Body**:
```json
{
    "type": "payment",
    "amount": 12000.00,
    "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6"
}
```
- **Headers**:
```http
Content-Type: application/json
Idempotency-Key: ""
```
- **Expected Response**: Get `400 Bad Request` response indicating the idempotency key is invalid.
```json
{
    "message": "Invalid idempotency key",
    "error": "Idempotency key is required and must be a non-empty string",
    "data": null,
    "path": "/api/transactions",
    "timestamp": "2025-07-08T19:11:09.380Z"
}
```

#### Scenario 7: Create a Payment with Expired Idempotency Key (after TTL)
- **Method**: `POST`
- **Endpoint**: `/api/transactions`
- **Request Body**:
```json
{
    "type": "payment",
    "amount": 12000.00,
    "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6"
}
```
- **Headers**:
```http
Content-Type: application/json
Idempotency-Key: "unique-key-123"
```
- **Expected Response**: Get `419 Expired` response indicating the idempotency key has expired.
```json
{
    "message": "Idempotency key expired",
    "error": "The idempotency key has expired and cannot be used for this transaction.",
    "data": null,
    "path": "/api/transactions",
    "timestamp": "2025-07-08T19:18:51.810Z"
}
```


### 🔍 Fetch All Transactions

#### Scenario 1: Fetch All Transactions
- **Method**: `GET`
- **Endpoint**: `/api/transactions`
- **Expected Response**: Get `200 OK` response with a list of all transactions.
```json
{
    "message": "Transactions fetched successfully",
    "error": null,
    "data": [
        {
            "id": "39212e91-b52f-4eb0-b15c-0bec7d46e818",
            "type": "payment",
            "amount": "12000.00",
            "status": "pending",
            "consumerId": "2e373ce7-7207-43a4-9133-c820253252f6",
            "createdAt": "2025-07-08T19:20:25.730Z",
            "updatedAt": "2025-07-08T19:20:25.730Z"
        }
    ],
    "path": "/api/transactions?page=1&limit=10&sortBy=createdAt&sortOrder=desc",
    "timestamp": "2025-07-08T19:20:30.907Z"
}
```

---


## 📘 API Documentation  

The API is documented using **Swagger (OpenAPI `3.0`)**. You can explore and test API endpoints directly from the browser using Swagger UI at:

```http
http://localhost:4000/api-docs
```

This provides an interactive interface to explore the API endpoints, request/response formats, and available operations.

OpenAPI Spec can be found in  [`swagger.yaml`](./swagger.yaml) file.