import { DynamicModule, Module } from '@nestjs/common';

export type MyDynamicModuleConfig = {
  apiKey: string;
  apiUrl: string;
};

export const MY_DYNAMIC_CONFIG = 'MY_DINAMIC_CONFIG';

@Module({})
export class MyDynamicModule {
  static register(myModuleConfig: MyDynamicModuleConfig): DynamicModule {
    //console.log(config)
    return {
      module: MyDynamicModule,
      imports: [],
      providers: [
        {
          provide: MY_DYNAMIC_CONFIG,
          useValue: myModuleConfig,
        },
      ],
      controllers: [],
      exports: [MY_DYNAMIC_CONFIG],
    };
  }
}
