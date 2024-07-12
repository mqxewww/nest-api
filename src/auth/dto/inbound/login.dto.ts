import { IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
  @IsNotEmpty()
  @IsString()
  public login!: string;

  @IsNotEmpty()
  @IsString()
  public password!: string;
}
