import { FilterQuery } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt, { hashSync } from "bcrypt";
import { ApiError } from "../common/constants/api-errors.constant";
import { MailTextSubject } from "../common/constants/mail-texts.constant";
import { FindEntitiesQueryDTO } from "../common/dto/inbound/find-entities-query.dto";
import { EntitiesAndCountDTO } from "../common/dto/outbound/entities-and-count.dto";
import { UserHelper } from "../common/helpers/user.helper";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { ChangePasswordDTO } from "./dto/inbound/change-password.dto";
import { PatchUserQueryDTO } from "./dto/inbound/patch-user-query.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  public constructor(
    private readonly em: EntityManager,
    private readonly nodeMailerService: NodeMailerService
  ) {}

  public async find(query: FindEntitiesQueryDTO): Promise<EntitiesAndCountDTO<UserDTO>> {
    const queryFilters: FilterQuery<User> = {};

    if (query.search) {
      queryFilters.$or = [
        { first_name: { $like: `%${query.search}%` } },
        { last_name: { $like: `%${query.search}%` } },
        { login: { $like: `%${query.search}%` } }
      ];
    }

    const [users, count] = await Promise.all([
      this.em.find(User, queryFilters, {
        limit: query.limit || 5,
        offset: query.offset,
        orderBy: { created_at: "DESC" },
        populate: ["avatar"]
      }),
      this.em.count(User, queryFilters)
    ]);

    return EntitiesAndCountDTO.build(
      users.map((user) => UserDTO.build(user)),
      count
    );
  }

  public async findOne(search: string): Promise<UserDTO> {
    const user = await this.em.findOne(
      User,
      {
        $or: [{ uuid: search }, { login: search.trim() }]
      },
      { populate: ["avatar"] }
    );

    if (!user) throw new NotFoundException(ApiError.USER_NOT_FOUND);

    return UserDTO.build(user);
  }

  public async me(user_uuid: string): Promise<UserDTO> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid }, { populate: ["avatar"] });

    return UserDTO.build(user);
  }

  public async patchOne(user_uuid: string, query: PatchUserQueryDTO): Promise<UserDTO> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid }, { populate: ["avatar"] });

    Object.assign(user, query);

    const login = await UserHelper.formatUserLogin(
      UserHelper.capitalizeFirstname(user.first_name.trim()),
      user.last_name.trim().toUpperCase(),
      async (login) => {
        const userWithNewLogin = await this.em.findOne(User, { login });

        // Login is valid if it's not already taken or if it's taken by the same user
        return !userWithNewLogin || (userWithNewLogin && userWithNewLogin.login === user.login);
      }
    );

    user.login = login;

    await this.em.persistAndFlush(user);

    return UserDTO.build(user);
  }

  public async changePassword(user_uuid: string, body: ChangePasswordDTO): Promise<boolean> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid });

    if (!bcrypt.compareSync(body.old_password.trim(), user.password.trim()))
      throw new BadRequestException(ApiError.INVALID_OLD_PASSWORD);

    user.password = hashSync(body.new_password.trim(), 10);

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: user.first_name
    };

    await this.nodeMailerService.sendMail(user.email, MailTextSubject.PASSWORD_CHANGED, params);

    await this.em.persistAndFlush(user);

    // Remove the user's refresh_token to force a new login.
    if (user.refresh_token) await this.em.removeAndFlush(user.refresh_token);

    return true;
  }

  public async deleteOne(uuid: string): Promise<boolean> {
    const user = await this.em.findOneOrFail(User, { uuid });

    await this.em.removeAndFlush(user);

    return true;
  }
}
