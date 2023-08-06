import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import bcrypt, { hashSync } from "bcrypt";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { RegisterDTO } from "./dto/inbound/register.dto";

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,

    @InjectRepository(User)
    private readonly usersRepository: EntityRepository<User>
  ) {}

  public async register(registerDto: RegisterDTO): Promise<User> {
    let login: string;

    for (let i = 0; ; i++) {
      login =
        i === 0
          ? `${registerDto.first_name}.${registerDto.last_name}`.toLowerCase()
          : `${registerDto.first_name}.${registerDto.last_name}${i}`.toLowerCase();

      const user = await this.usersRepository.findOne({ login });

      if (!user) break;
    }

    return await this.usersRepository.upsert({
      ...registerDto,
      login,
      password: hashSync(registerDto.password, 10)
    });
  }

  public async validateUser(
    login: string,
    password: string
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.usersService.findOne(login);

    const areParametersValid = user && bcrypt.compareSync(password, user.password);

    return areParametersValid ? ({ ...user, password: undefined } as Omit<User, "password">) : null;
  }
}
