import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  public first_name!: string;

  @IsNotEmpty()
  @IsString()
  public last_name!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })
  @IsString()
  public password!: string;

  @IsEmail()
  public email!: string;
}
