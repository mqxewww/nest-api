export default async (
  firstName: string,
  lastName: string,
  verifier: (login: string) => Promise<boolean>
): Promise<string> => {
  let login: string;

  for (let i = 0; ; i++) {
    login =
      i === 0
        ? `${firstName}.${lastName}`.toLowerCase().replace(" ", "")
        : `${firstName}.${lastName}${i}`.toLowerCase().replace(" ", "");

    const isValid = await verifier(login);

    if (isValid) break;
  }

  return login;
};
