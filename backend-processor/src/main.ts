import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting Pizza Backend Processor...');

  const app = await NestFactory.create(AppModule);
  
  await app.init();
  console.log('Pizza Backend Processor is listening for orders! 🍕');
  
  // Keep the application running
  await new Promise(() => {});
}

bootstrap().catch(console.error); 