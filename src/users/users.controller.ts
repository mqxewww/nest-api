import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserDTO } from "./dto/outbound/user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get("/find-by-uuid/:uuid")
  public async findByUuid(@Param("uuid") uuid: string): Promise<UserDTO> {
    const user = await this.usersService.findByUuid(uuid);

    return UserDTO.fromEntity(user);
  }
}
