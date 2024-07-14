import { AccessTokenPayload } from "~common/types/access-token-payload";
import { User } from "~routes/users/entities/user.entity";

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
}
