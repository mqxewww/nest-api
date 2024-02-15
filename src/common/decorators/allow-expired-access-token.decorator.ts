import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const ALLOW_EXPIRED_ACCESS_TOKEN_KEY = "allowExpiredAccessToken";
export const AllowExpiredAccessToken = (): CustomDecorator<string> =>
  SetMetadata(ALLOW_EXPIRED_ACCESS_TOKEN_KEY, true);
