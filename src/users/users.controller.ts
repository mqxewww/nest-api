import { Controller, Delete, Get, NotFoundException, Param, Patch, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FindEntitiesQueryDTO } from "../common/dto/inbound/find-entities-query.dto";
import { EntitiesAndCount } from "../common/dto/outbound/entities-and-count.dto";
import { PatchUserQueryDTO } from "./dto/inbound/patch-user-query.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get("find")
  public async find(@Query() query: FindEntitiesQueryDTO): Promise<EntitiesAndCount<UserDTO>> {
    return await this.usersService.find(query);
  }

  @Get("find-one/:search")
  public async findOne(@Param("search") search: string): Promise<UserDTO> {
    const user = await this.usersService.findOne(search);

    if (!user) throw new NotFoundException("User not found");

    return UserDTO.from(user);
  }

  @Patch("patch-one/:uuid")
  public async patchOne(
    @Param("uuid") uuid: string,
    @Query() query: PatchUserQueryDTO
  ): Promise<UserDTO> {
    return await this.usersService.patchOne(uuid, query);
  }

  @Delete("delete-one/:uuid")
  public async deleteOne(@Param("uuid") uuid: string): Promise<boolean> {
    return await this.usersService.deleteOne(uuid);
  }
}
