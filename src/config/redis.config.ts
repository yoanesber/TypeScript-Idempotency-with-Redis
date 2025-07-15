import "dotenv/config";
import Redis from "ioredis";

import logger from "../utils/logger.util";

class RedisConfig {
    private redisClient: Redis;
    private host: string;
    private port: number;
    private db: number;
    private username?: string;
    private password?: string;
    private connectTimeout: number;

    constructor() {
        this.host = process.env.REDIS_HOST || "127.0.0.1";
        this.port = Number(process.env.REDIS_PORT) || 6379;
        this.db = Number(process.env.REDIS_DB) || 0;
        this.username = process.env.REDIS_USER;
        this.password = process.env.REDIS_PASS;
        this.connectTimeout = Number(process.env.REDIS_CONNECT_TIMEOUT) || 10000;

        this.redisClient = new Redis({
            host: this.host,
            port: this.port,
            db: this.db,
            username: this.username,
            password: this.password,
            connectTimeout: this.connectTimeout,
        });
    }

    public async getClient(): Promise<Redis> {
        if (!this.redisClient) {
            throw new Error("Redis client is not initialized.");
        }
        return this.redisClient;
    }

    public async ping(): Promise<boolean> {
        try {
            const response = await this.redisClient.ping();
            return response === "PONG";
        } catch (error) {
            logger.error("Redis ping error:", error);
            return false;
        }
    }

    public async flushDb(): Promise<string> {
        try {
            const response = await this.redisClient.flushdb();
            logger.info("Redis database flushed:", response);
            return response;
        } catch (error) {
            logger.error("Error flushing Redis database:", error);
            throw error;
        }
    }

    public async quit(): Promise<void> {
        try {
            await this.redisClient.quit();
            logger.info("Redis connection closed successfully.");
        } catch (error) {
            logger.error("Error closing Redis connection:", error);
            throw error;
        }
    }

    public async connect(): Promise<void> {
        try {
            if (await this.ping()) {
                logger.info("Redis is already connected.");
                return;
            }
            await this.redisClient.connect();
            logger.info("Redis connected successfully.");
        } catch (error) {
            logger.error("Error connecting to Redis:", error);
            throw error;
        }
    }
}

export default new RedisConfig();
