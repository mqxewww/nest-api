import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { AuthPayload } from "../types/auth-payload";

export const GetUserUuid = createParamDecorator((data, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<Request>();
  const payload = request["payload"] as AuthPayload;

  return payload.uuid;
});
