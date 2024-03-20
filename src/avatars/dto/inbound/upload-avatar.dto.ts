import { ApiProperty } from "@nestjs/swagger";

/** This DTO is only used as a type and not as an actual DTO. See POST avatars/upload-avatar */
export class UploadAvatarDTO {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Avatar file compatible with image/jpeg."
  })
  public file: Express.Multer.File;
}
