import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres/postgres.module';
import { PostgresDatasource } from 'src/config/env.config';

const databases = [
  PostgresModule.forRoot({ config: { datasource: PostgresDatasource } })
]

@Module({
  imports: databases,
  exports: databases,
})
export class DatabaseModule { }
