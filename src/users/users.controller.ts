import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserDTO } from "./dto/outbound/user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get("/find-one/:search")
  public async findOne(@Param("search") search: string): Promise<UserDTO> {
    const user = await this.usersService.findOne(search);

    if (!user) throw new NotFoundException("User not found");

    return UserDTO.fromEntity(user);
  }
}
