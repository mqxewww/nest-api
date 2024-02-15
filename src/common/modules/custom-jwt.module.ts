import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import fs from "fs";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: fs.readFileSync("./config/public_key.pem"),
        privateKey: fs.readFileSync("./config/private_key.pem"),
        signOptions: {
          algorithm: "RS256",
          expiresIn: config.get<string>("ACCESS_TOKEN_EXPIRES_IN")
        }
      })
    })
  ],
  providers: [
    {
      provide: "AccessJwtService",
      useExisting: JwtService
    }
  ],
  exports: ["AccessJwtService"]
})
class AccessJwtModule {}

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        publicKey: fs.readFileSync("./config/public_key.pem"),
        privateKey: fs.readFileSync("./config/private_key.pem"),
        signOptions: {
          algorithm: "RS256",
          expiresIn: config.get<string>("REFRESH_TOKEN_EXPIRES_IN")
        }
      })
    })
  ],
  providers: [
    {
      provide: "RefreshJwtService",
      useExisting: JwtService
    }
  ],
  exports: ["RefreshJwtService"]
})
class RefreshJwtModule {}

@Module({
  imports: [AccessJwtModule, RefreshJwtModule],
  exports: [AccessJwtModule, RefreshJwtModule]
})
export class CustomJwtModule {}
