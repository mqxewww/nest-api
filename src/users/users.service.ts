import { FilterQuery } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { FindEntitiesQueryDTO } from "../common/dto/inbound/find-entities-query.dto";
import { EntitiesAndCount } from "../common/dto/outbound/entities-and-count.dto";
import formatUserLoginHelper from "../common/helpers/format-user-login.helper";
import { PatchUserQueryDTO } from "./dto/inbound/patch-user-query.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  public constructor(private readonly em: EntityManager) {}

  public async find(query: FindEntitiesQueryDTO): Promise<EntitiesAndCount<UserDTO>> {
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

    return EntitiesAndCount.from(
      users.map((user) => UserDTO.from(user)),
      count
    );
  }

  public async findOne(search: string): Promise<User | null> {
    return await this.em.findOne(
      User,
      {
        $or: [{ uuid: search }, { login: search }]
      },
      { populate: ["avatar"] }
    );
  }

  public async me(uuid: string): Promise<UserDTO> {
    const user = await this.em.findOneOrFail(User, { uuid }, { populate: ["avatar"] });

    return UserDTO.from(user);
  }

  public async patchOne(uuid: string, query: PatchUserQueryDTO): Promise<UserDTO> {
    const user = await this.em.findOneOrFail(User, { uuid }, { populate: ["avatar"] });

    Object.assign(user, query);

    const login = await formatUserLoginHelper(user.first_name, user.last_name, async (login) => {
      const userWithNewLogin = await this.em.findOne(User, { login });

      // Login is valid if it's not already taken or if it's taken by the same user
      return !userWithNewLogin || (userWithNewLogin && userWithNewLogin.login === user.login);
    });

    user.login = login;

    await this.em.persistAndFlush(user);

    return UserDTO.from(user);
  }

  public async deleteOne(uuid: string): Promise<boolean> {
    const user = await this.em.findOneOrFail(User, { uuid });

    await this.em.removeAndFlush(user);

    return true;
  }
}
