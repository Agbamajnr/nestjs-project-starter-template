import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class Seeder {
  logger = new Logger(Seeder.name);
  seeders: Array<{ seed: () => Promise<unknown> }>;
  constructor() {
    this.seeders = [];
  }

  async seed() {
    this.logger.log('Started process of seeding');
    for (const seeder of this.seeders) {
      await seeder.seed();
    }
  }
}
