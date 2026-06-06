import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable Gzip/Brotli compression for all API responses
  app.use(compression());
  
  // Enable CORS for web frontend
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
