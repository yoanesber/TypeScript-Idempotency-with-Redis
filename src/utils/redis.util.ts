import AppError from "../exceptions/app-error.exception";
import RedisConfig from "../config/redis.config";

/**
 * Utility class for interacting with Redis.
 * This class provides methods to set, get, and delete cache entries in Redis.
 * It handles JSON serialization and deserialization of values.
 */
class RedisUtil {
    static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
        const jsonValue = JSON.stringify(value);
        const redis = await RedisConfig.getClient();
        if (!redis) {
            throw new AppError("Redis client not initialized", "Ensure that Redis is properly configured and connected.");
        }

        // Set the key with the value and expiration time
        const result = await redis.set(key, jsonValue, 'EX', ttl);
        if (result !== 'OK') {
            throw new AppError("Cache set error", `Failed to set cache for key "${key}".`);
        }
    }

    static async get<T = any>(key: string): Promise<T | null> {
        const redis = await RedisConfig.getClient();
        if (!redis) {
            throw new AppError("Redis client not initialized", "Ensure that Redis is properly configured and connected.");
        }
        
        // Get the value from Redis
        // If the key does not exist, return null
        const data = await redis.get(key);
        if (data) {
            try {
                return JSON.parse(data) as T;
            } catch (error) {
                throw new AppError("Invalid JSON format in cache", "The cached data could not be parsed as JSON.");
            }
        }
        return null;
    }

    static async del(key: string): Promise<void> {
        const redis = await RedisConfig.getClient();
        if (!redis) {
            throw new AppError("Redis client not initialized", "Ensure that Redis is properly configured and connected.");
        }

        // Delete the key from Redis
        const result = await redis.del(key);
        if (result === 0) {
            throw new AppError("Cache key not found", `The cache key "${key}" does not exist.`);
        }
    }
}

export default RedisUtil;
