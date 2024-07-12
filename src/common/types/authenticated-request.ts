import { Request } from "express";
import { AuthPayload } from "./auth-payload";

export interface AuthenticatedRequest extends Request {
  user: AuthPayload;
}
