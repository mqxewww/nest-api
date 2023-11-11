import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import fs from "fs";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          publicKey: fs.readFileSync("./config/public_key.pem"),
          privateKey: fs.readFileSync("./config/private_key.pem"),
          signOptions: {
            algorithm: "RS256",
            expiresIn: configService.get<string>("TOKEN_EXPIRES_IN")
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
