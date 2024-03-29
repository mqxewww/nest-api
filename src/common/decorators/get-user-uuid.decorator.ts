import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { AuthPayload } from "../types/auth-payload";

export const GetUserUuid = createParamDecorator((data, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<Request>();
  const payload: AuthPayload = request["payload"];

  return payload.uuid;
});
