export class AuthTokensDTO {
  public readonly access_token: string;

  public static from(access_token: string): AuthTokensDTO {
    return {
      access_token
    };
  }
}
