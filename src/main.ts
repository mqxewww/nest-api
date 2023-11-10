import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import pJson from "../package.json";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    credentials: true,
    origin: ["nest-api.apps.mqxewww.dev", "localhost:3000"]
  });

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`Documentation for ${pJson.name}`)
      .setVersion(pJson.version)
      .setDescription(pJson.description)
      .addBearerAuth()
      .build()
  );

  SwaggerModule.setup("/", app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  await app.listen(+process.env.API_PORT);
}

bootstrap();
