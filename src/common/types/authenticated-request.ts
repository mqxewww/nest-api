import { Request } from "express";
import { AccessTokenPayload } from "./access-token-payload";

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}
