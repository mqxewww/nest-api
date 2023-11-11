export default async (
  firstName: string,
  lastName: string,
  verifier: (login: string) => Promise<boolean>
): Promise<string> => {
  let login: string;
  let i = 0;

  do {
    login =
      i === 0
        ? `${firstName}.${lastName}`.toLowerCase().replace(" ", "")
        : `${firstName}.${lastName}${i}`.toLowerCase().replace(" ", "");

    i++;
  } while (!(await verifier(login)));

  return login;
};
