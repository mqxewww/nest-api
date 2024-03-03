import { Module } from "@nestjs/common";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { ResetPasswordRequestsController } from "./reset-password-requests.controller";
import { ResetPasswordRequestsService } from "./reset-password-requests.service";

@Module({
  controllers: [ResetPasswordRequestsController],
  providers: [ResetPasswordRequestsService, NodeMailerService]
})
export class ResetPasswordRequestsModule {}
