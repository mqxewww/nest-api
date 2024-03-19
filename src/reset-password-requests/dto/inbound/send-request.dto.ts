import { IsEmail } from "class-validator";

export class SendRequestDTO {
  @IsEmail()
  public email: string;
}
