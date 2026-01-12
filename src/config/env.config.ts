import * as dotenv from 'dotenv';
dotenv.config();

type EnvConfig = {
    APP_VERSION: string;
    NODE_ENV: string;
    SERVER_PORT: number;

    PG_DATABASE_HOST: string;
    PG_DATABASE_PORT: number;
    PG_DATABASE_USERNAME: string;
    PG_DATABASE_PASSWORD: string;
    PG_DATABASE_NAME: string;
    PG_DATABASE_CA_KEY: string;
    PG_DATABASE_SSL_MODE: string;

    REDIS_HOST: string;
    REDIS_PORT: number;
}

const env: EnvConfig = process.env as unknown as EnvConfig;
type EnvironmentType = 'development' | 'staging' | 'production' | 'test';

export const appEnv: EnvironmentType =
    (env.NODE_ENV as EnvironmentType) || 'development';

export const CURRENT_APP_VERSION = env.APP_VERSION ?? 'v1';

export const SERVER_PORT = env.SERVER_PORT;

const POSTGRES_DATABASE_CONFIG = {
    host: env.PG_DATABASE_HOST,
    port: env.PG_DATABASE_PORT,
    username: env.PG_DATABASE_USERNAME,
    password: env.PG_DATABASE_PASSWORD,
    database: env.PG_DATABASE_NAME,
    caKey: env.PG_DATABASE_CA_KEY,
    sslMode: env.PG_DATABASE_SSL_MODE,
};

export const PostgresDatasource = {
    host: POSTGRES_DATABASE_CONFIG.host,
    port: POSTGRES_DATABASE_CONFIG.port,
    username: POSTGRES_DATABASE_CONFIG.username,
    password: POSTGRES_DATABASE_CONFIG.password,
    database: POSTGRES_DATABASE_CONFIG.database,
    caKey: POSTGRES_DATABASE_CONFIG.caKey,
    sslMode: POSTGRES_DATABASE_CONFIG.sslMode == 'true',
};
export type DatasourceConfig = typeof PostgresDatasource;

// Configuration for Redis connection
export const REDIS_DB_CONFIG = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    retryAttempts: 10,
    retryDelay: 3000,
};
