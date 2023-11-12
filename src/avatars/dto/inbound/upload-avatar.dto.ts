import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UploadAvatarDTO {
  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Avatar file compatible with image/jpeg."
  })
  public file: Express.Multer.File;
}
