import { Controller, Delete, Get, NotFoundException, Param, Patch, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetUserUuid } from "../common/decorators/get-user-uuid.decorator";
import { FindEntitiesQueryDTO } from "../common/dto/inbound/find-entities-query.dto";
import { EntitiesAndCount } from "../common/dto/outbound/entities-and-count.dto";
import { PatchUserQueryDTO } from "./dto/inbound/patch-user-query.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { UsersService } from "./users.service";

@ApiBearerAuth()
@ApiTags("users")
@Controller("users")
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  /** Finds users based on the provided query parameters. */
  @Get("find")
  public async find(@Query() query: FindEntitiesQueryDTO): Promise<EntitiesAndCount<UserDTO>> {
    return await this.usersService.find(query);
  }

  /** Get a user by UUID or login. */
  @Get("find-one/:search")
  public async findOne(@Param("search") search: string): Promise<UserDTO> {
    const user = await this.usersService.findOne(search);

    if (!user) throw new NotFoundException("User not found");

    return UserDTO.from(user);
  }

  /** Get authenticated user information. */
  @Get("me")
  public async me(@GetUserUuid() uuid: string): Promise<UserDTO> {
    return await this.usersService.me(uuid);
  }

  /** Updates a user by UUID. */
  @Patch("patch-one/:uuid")
  public async patchOne(
    @Param("uuid") uuid: string,
    @Query() query: PatchUserQueryDTO
  ): Promise<UserDTO> {
    return await this.usersService.patchOne(uuid, query);
  }

  /** Deletes a user by UUID. */
  @Delete("delete-one/:uuid")
  public async deleteOne(@Param("uuid") uuid: string): Promise<boolean> {
    return await this.usersService.deleteOne(uuid);
  }
}
