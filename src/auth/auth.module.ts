import { Module } from "@nestjs/common";
import { CustomJwtModule } from "../common/modules/custom-jwt.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [CustomJwtModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
