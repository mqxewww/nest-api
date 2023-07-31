import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User)
    private readonly usersRepository: EntityRepository<User>
  ) {}

  public async findOne(search: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      $or: [{ uuid: search }, { login: search }]
    });
  }
}