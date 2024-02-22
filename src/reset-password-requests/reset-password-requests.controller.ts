import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";
import { SendRequestDTO } from "./dto/inbound/send-request.dto";
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
}
