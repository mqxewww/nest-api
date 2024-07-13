import { Module } from "@nestjs/common";
import { BcryptModule } from "../common/providers/bcrypt.provider";
import { NodemailerModule } from "../common/providers/nodemailer.provider";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [NodemailerModule, BcryptModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
