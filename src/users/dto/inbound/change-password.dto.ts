import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDTO {
  @IsNotEmpty()
  @IsString()
  public old_password: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })
  @IsString()
  public new_password: string;
}
