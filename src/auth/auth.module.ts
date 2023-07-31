import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [MikroOrmModule.forFeature([User]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
