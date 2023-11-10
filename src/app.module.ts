import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import Joi from "joi";
import { LoggerModule } from "nestjs-pino";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20
      }
    ]),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validationSchema: Joi.object({
        API_PORT: Joi.number().default(3000),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().allow("").required(),
        DATABASE_NAME: Joi.string().default("nest-api")
      })
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: "HTTP"
        }),
        transport: {
          target: "pino-pretty",
          options: { singleLine: true }
        }
      }
    }),
    MikroOrmModule.forRoot(),
    AuthModule,
    UsersModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useValue: ThrottlerGuard
    }
  ]
})
export class AppModule {}
