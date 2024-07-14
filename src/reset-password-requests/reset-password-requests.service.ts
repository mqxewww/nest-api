import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import moment from "moment";
import { ApiError } from "~common/constants/api-errors.constant";
import { MailTextSubject } from "~common/constants/mail-texts.constant";
import { TokenCharset, TokenHelper } from "~common/helpers/token.helper";
import { Bcrypt } from "~common/providers/bcrypt.provider";
import { NodemailerClass } from "~common/providers/nodemailer.provider";
import { SendRequestDTO } from "~routes/reset-password-requests/dto/inbound/send-request.dto";
import { UpdateUserPasswordDTO } from "~routes/reset-password-requests/dto/inbound/update-user-password.dto";
import { VerifyCodeDTO } from "~routes/reset-password-requests/dto/inbound/verify-code.dto";
import { SentResetRequestDataDTO } from "~routes/reset-password-requests/dto/outbound/sent-reset-request-data.dto";
import { VerifiedCodeDTO } from "~routes/reset-password-requests/dto/outbound/verified-code.dto";
import { ResetPasswordRequest } from "~routes/reset-password-requests/entities/reset-password-request.entity";
import { User } from "~routes/users/entities/user.entity";

@Injectable()
export class ResetPasswordRequestsService {
  private readonly REQUEST_EXPIRATION_TIME = 10 * 60; // In seconds

  public constructor(
    private readonly em: EntityManager,

    @Inject("nodemailer")
    private readonly nodemailerProvider: NodemailerClass,

    @Inject("bcrypt")
    private readonly bcryptProvider: Bcrypt
  ) {}

  public async sendRequest(body: SendRequestDTO): Promise<SentResetRequestDataDTO> {
    const user = await this.em.findOne(User, { email: body.email.trim() });

    if (!user) return SentResetRequestDataDTO.build(false, false);

    const existingRequest = await this.em.findOne(ResetPasswordRequest, {
      user
    });

    if (existingRequest) {
      // Prevents recreating a new request for REQUEST_EXPIRATION_TIME seconds
      if (
        moment().diff(existingRequest.verification_code_generated_at, "seconds") <=
        this.REQUEST_EXPIRATION_TIME
      )
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

    await this.nodemailerProvider.sendMail(
      user.email,
      MailTextSubject.RESET_PASSWORD_REQUEST,
      params
    );

    await this.em.persistAndFlush(request);

    return SentResetRequestDataDTO.build(true, true);
  }

  public async verifyCode(body: VerifyCodeDTO): Promise<VerifiedCodeDTO> {
    const request = await this.em.findOne(ResetPasswordRequest, {
      user: { email: body.email.trim() },
      verification_code: body.verification_code.trim()
    });

    if (!request) throw new BadRequestException(ApiError.INVALID_VERIFICATION_CODE);

    if (
      moment().diff(request.verification_code_generated_at, "seconds") >
      this.REQUEST_EXPIRATION_TIME
    )
      throw new HttpException(ApiError.EXPIRED_VERIFICATION_CODE, HttpStatus.REQUEST_TIMEOUT);

    request.update_key = TokenHelper.generate(32, TokenCharset.BOTH);
    request.update_key_generated_at = moment().toDate();

    await this.em.persistAndFlush(request);

    return VerifiedCodeDTO.build(request.update_key);
  }

  public async updateUserPassword(body: UpdateUserPasswordDTO): Promise<boolean> {
    const request = await this.em.findOne(
      ResetPasswordRequest,
      {
        update_key: body.update_key
      },
      { populate: ["user"] }
    );

    if (!request) throw new BadRequestException(ApiError.INVALID_UPDATE_KEY);

    request.user.password = this.bcryptProvider.hashSync(body.password.trim(), 10);

    await this.em.persistAndFlush(request.user);

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: request.user.first_name
    };

    await this.nodemailerProvider.sendMail(
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
