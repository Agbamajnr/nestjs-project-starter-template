import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { ScriptsModule } from './script.module';

async function bootstrap() {
  initializeTransactionalContext();
  NestFactory.createApplicationContext(ScriptsModule.forRoot())
    .then(async (appContext) => {
      const logger = new Logger('ExecutorScriptsApp');
      const commandArgs = process.argv;
      const moduleName = commandArgs[2];
      const script = appContext.get(moduleName);

      logger.log(`executing script from terminal ${moduleName}`);

      try {
        await script.execute();
        logger.debug(`${moduleName} execution completed!`);
      } catch (error) {
        logger.error('script execution failed!', error);
        throw error;
      } finally {
        appContext.close();
      }
    })
    .catch((error) => {
      throw error;
    });
}
bootstrap();
