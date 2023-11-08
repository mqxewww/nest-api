import { fakerFR as faker } from "@faker-js/faker";
import { EntityManager } from "@mikro-orm/mysql";
import { Seeder } from "@mikro-orm/seeder";
import { hashSync } from "bcrypt";
import formatUserLoginHelper from "../src/common/helpers/format-user-login.helper";
import { User } from "../src/users/entities/user.entity";

export class InitDatabaseSeeder extends Seeder {
  private em: EntityManager;

  public async run(em: EntityManager): Promise<void> {
    this.em = em;

    await this.handleUsersCreation(5);
  }

  private async handleUsersCreation(count: number): Promise<User[]> {
    console.log(`Creating ${count} users...`);

    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const user = new User({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        password: hashSync("nest-api", 10)
      });

      const login = await formatUserLoginHelper(user.first_name, user.last_name, async (login) => {
        // Login is valid if it's not already taken
        return !(await this.em.findOne(User, { login }));
      });

      user.login = login;

      users.push(user);
    }

    await this.em.persistAndFlush(users);

    return users;
  }
}
