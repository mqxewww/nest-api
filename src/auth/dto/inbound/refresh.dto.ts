import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDTO {
  @IsNotEmpty()
  @IsString()
  public refresh_token: string;
}
