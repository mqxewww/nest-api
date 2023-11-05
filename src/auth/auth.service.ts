import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import bcrypt, { hashSync } from "bcrypt";
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
    let login: string;

    for (let i = 0; ; i++) {
      login =
        i === 0
          ? `${body.first_name}.${body.last_name}`.toLowerCase()
          : `${body.first_name}.${body.last_name}${i}`.toLowerCase();

      const user = await this.em.findOne(User, { login });

      if (!user) break;
    }

    const userEntity = new User({
      first_name: body.first_name,
      last_name: body.last_name,
      login,
      password: hashSync(body.password, 10)
    });

    await this.em.persistAndFlush(userEntity);

    return userEntity;
  }

  public async validateUser(login: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(login);

    const areParametersValid = user && bcrypt.compareSync(password, user.password);

    return areParametersValid ? user : null;
  }
}
