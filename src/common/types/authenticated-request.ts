import { Request } from "express";
import { AccessTokenPayload } from "~common/types/access-token-payload";

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}
