# Variables for the application container
APP_CONTAINER_IMAGE=my-typescript-app
APP_CONTAINER_NAME=typescript-app
APP_DOCKER_CONTEXT=.
APP_DOCKERFILE=./docker/app/Dockerfile
APP_ENV_FILE=.env
APP_PORT=4000

# Variables for the PostgreSQL container
POSTGRES_CONTAINER_IMAGE=my-postgres-server
POSTGRES_CONTAINER_NAME=postgres-server
POSTGRES_DOCKER_CONTEXT=./docker/postgres
POSTGRES_DOCKERFILE=./docker/postgres/Dockerfile
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=P@ssw0rd
POSTGRES_DB=nodejs_demo

# Variables for the Redis container
REDIS_CONTAINER_IMAGE=my-redis-server
REDIS_CONTAINER_NAME=redis-server
REDIS_DOCKERFILE=./docker/redis/Dockerfile
REDIS_DOCKER_CONTEXT=.
REDIS_PORT=6379

# Network for the application and Redis containers
NETWORK=app-network

## Compile TypeScript files
build:
	npm run build

## 🚀 Start app in production
start:
	npm run start

## 🔄 Start app in development (with auto-reload)
dev:
	npm run dev

## 🧪 Run unit tests
test:
	npm run test

## 🔁 Run tests in watch mode
test-watch:
	npm run test:watch

## 🔍 Run ESLint
lint:
	npm run lint:check

## 🛠 Run ESLint with --fix
lint-fix:
	npm run lint:fix

# 🧹 Clean dist
clean-dist:
	npm run clean-windows

## 🧹 Clean node_modules and cache
clean-node-modules:
	rm -rf node_modules package-lock.json

## 📥 Install dependencies
install:
	npm install

## 🆕 Reset (clean + reinstall)
reinstall: clean install

## 📦 Check unused/outdated dependencies
check-deps:
	npm-check

## 🧹 Prune unlisted dependencies from node_modules
prune:
	npm prune

## 📦 Run database migrations
migrate: 
	npx sequelize-cli db:migrate

## 📦 Undo the last database migration
undo-migrate:
	npx sequelize-cli db:migrate:undo

refresh-migrate:
	npx sequelize-cli db:migrate:undo:all
	npx sequelize-cli db:migrate

## 📦 Run database seeders
seed:
	npx sequelize-cli db:seed:all

## 📦 Refresh migrations and run seeders
refresh-migrate-seed: refresh-migrate seed
	
## 📦 Undo the last database seeder
undo-seed:
	npx sequelize-cli db:seed:undo

## 📦 Undo all database seeders
undo-seed-all:
	npx sequelize-cli db:seed:undo:all

## 📋 Show this help
help:
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""




## ---- Docker related targets ----
# Create a Docker network if it doesn't exist
docker-create-network:
	docker network inspect $(NETWORK) >NUL 2>&1 || docker network create $(NETWORK)

docker-remove-network:
	docker network rm $(NETWORK)




## --- PostgreSQL related targets ---
# Build PostgreSQL Docker image
docker-build-postgres:
	docker build -f $(POSTGRES_DOCKERFILE) -t $(POSTGRES_CONTAINER_IMAGE) $(POSTGRES_DOCKER_CONTEXT)

# Run PostgreSQL container
docker-run-postgres:
	docker run --name $(POSTGRES_CONTAINER_NAME) --network $(NETWORK) -p $(POSTGRES_PORT):$(POSTGRES_PORT) \
	-e POSTGRES_DB=$(POSTGRES_DB) \
	-e POSTGRES_USER=$(POSTGRES_USER) \
	-e POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) \
	-d $(POSTGRES_CONTAINER_IMAGE)

# Build and run PostgreSQL container
docker-build-run-postgres: docker-build-postgres docker-run-postgres

# Remove PostgreSQL container
docker-remove-postgres:
	docker stop $(POSTGRES_CONTAINER_NAME)
	docker rm $(POSTGRES_CONTAINER_NAME)




## --- Redis related targets ---
# Build Redis Docker image
docker-build-redis:
	docker build -f $(REDIS_DOCKERFILE) -t $(REDIS_CONTAINER_IMAGE) $(REDIS_DOCKER_CONTEXT)

# Run Redis container
docker-run-redis:
	docker run --name $(REDIS_CONTAINER_NAME) --network $(NETWORK) -p $(REDIS_PORT):$(REDIS_PORT) \
	-d $(REDIS_CONTAINER_IMAGE)

# Build and run Redis container
docker-build-run-redis: docker-build-redis docker-run-redis

# Remove Redis container
docker-remove-redis:
	docker stop $(REDIS_CONTAINER_NAME)
	docker rm $(REDIS_CONTAINER_NAME)




## --- Application related targets ---
docker-build-app:
	docker build -f $(APP_DOCKERFILE) -t $(APP_CONTAINER_IMAGE) $(APP_DOCKER_CONTEXT)

docker-run-app:
	docker run --name $(APP_CONTAINER_NAME) --network $(NETWORK) -p $(APP_PORT):$(APP_PORT) \
	--env-file $(APP_ENV_FILE) \
	--link $(POSTGRES_CONTAINER_NAME):$(POSTGRES_CONTAINER_NAME) \
	--link $(REDIS_CONTAINER_NAME):$(REDIS_CONTAINER_NAME) \
	-v keys:/usr/src/app/keys \
	-v logs:/usr/src/app/logs \
	-d $(APP_CONTAINER_IMAGE)

# Build and run the application container
docker-build-run-app: docker-build-app docker-run-app

docker-refresh-migrate-seed:
	docker exec $(APP_CONTAINER_NAME) npx sequelize-cli db:migrate:undo:all
	docker exec $(APP_CONTAINER_NAME) npx sequelize-cli db:migrate
	docker exec $(APP_CONTAINER_NAME) npx sequelize-cli db:seed:all

docker-remove-app:
	docker stop $(APP_CONTAINER_NAME)
	docker rm $(APP_CONTAINER_NAME)

docker-up: docker-create-network \
	docker-build-run-postgres \
	docker-build-run-redis \
	docker-build-run-app

docker-down: docker-remove-app \
	docker-remove-redis \
	docker-remove-postgres \
	docker-remove-network

.PHONY: build start dev test test-watch lint lint-fix clean-dist clean-node-modules install reinstall check-deps prune migrate undo-migrate refresh-migrate seed refresh-migrate-seed undo-seed undo-seed-all help \
	docker-create-network docker-remove-network \
	docker-build-postgres docker-run-postgres docker-build-run-postgres docker-remove-postgres \
	docker-build-redis docker-run-redis docker-build-run-redis docker-remove-redis \
	docker-build-app docker-run-app docker-build-run-app docker-refresh-migrate-seed docker-remove-app \
	docker-up docker-down