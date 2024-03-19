import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FindEntitiesQueryDTO {
  @IsString()
  @IsOptional()
  public search?: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public limit?: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public offset?: number;
}
