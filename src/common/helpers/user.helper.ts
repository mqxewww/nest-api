import { fakerFR as faker } from "@faker-js/faker";
import { AccessTokenPayload } from "~common/types/access-token-payload";
import { IsolatedUser, User } from "~routes/users/entities/user.entity";

export class UserHelper {
  public static async formatUserLogin(
    first_name: string,
    last_name: string,
    verifier: (login: string) => Promise<boolean>
  ): Promise<string> {
    let login: string;
    let i = 0;

    do {
      login =
        i === 0
          ? `${first_name}.${last_name}`.toLowerCase().replace(" ", "")
          : `${first_name}.${last_name}${i}`.toLowerCase().replace(" ", "");

      i++;
    } while (!(await verifier(login)));

    return login;
  }

  public static capitalizeFirstname(first_name: string): string {
    const separatedName = first_name.split(" ");
    let formattedName = "";

    for (let i = 0; i < separatedName.length; i++) {
      formattedName +=
        separatedName[i][0].toUpperCase() + separatedName[i].substring(1).toLowerCase();

      if (separatedName[i + 1]) formattedName += " ";
    }

    return formattedName;
  }

  public static getAccessTokenPayload(user: User): AccessTokenPayload {
    return {
      sub: user.id,
      uuid: user.uuid,
      first_name: user.first_name,
      last_name: user.last_name
    };
  }

  public static generateIsolatedEntity(params?: Partial<IsolatedUser>): IsolatedUser {
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
}
