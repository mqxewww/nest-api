import { Module } from "@nestjs/common";
import { BcryptModule } from "../common/providers/bcrypt.provider";
import { NodemailerModule } from "../common/providers/nodemailer.provider";
import { ResetPasswordRequestsController } from "./reset-password-requests.controller";
import { ResetPasswordRequestsService } from "./reset-password-requests.service";

@Module({
  imports: [NodemailerModule, BcryptModule],
  controllers: [ResetPasswordRequestsController],
  providers: [ResetPasswordRequestsService]
})
export class ResetPasswordRequestsModule {}
