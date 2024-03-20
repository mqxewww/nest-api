export enum TokenCharset {
  CHARACTERS_ONLY = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  NUMBERS_ONLY = "0123456789",
  BOTH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
}

export class TokenHelper {
  public static generate(length: number, charset: TokenCharset): string {
    let token = "";

    for (let i = 0; i < length; i++)
      token += charset.charAt(Math.floor(Math.random() * charset.length));

    return token;
  }
}
