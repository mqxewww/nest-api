import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDTO {
  @IsNotEmpty()
  @IsString()
  public old_password: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })
  public new_password: string;
}
