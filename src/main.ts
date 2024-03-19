import { BadRequestException, HttpException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import pJson from "../package.json";
import { AppModule } from "./app.module";
import { DatabaseExceptionFilter } from "./common/filters/database-exception.filter";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    credentials: true,
    origin: ["localhost:3000"]
  });

  app.use(helmet());
  app.useLogger(app.get(Logger));

  app.useGlobalFilters(new DatabaseExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors): HttpException => {
        const result = errors.map(({ property, constraints }) => ({
          property,
          message: constraints?.[Object.keys(constraints)[0]]
        }));

        return new BadRequestException({ name: "ERROR_IN_PARAMETERS", message: result });
      },
      whitelist: true,
      stopAtFirstError: true
    })
  );

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
