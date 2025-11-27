import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });


  // --- CONFIG SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Condominios API')
    .setDescription('API para gestión de edificios, gastos, pagos y balances')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // -----------------------

  await app.listen(3001);
}
bootstrap();
