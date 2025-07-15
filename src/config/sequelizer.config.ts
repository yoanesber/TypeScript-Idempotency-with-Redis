import 'dotenv/config';

const config = {
    development: {
        username: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        database: process.env.DB_NAME!,
        host: process.env.DB_HOST!,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        dialect: 'postgres',
        logging: true,
        force: true,
        timezone: 'UTC',
    },
    test: {
        username: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        database: process.env.DB_NAME!,
        host: process.env.DB_HOST!,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        dialect: 'postgres',
        logging: true,
        force: true,
        timezone: 'UTC',
    },
    production: {
        username: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        database: process.env.DB_NAME!,
        host: process.env.DB_HOST!,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        dialect: 'postgres',
        logging: false,
        force: false,
        timezone: 'UTC',
    },
};

export default config;