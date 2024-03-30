import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { JwtPayload } from "../providers/custom-jwt.provider";

export const GetUserUuid = createParamDecorator((data, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<Request>();
  const payload: JwtPayload = request["payload"];

  return payload.uuid;
});
