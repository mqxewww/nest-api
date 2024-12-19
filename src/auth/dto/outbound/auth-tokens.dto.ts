import { RefreshToken } from "~routes/auth/entities/refresh_token.entity";

export class AuthTokensDTO {
  public constructor(
    public readonly access_token: string,
    public readonly refresh_token: string
  ) {}

  public static build(refresh_token: RefreshToken, access_token: string): AuthTokensDTO {
    return new AuthTokensDTO(access_token, refresh_token.token);
  }
}
