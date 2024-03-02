import { Body, Controller, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";
import { SendRequestDTO } from "./dto/inbound/send-request.dto";
import { UpdateUserPasswordDTO } from "./dto/inbound/update-user-password.dto";
import { VerifyCodeDTO } from "./dto/inbound/verify-code.dto";
import { VerificationResponseDTO } from "./dto/outbound/verification-response.dto";
import { ResetPasswordRequestsService } from "./reset-password-requests.service";

@ApiTags("reset-password-requests")
@Controller("reset-password-requests")
export class ResetPasswordRequestsController {
  public constructor(private readonly resetPasswordRequestsService: ResetPasswordRequestsService) {}

  /** Create a reset password request, and send the secret token by email. */
  @Public()
  @Post("send-request")
  public async sendRequest(@Body() body: SendRequestDTO): Promise<boolean> {
    return await this.resetPasswordRequestsService.sendRequest(body.email);
  }

  /** Verify the request code, used to verify that the user is the owner of this account.  */
  @Public()
  @Post("verify-code")
  public async verifyCode(@Body() body: VerifyCodeDTO): Promise<VerificationResponseDTO> {
    return await this.resetPasswordRequestsService.verifyCode(body);
  }

  @Public()
  @Put("update-user-password")
  public async updateUserPassword(@Body() body: UpdateUserPasswordDTO): Promise<boolean> {
    return await this.resetPasswordRequestsService.updateUserPassword(body);
  }
}
