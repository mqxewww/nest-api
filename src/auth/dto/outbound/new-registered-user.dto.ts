import { RefreshToken } from "~routes/auth/entities/refresh_token.entity";
import { User } from "~routes/users/entities/user.entity";

export class NewRegisteredUserDTO {
  public constructor(
    public readonly uuid: string,
    public readonly login: string,
    public readonly access_token: string,
    public readonly refresh_token: string
  ) {}

  public static build(
    user: User & { refresh_token: RefreshToken },
    access_token: string
  ): NewRegisteredUserDTO {
    return new NewRegisteredUserDTO(user.uuid, user.login, access_token, user.refresh_token.token);
  }
}
