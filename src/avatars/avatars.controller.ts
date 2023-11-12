import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AvatarsService } from "./avatars.service";

@ApiBearerAuth()
@ApiTags("avatars")
@Controller("avatars")
export class AvatarsController {
  public constructor(private readonly avatarsService: AvatarsService) {}
}
