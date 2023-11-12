import {
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { GetUserUuid } from "../common/decorators/get-user-uuid.decorator";
import { Public } from "../common/decorators/public.decorator";
import { AvatarsService } from "./avatars.service";
import { UploadAvatarDTO } from "./dto/inbound/upload-avatar.dto";

@ApiTags("avatars")
@Controller("avatars")
export class AvatarsController {
  public constructor(private readonly avatarsService: AvatarsService) {}

  /**
   * Retrieves the avatar for the given UUID.
   * @param uuid The UUID of the avatar to retrieve.
   * @returns The avatar.
   */
  @Public()
  @Get("get-avatar/:uuid")
  public async getAvatar(
    @Param("uuid") uuid: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const avatarAsReadStream = await this.avatarsService.getAvatar(uuid);

    res.set({
      "Content-Type": "image/jpeg"
    });

    return new StreamableFile(avatarAsReadStream);
  }

  /**
   * Uploads an avatar for the authenticated user.
   * @param uuid The UUID from the JWT.
   * @param avatar The uploaded avatar file.
   * @returns A boolean indicating whether the avatar was uploaded successfully.
   */
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadAvatarDTO })
  @UseInterceptors(FileInterceptor("file"))
  @Post("upload-avatar")
  public async uploadAvatar(
    @GetUserUuid() uuid: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: "image/jpeg" })],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    )
    file: Express.Multer.File
  ): Promise<boolean> {
    return this.avatarsService.uploadAvatar(uuid, file);
  }
}
