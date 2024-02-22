import { IsEmail, IsNotEmpty } from "class-validator";

export class SendRequestDTO {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
