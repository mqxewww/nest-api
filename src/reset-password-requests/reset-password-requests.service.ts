import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { hashSync } from "bcrypt";
import { ApiError } from "../common/constants/api-errors.constant";
import { MailTextSubject } from "../common/constants/mail-texts.constant";
import { TokenCharset, TokenHelper } from "../common/helpers/token.helper";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { User } from "../users/entities/user.entity";
import { UpdateUserPasswordDTO } from "./dto/inbound/update-user-password.dto";
import { VerifyCodeDTO } from "./dto/inbound/verify-code.dto";
import { VerificationResponseDTO } from "./dto/outbound/verification-response.dto";
import { ResetPasswordRequest } from "./entities/reset-password-request.entity";

@Injectable()
export class ResetPasswordRequestsService {
  private readonly REQUEST_EXPIRATION_TIME = 10; // In minutes
  private readonly logger = new Logger(ResetPasswordRequestsService.name);

  public constructor(
    private readonly em: EntityManager,
    private readonly nodeMailerService: NodeMailerService
  ) {}

  public async sendRequest(to: string): Promise<boolean> {
    const user = await this.em.findOne(User, { email: to });

    if (!user) return true;

    const existingRequest = await this.em.findOne(ResetPasswordRequest, {
      user
    });

    const date = new Date();
    date.setMinutes(date.getMinutes() - this.REQUEST_EXPIRATION_TIME);

    if (existingRequest) {
      // Prevents recreating a new request for REQUEST_EXPIRATION_TIME minutes
      if (existingRequest.verification_code_generated_at > date)
        throw new HttpException(
          ApiError.RESET_PASSWORD_REQUEST_IN_PROGRESS,
          HttpStatus.TOO_MANY_REQUESTS
        );

      await this.em.removeAndFlush(existingRequest);
    }

    const request = this.em.create(ResetPasswordRequest, {
      user,
      verification_code: TokenHelper.generate(6, TokenCharset.NUMBERS_ONLY)
    });

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: user.first_name,
      VERIFICATION_CODE: request.verification_code
    };

    await this.nodeMailerService.sendMail(to, MailTextSubject.RESET_PASSWORD_REQUEST, params);

    await this.em.persistAndFlush(request);

    return true;
  }

  public async verifyCode(body: VerifyCodeDTO): Promise<VerificationResponseDTO> {
    const request = await this.em.findOne(ResetPasswordRequest, {
      user: { email: body.email },
      verification_code: body.verification_code
    });

    if (!request) throw new BadRequestException(ApiError.INVALID_VERIFICATION_CODE);

    const date = new Date();
    date.setMinutes(date.getMinutes() - this.REQUEST_EXPIRATION_TIME);

    if (request.verification_code_generated_at < date)
      throw new HttpException(ApiError.EXPIRED_VERIFICATION_CODE, HttpStatus.REQUEST_TIMEOUT);

    request.update_key = TokenHelper.generate(32, TokenCharset.BOTH);
    request.update_key_generated_at = new Date();

    await this.em.persistAndFlush(request);

    return VerificationResponseDTO.from(request.update_key);
  }

  public async updateUserPassword(body: UpdateUserPasswordDTO): Promise<boolean> {
    const request = await this.em.findOne(ResetPasswordRequest, {
      update_key: body.update_key
    });

    if (!request) throw new BadRequestException(ApiError.INVALID_UPDATE_KEY);

    request.user.password = hashSync(body.password, 10);

    await this.em.persistAndFlush(request.user);

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: request.user.first_name
    };

    await this.nodeMailerService.sendMail(
      request.user.email,
      MailTextSubject.PASSWORD_CHANGED,
      params
    );

    // Remove the user's refresh_token to force a new login.
    if (request.user.refresh_token) await this.em.removeAndFlush(request.user.refresh_token);

    await this.em.removeAndFlush(request);

    return true;
  }
}
