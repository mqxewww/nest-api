import { Module } from "@nestjs/common";
import { CustomJwtModule } from "../common/modules/custom-jwt.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [UsersModule, CustomJwtModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
