import { Module } from "@nestjs/common";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, NodeMailerService]
})
export class UsersModule {}
