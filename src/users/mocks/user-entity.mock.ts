import { fakerFR as faker } from "@faker-js/faker";
import { User } from "../entities/user.entity";

type UserMock = Omit<User, "avatar" | "refresh_token" | "reset_password_request">;

export function getMockedUser(params?: Partial<Omit<User, "login">>): UserMock {
  const firstName = params?.first_name ?? faker.person.firstName();
  const lastName = params?.last_name ?? faker.person.lastName();

  return {
    id: params?.id ?? faker.number.int(),
    uuid: params?.uuid ?? faker.string.uuid(),
    created_at: params?.created_at ?? faker.date.recent(),
    updated_at: params?.updated_at ?? faker.date.recent(),
    first_name: firstName,
    last_name: lastName,
    email: params?.email ?? faker.internet.email({ firstName, lastName }),
    login: `${firstName}.${lastName}`.toLowerCase().replace(" ", ""),
    password: params?.password ?? ""
  };
}
