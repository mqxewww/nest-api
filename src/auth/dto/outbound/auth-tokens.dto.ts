export class AuthTokensDTO {
  public readonly access_token: string;
  public readonly refresh_token: string;

  public static from(access_token: string, refresh_token: string): AuthTokensDTO {
    return {
      access_token,
      refresh_token
    };
  }
}
