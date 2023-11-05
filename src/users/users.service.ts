import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  public constructor(private readonly em: EntityManager) {}

  public async findOne(search: string): Promise<User | null> {
    return await this.em.findOne(User, {
      $or: [{ uuid: search }, { login: search }]
    });
  }
}
