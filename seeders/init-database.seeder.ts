import { fakerFR as faker } from "@faker-js/faker";
import { EntityManager } from "@mikro-orm/mysql";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { hashSync } from "bcrypt";
import { UserHelper } from "~common/helpers/user.helper";
import { User } from "~routes/users/entities/user.entity";

export class InitDatabaseSeeder extends Seeder {
  private readonly logger = new Logger(InitDatabaseSeeder.name);

  public async run(em: EntityManager): Promise<void> {
    await this.handleUsersCreation(5, em);
  }

  private async handleUsersCreation(count: number, em: EntityManager): Promise<User[]> {
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
          return !(await em.findOne(User, { login }));
        }
      );

      users.push(user);
    }

    await em.persistAndFlush(users);

    return users;
  }
}
