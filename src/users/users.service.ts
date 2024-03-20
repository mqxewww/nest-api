import { FilterQuery } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/mysql";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import bcrypt, { hashSync } from "bcrypt";
import { ApiError } from "../common/constants/api-errors.constant";
import { FindEntitiesQueryDTO } from "../common/dto/inbound/find-entities-query.dto";
import { EntitiesAndCount } from "../common/dto/outbound/entities-and-count.dto";
import { UserHelper } from "../common/helpers/user.helper";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { NodeMailerTemplate } from "../common/templates/node-mailer.template";
import { ChangePasswordDTO } from "./dto/inbound/change-password.dto";
import { PatchUserQueryDTO } from "./dto/inbound/patch-user-query.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  public constructor(
    private readonly em: EntityManager,
    private readonly nodeMailerService: NodeMailerService
  ) {}

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

  public async findOne(search: string): Promise<UserDTO> {
    const user = await this.em.findOne(
      User,
      {
        $or: [{ uuid: search }, { login: search }]
      },
      { populate: ["avatar"] }
    );

    if (!user) throw new NotFoundException(ApiError.USER_NOT_FOUND);

    return UserDTO.from(user);
  }

  public async me(user_uuid: string): Promise<UserDTO> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid }, { populate: ["avatar"] });

    return UserDTO.from(user);
  }

  // ! Rework route : Update a user => Update the authenticated user instead
  public async patchOne(user_uuid: string, query: PatchUserQueryDTO): Promise<UserDTO> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid }, { populate: ["avatar"] });

    Object.assign(user, query);

    const login = await UserHelper.formatUserLogin(
      user.first_name,
      user.last_name,
      async (login) => {
        const userWithNewLogin = await this.em.findOne(User, { login });

        // Login is valid if it's not already taken or if it's taken by the same user
        return !userWithNewLogin || (userWithNewLogin && userWithNewLogin.login === user.login);
      }
    );

    user.login = login;

    await this.em.persistAndFlush(user);

    return UserDTO.from(user);
  }

  public async changePassword(user_uuid: string, body: ChangePasswordDTO): Promise<boolean> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid });

    if (!bcrypt.compareSync(body.old_password, user.password))
      throw new BadRequestException(ApiError.INVALID_OLD_PASSWORD);

    user.password = hashSync(body.new_password, 10);

    const params: Record<string, unknown> = {
      USER_FIRSTNAME: user.first_name
    };

    try {
      await this.nodeMailerService.sendMail(
        user.email,
        NodeMailerTemplate.PASSWORD_CHANGED,
        params
      );
    } catch (error: unknown) {
      this.logger.error(error);

      throw new InternalServerErrorException(ApiError.EMAIL_ERROR);
    }

    await this.em.persistAndFlush(user);

    return true;
  }

  // ! Rework route : Delete a user => Delete the authenticated user instead
  public async deleteOne(uuid: string): Promise<boolean> {
    const user = await this.em.findOneOrFail(User, { uuid });

    await this.em.removeAndFlush(user);

    return true;
  }
}
