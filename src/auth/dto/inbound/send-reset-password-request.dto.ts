import { IsEmail, IsNotEmpty } from "class-validator";

export class SendResetPasswordRequestDTO {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
