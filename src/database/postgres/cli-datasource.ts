import { PostgresDatasource } from 'src/config/env.config';
import { TypeOrmConfig } from 'src/config/typeorm.config';
import { DataSource } from 'typeorm';

export const cliDatasource: DataSource = new DataSource({
  ...(TypeOrmConfig(PostgresDatasource)),
});
