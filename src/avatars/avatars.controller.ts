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

  /** Get an avatar by UUID. */
  @Public()
  @Get("get-avatar/:uuid")
  public async getAvatar(
    @Param("uuid") avatar_uuid: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const avatarAsReadStream = await this.avatarsService.getAvatar(avatar_uuid);

    res.set({
      "Content-Type": "image/jpeg"
    });

    return new StreamableFile(avatarAsReadStream);
  }

  /** Uploads a new avatar. Will be linked to the authenticated user. */
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
