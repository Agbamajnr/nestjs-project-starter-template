import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appEnv, DatasourceConfig } from 'src/config/env.config';
import { TypeOrmConfig } from 'src/config/typeorm.config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

@Module({})
export class PostgresModule {
    static forRoot({
        config,
    }: {
        config: { datasource: DatasourceConfig };
    }): DynamicModule {
        return {
            module: PostgresModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    useFactory() {
                        return {
                            ...(TypeOrmConfig(config.datasource)),
                            logging: appEnv === 'development',
                            extra: {
                                charset: 'utf8mb4_unicode_ci',
                                max: 45,
                            },
                            poolOptions: {
                                idleTimeoutMillis: 30000,
                            },
                        };
                    },
                    async dataSourceFactory(options) {
                        if (!options) {
                            throw new Error('Invalid options passed');
                        }

                        return addTransactionalDataSource(new DataSource(options));
                    },
                }),
            ],
            providers: [],
            exports: [TypeOrmModule],
        };
    }
}
