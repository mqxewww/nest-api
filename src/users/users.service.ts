import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compareSync, hashSync } from "bcrypt";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User)
    private readonly usersRepository: EntityRepository<User>
  ) {}

  public async findByUuid(uuid: string): Promise<User> {
    return await this.usersRepository.findOneOrFail({ uuid });
  }

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

  public async login(loginDto: LoginDTO): Promise<boolean> {
    const user = await this.usersRepository.findOneOrFail({
      login: loginDto.login
    });

    if (!compareSync(loginDto.password, user.password))
      throw new UnauthorizedException("Invalid password");

    return true;
  }
}
