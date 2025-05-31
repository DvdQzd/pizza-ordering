import { Module } from '@nestjs/common';
import { OrderProcessor } from './order.processor';

@Module({
  imports: [],
  controllers: [],
  providers: [OrderProcessor],
})
export class AppModule {} 