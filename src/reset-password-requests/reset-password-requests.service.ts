import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { hashSync } from "bcrypt";
import { TokenCharset, TokenHelper } from "../common/helpers/token.helper";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { NodeMailerTemplate } from "../common/templates/node-mailer.template";
import { User } from "../users/entities/user.entity";
import { UpdateUserPasswordDTO } from "./dto/inbound/update-user-password.dto";
import { VerifyCodeDTO } from "./dto/inbound/verify-code.dto";
import { VerificationResponseDTO } from "./dto/outbound/verification-response.dto";
import { ResetPasswordRequest } from "./entities/reset-password-request.entity";

@Injectable()
export class ResetPasswordRequestsService {
  private readonly logger = new Logger(NodeMailerService.name);
  private readonly REQUEST_EXPIRATION_TIME = 10; // In minutes

  public constructor(
    private readonly em: EntityManager,
    private readonly nodeMailerService: NodeMailerService
  ) {}

  public async sendRequest(to: string): Promise<boolean> {
    const user = await this.em.findOne(User, { email: to });

    if (!user) return true;

    const date = new Date();
    date.setMinutes(date.getMinutes() - this.REQUEST_EXPIRATION_TIME);

    const existingRequest = await this.em.findOne(ResetPasswordRequest, {
      user
    });

    if (existingRequest) {
      if (existingRequest.verification_code_generated_at > date)
        throw new BadRequestException(
          "A reset password request is already in progress. Please try again later."
        );

      await this.em.removeAndFlush(existingRequest);
    }

    const request = new ResetPasswordRequest({
      user,
      verification_code: TokenHelper.generate(6, TokenCharset.NUMBERS_ONLY)
    });

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: user.first_name,
      VERIFICATION_CODE: request.verification_code
    };

    await this.nodeMailerService.sendMail(to, NodeMailerTemplate.RESET_PASSWORD_REQUEST, params);

    await this.em.persistAndFlush(request);

    this.logger.log(
      `A reset password request was sent to ${to} with the following parameters: ${JSON.stringify(params)}`
    );

    return true;
  }

  public async verifyCode(body: VerifyCodeDTO): Promise<VerificationResponseDTO> {
    const request = await this.em.findOne(ResetPasswordRequest, {
      user: { email: body.email },
      verification_code: body.verification_code
    });

    if (!request)
      throw new BadRequestException(
        "The verification code entered is invalid. Please verify and try again."
      );

    const date = new Date();
    date.setMinutes(date.getMinutes() - this.REQUEST_EXPIRATION_TIME);

    if (request.verification_code_generated_at < date)
      throw new BadRequestException(
        "Your reset password request has expired. Please make a new request."
      );

    request.update_key = TokenHelper.generate(32, TokenCharset.BOTH);
    request.update_key_generated_at = new Date();

    await this.em.persistAndFlush(request);

    return VerificationResponseDTO.from(request.update_key);
  }

  public async updateUserPassword(body: UpdateUserPasswordDTO): Promise<boolean> {
    const request = await this.em.findOne(ResetPasswordRequest, {
      update_key: body.update_key
    });

    if (!request)
      throw new BadRequestException("The update key is invalid. Please verify and try again.");

    request.user.password = hashSync(body.password, 10);

    await this.em.persistAndFlush(request.user);

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: request.user.first_name
    };

    await this.nodeMailerService.sendMail(
      request.user.email,
      NodeMailerTemplate.PASSWORD_CHANGED,
      params
    );

    // Remove the user's refresh_token to force a new login.
    if (request.user.refresh_token) await this.em.removeAndFlush(request.user.refresh_token);

    await this.em.removeAndFlush(request);

    return true;
  }
}
