import * as crypto from "crypto";

export class TokenHelper {
  public static generateForEmails(): number {
    const buffer = crypto.randomBytes(3);
    const number = buffer.readUIntBE(0, 3);

    return (number % 900000) + 100000;
  }
}
