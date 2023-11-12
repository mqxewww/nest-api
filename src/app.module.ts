import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import fs from "fs";
import Joi from "joi";
import { LoggerModule } from "nestjs-pino";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { AvatarsModule } from "./avatars/avatars.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "./config/.env",
      isGlobal: true,
      validationSchema: Joi.object({
        API_PORT: Joi.number().default(3000),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().allow("").required(),
        DATABASE_NAME: Joi.string().default("nest-api"),
        TOKEN_EXPIRES_IN: Joi.string()
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20
      }
    ]),
    MikroOrmModule.forRoot(),
    JwtModule.register({
      global: true,
      publicKey: fs.readFileSync("./config/public_key.pem"),
      privateKey: fs.readFileSync("./config/private_key.pem"),
      signOptions: { algorithm: "RS256", expiresIn: process.env.TOKEN_EXPIRES_IN }
    }),
    AuthModule,
    AvatarsModule,
    UsersModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useValue: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {}
