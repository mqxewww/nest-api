import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { AuthenticatedRequest } from "~common/types/authenticated-request";

export const GetUserUuid = createParamDecorator((_, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

  return request.user.uuid;
});
