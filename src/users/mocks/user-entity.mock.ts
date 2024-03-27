import { fakerFR as faker } from "@faker-js/faker";
import { User } from "../entities/user.entity";

type UserMock = Omit<User, "avatar" | "refresh_token" | "reset_password_request">;

export function getMockedUser(): UserMock {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: faker.number.int(),
    uuid: faker.string.uuid(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email({ firstName, lastName }),
    login: `${firstName}.${lastName}`.toLowerCase().replace(" ", ""),
    password: ""
  };
}
