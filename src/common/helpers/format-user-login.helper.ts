export default async (
  firstName: string,
  lastName: string,
  verifier: (login: string) => Promise<boolean>
): Promise<string> => {
  let login: string;

  for (let i = 0; ; i++) {
    login =
      i === 0
        ? `${firstName}.${lastName}`.toLowerCase()
        : `${firstName}.${lastName}${i}`.toLowerCase();

    const isValid = await verifier(login);

    if (isValid) break;
  }

  return login;
};
