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

  /**
   * Finds users based on the provided query parameters.
   * @param query The query parameters used to filter and paginate the results.
   * @returns An object containing the found users and the total count of users that match the query.
   */
  @Get("find")
  public async find(@Query() query: FindEntitiesQueryDTO): Promise<EntitiesAndCount<UserDTO>> {
    return await this.usersService.find(query);
  }

  /**
   * Finds a user by its UUID or login.
   * @param search user's UUID or login.
   * @returns The found user.
   */
  @Get("find-one/:search")
  public async findOne(@Param("search") search: string): Promise<UserDTO> {
    const user = await this.usersService.findOne(search);

    if (!user) throw new NotFoundException("User not found");

    return UserDTO.from(user);
  }

  /**
   * Retrieves the user information for the authenticated user.
   * @param uuid The UUID from the JWT token.
   * @returns The user information.
   */
  @Get("me")
  public async me(@GetUserUuid() uuid: string): Promise<UserDTO> {
    return await this.usersService.me(uuid);
  }

  /**
   * Updates a user with the given UUID using the provided query parameters.
   * @param uuid The UUID of the user to update.
   * @param query The query parameters to use for the update.
   * @returns The updated user.
   */
  @Patch("patch-one/:uuid")
  public async patchOne(
    @Param("uuid") uuid: string,
    @Query() query: PatchUserQueryDTO
  ): Promise<UserDTO> {
    return await this.usersService.patchOne(uuid, query);
  }

  /**
   * Deletes a user with the specified UUID.
   * @param uuid The UUID of the user to delete.
   * @returns A boolean indicating whether the user was successfully deleted.
   */
  @Delete("delete-one/:uuid")
  public async deleteOne(@Param("uuid") uuid: string): Promise<boolean> {
    return await this.usersService.deleteOne(uuid);
  }
}
