import { DataSourceOptions } from 'typeorm';
import { DatasourceConfig } from './env.config';
export const TypeOrmConfig = (ds: DatasourceConfig): DataSourceOptions => {
    return {
        type: 'postgres',
        host: ds.host,
        port: ds.port,
        username: ds.username,
        password: ds.password,
        database: ds.database,
        entities: [`${__dirname}/../**/*.entity{.js,.ts}`],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
        ssl: ds.sslMode,
    };
}