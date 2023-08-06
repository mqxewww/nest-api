import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import pJson from "../package.json";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Documentation for nest-api")
    .setDescription("This is the documentation for the nest-api, NestJS api with various features.")
    .setVersion(pJson.version)
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("/", app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  app.enableCors({
    credentials: true,
    origin: ["nest-api.apps.mqxewww.dev", "localhost:3000"]
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(+process.env.API_PORT);
}

bootstrap();
