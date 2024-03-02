import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class UpdateUserPasswordDTO {
  @IsNotEmpty()
  @IsString()
  public update_key: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })
  public password: string;
}
