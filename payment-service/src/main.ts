import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import helmet from 'helmet';
import { VersioningType } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.Console()],
    }),
  });
  app.enableCors();
  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');
  app.getHttpAdapter().get('/health', (req, res) => res.send('healthy'));

  const config = new DocumentBuilder()
    .setTitle('Payments Service')
    .setDescription('Opareta Take-home')
    .setVersion('1.0')
    .addTag('payments')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();