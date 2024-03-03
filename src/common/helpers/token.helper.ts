import * as crypto from "crypto";

export enum TokenCharset {
  CHARACTERS_ONLY = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  NUMBERS_ONLY = "0123456789",
  BOTH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
}

export class TokenHelper {
  public static generate(length: number, charset: TokenCharset): string {
    const randomBytesArray = crypto.randomBytes(length);
    let key = "";

    for (let i = 0; i < randomBytesArray.length; i++) {
      const byte = randomBytesArray.readUInt8(i);
      key += charset[byte % charset.length];
    }

    return key;
  }
}
