import { DynamicModule, Module } from '@nestjs/common';



const generatedModules: DynamicModule[] = [
];

@Module({
  controllers: [],
  providers: [],
  imports: [...generatedModules],
  exports: [...generatedModules],
})
export class ApiLibsModule {}
