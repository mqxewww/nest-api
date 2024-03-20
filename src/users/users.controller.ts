import { Body, Controller, Delete, Get, Param, Patch, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetUserUuid } from "../common/decorators/get-user-uuid.decorator";
import { FindEntitiesQueryDTO } from "../common/dto/inbound/find-entities-query.dto";
import { EntitiesAndCount } from "../common/dto/outbound/entities-and-count.dto";
import { ChangePasswordDTO } from "./dto/inbound/change-password.dto";
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
    return await this.usersService.findOne(search);
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

  /** Change authenticated user's password. The user must be logged in to change his password this way. */
  @ApiBearerAuth()
  @Put("change-password")
  public async changePassword(
    @GetUserUuid() uuid: string,
    @Body() body: ChangePasswordDTO
  ): Promise<boolean> {
    return await this.usersService.changePassword(uuid, body);
  }

  /** Deletes a user by UUID. */
  @Delete("delete-one/:uuid")
  public async deleteOne(@Param("uuid") uuid: string): Promise<boolean> {
    return await this.usersService.deleteOne(uuid);
  }
}
