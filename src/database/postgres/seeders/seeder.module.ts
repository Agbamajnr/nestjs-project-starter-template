import { Module } from '@nestjs/common';
import { Seeder } from './seeder';
@Module({
  imports: [],
  providers: [Seeder],
})
export class SeederModule { }
