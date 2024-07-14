import { Module } from "@nestjs/common";
import { BcryptModule } from "~common/providers/bcrypt.provider";
import { CustomJwtModule } from "~common/providers/custom-jwt.provider";
import { AuthController } from "~routes/auth/auth.controller";
import { AuthService } from "~routes/auth/auth.service";

@Module({
  imports: [CustomJwtModule, BcryptModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
