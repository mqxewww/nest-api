import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Transporter, createTransport } from "nodemailer";
import { ApiError } from "../constants/api-errors.constant";
import { MailText, MailTextSubject } from "../constants/mail-texts.constant";
import { NodeMailerResponse } from "../types/node-mailer-response";

@Injectable()
export class NodeMailerService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(NodeMailerService.name);

  public constructor() {
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
      }
    });
  }

  public async sendMail(
    to: string | string[],
    subject: MailTextSubject,
    params: Record<string, unknown>
  ): Promise<NodeMailerResponse> {
    let html = MailText[subject];

    for (const key in params)
      if (params.hasOwnProperty(key)) html = html.replace(`{{${key}}}`, `${params[key]}`);

    try {
      const response = (await this.transporter.sendMail({
        to,
        subject,
        html
      })) as NodeMailerResponse;

      const subjectKey = Object.keys(MailTextSubject).find(
        (key) => MailTextSubject[key] === subject
      );

      switch (true) {
        case response.accepted.length === 1:
          this.logger.log(
            `An email was sent to ${response.accepted[0]} for ${subjectKey} with the following parameters: ${JSON.stringify(params)}`
          );
          break;
        case response.accepted.length > 1:
          this.logger.log(
            `An email was sent to ${response.accepted.length} addresses for ${subjectKey} with the following parameters: ${JSON.stringify(params)}`
          );
          break;
      }

      return response;
    } catch (error: unknown) {
      this.logger.error(error);

      throw new InternalServerErrorException(ApiError.EMAIL_ERROR);
    }
  }
}
