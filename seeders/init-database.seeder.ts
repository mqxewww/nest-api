import { fakerFR as faker } from "@faker-js/faker";
import { EntityManager } from "@mikro-orm/mysql";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { hashSync } from "bcrypt";
import { UserHelper } from "../src/common/helpers/user.helper";
import { User } from "../src/users/entities/user.entity";

export class InitDatabaseSeeder extends Seeder {
  private readonly logger = new Logger(InitDatabaseSeeder.name);
  private em: EntityManager;

  public async run(em: EntityManager): Promise<void> {
    this.em = em;

    await this.handleUsersCreation(5);
  }

  private async handleUsersCreation(count: number): Promise<User[]> {
    this.logger.log(`Creating ${count} users`);

    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const first_name = faker.person.firstName();
      const last_name = faker.person.lastName();

      const user = new User();

      user.first_name = first_name;
      user.last_name = last_name;
      user.email = faker.internet.email({ firstName: first_name, lastName: last_name });
      user.password = hashSync("nest-api", 10);

      user.login = await UserHelper.formatUserLogin(
        user.first_name,
        user.last_name,
        async (login) => {
          // Login is valid if it's not already taken
          return !(await this.em.findOne(User, { login }));
        }
      );

      users.push(user);
    }

    await this.em.persistAndFlush(users);

    return users;
  }
}
