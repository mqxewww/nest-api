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
}
