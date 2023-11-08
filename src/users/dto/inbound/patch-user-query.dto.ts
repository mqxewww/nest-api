import { IsOptional, IsString } from "class-validator";

export class PatchUserQueryDTO {
  @IsOptional()
  @IsString()
  public first_name?: string;

  @IsOptional()
  @IsString()
  public last_name?: string;
}
