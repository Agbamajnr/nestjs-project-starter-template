import { DynamicModule, Module } from '@nestjs/common';
import { AppModule } from '../../app.module';


@Module({})
export class ScriptsModule {
  static forRoot(): DynamicModule {
    return {
      module: ScriptsModule,
      imports: [
        AppModule,
      ],
      providers: [
        // {
        //   provide: 'PopulateCities',
        //   useClass: PopulateCities,
        // },
      ],
    };
  }
}
