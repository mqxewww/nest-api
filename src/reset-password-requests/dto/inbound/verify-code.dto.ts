import { IsNotEmpty, IsString } from "class-validator";

export class VerifyCodeDTO {
  @IsNotEmpty()
  @IsString()
  public email!: string;

  @IsNotEmpty()
  @IsString()
  public verification_code!: string;
}
