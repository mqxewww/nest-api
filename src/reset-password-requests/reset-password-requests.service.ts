import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { TokenHelper } from "../common/helpers/token.helper";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { NodeMailerTemplate } from "../common/templates/node-mailer.template";
import { User } from "../users/entities/user.entity";
import { ResetPasswordRequest } from "./entities/reset-password-request.entity";

@Injectable()
export class ResetPasswordRequestsService {
  private readonly logger = new Logger(NodeMailerService.name);

  public constructor(
    private readonly em: EntityManager,
    private readonly nodeMailerService: NodeMailerService
  ) {}

  public async sendRequest(to: string): Promise<boolean> {
    const user = await this.em.findOne(User, { email: to });

    if (!user) return true;

    const date = new Date();
    date.setMinutes(date.getMinutes() - 2);

    const existingRequest = await this.em.findOne(ResetPasswordRequest, {
      email: to
    });

    if (existingRequest) {
      if (existingRequest.secret_token_generated_at > date)
        throw new BadRequestException(
          "A reset password request is already in progress. Please try again later."
        );

      await this.em.removeAndFlush(existingRequest);
    }

    const request = new ResetPasswordRequest({
      email: to,
      secret_token: `${TokenHelper.generateForEmails()}`
    });

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: user.first_name,
      SECRET_TOKEN: request.secret_token
    };

    await this.nodeMailerService.sendMail(to, NodeMailerTemplate.RESET_PASSWORD_REQUEST, params);

    await this.em.persistAndFlush(request);

    this.logger.log(
      `A reset password request was sent to ${to} with the following parameters: ${JSON.stringify(params)}`
    );

    return true;
  }
}
