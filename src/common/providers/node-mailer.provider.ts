import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Transporter, createTransport } from "nodemailer";
import {
  NodeMailerHTML,
  NodeMailerSubject,
  NodeMailerTemplate
} from "../templates/node-mailer.template";
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
    template: NodeMailerTemplate,
    params: Record<string, unknown>
  ): Promise<NodeMailerResponse> {
    let html = NodeMailerHTML[template];

    for (const key in params)
      if (params.hasOwnProperty(key)) html = html.replace(`{{${key}}}`, `${params[key]}`);

    try {
      return (await this.transporter.sendMail({
        to,
        subject: NodeMailerSubject[template],
        html
      })) as NodeMailerResponse;
    } catch (error: unknown) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        "An error occured while sending the email. Please try again later."
      );
    }
  }
}
