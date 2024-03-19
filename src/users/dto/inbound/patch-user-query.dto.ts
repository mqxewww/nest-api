import { IsOptional, IsString } from "class-validator";

export class PatchUserQueryDTO {
  @IsString()
  @IsOptional()
  public first_name?: string;

  @IsString()
  @IsOptional()
  public last_name?: string;
}
