import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import Joi from "joi";
import { LoggerModule } from "nestjs-pino";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { AvatarsModule } from "./avatars/avatars.module";
import { BcryptModule } from "./common/providers/bcrypt.provider";
import { CustomJwtModule } from "./common/providers/custom-jwt.provider";
import { NodemailerModule } from "./common/providers/nodemailer.provider";
import { ResetPasswordRequestsModule } from "./reset-password-requests/reset-password-requests.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "./config/.env",
      isGlobal: true,
      validationSchema: Joi.object({
        API_PORT: Joi.number().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().allow("").required(),
        DATABASE_NAME: Joi.string().required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string()
          .pattern(new RegExp(/^(\d+)([smhdy])$/))
          .required(),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string()
          .pattern(new RegExp(/^(\d+)([smhdy])$/))
          .required(),
        NODEMAILER_USER: Joi.string().required(),
        NODEMAILER_PASS: Joi.string().required(),
        PINO_PRETTY: Joi.boolean().required()
      })
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          customProps: () => ({
            context: "HTTP"
          }),
          transport: config.get<boolean>("PINO_PRETTY")
            ? {
                target: "pino-pretty",
                options: { singleLine: true }
              }
            : undefined
        }
      })
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20
      }
    ]),
    MikroOrmModule.forRoot(),
    AuthModule,
    AvatarsModule,
    ResetPasswordRequestsModule,
    UsersModule,
    // Providers
    BcryptModule,
    CustomJwtModule,
    NodemailerModule
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
