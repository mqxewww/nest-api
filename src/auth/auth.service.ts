import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import bcrypt, { hashSync } from "bcrypt";
import formatUserLoginHelper from "../common/helpers/format-user-login.helper";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { RegisterDTO } from "./dto/inbound/register.dto";

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly em: EntityManager
  ) {}

  public async register(body: RegisterDTO): Promise<User> {
    const user = new User({
      first_name: body.first_name,
      last_name: body.last_name,
      password: hashSync(body.password, 10)
    });

    const login = await formatUserLoginHelper(user.first_name, user.last_name, async (login) => {
      // Login is valid if it's not already taken
      return !(await this.em.findOne(User, { login }));
    });

    user.login = login;

    await this.em.persistAndFlush(user);

    return user;
  }

  /**
   * Validates a user's login credentials.
   * @param login The user's login.
   * @param password The user's password.
   * @returns The user if the credentials are valid, null otherwise.
   */
  public async validateUser(login: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(login);

    const areParametersValid = user && bcrypt.compareSync(password, user.password);

    return areParametersValid ? user : null;
  }
}
