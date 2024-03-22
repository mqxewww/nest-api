import { Body, Controller, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";
import { SendRequestDTO } from "./dto/inbound/send-request.dto";
import { UpdateUserPasswordDTO } from "./dto/inbound/update-user-password.dto";
import { VerifyCodeDTO } from "./dto/inbound/verify-code.dto";
import { SentResetRequestDataDTO } from "./dto/outbound/sent-reset-request-data.dto";
import { ResetPasswordRequestsService } from "./reset-password-requests.service";

@ApiTags("reset-password-requests")
@Controller("reset-password-requests")
export class ResetPasswordRequestsController {
  public constructor(private readonly resetPasswordRequestsService: ResetPasswordRequestsService) {}

  /** Create a reset password request, and send the secret token by email. */
  @Public()
  @Post("send-request")
  public async sendRequest(@Body() body: SendRequestDTO): Promise<SentResetRequestDataDTO> {
    return await this.resetPasswordRequestsService.sendRequest(body);
  }

  /** Verify the request code, used to verify that the user is the owner of this account.  */
  @Public()
  @Post("verify-code")
  public async verifyCode(@Body() body: VerifyCodeDTO): Promise<{ update_key: string }> {
    return await this.resetPasswordRequestsService.verifyCode(body);
  }

  /** Update the user's password after the request code has been validated. */
  @Public()
  @Put("update-user-password")
  public async updateUserPassword(@Body() body: UpdateUserPasswordDTO): Promise<boolean> {
    return await this.resetPasswordRequestsService.updateUserPassword(body);
  }
}
