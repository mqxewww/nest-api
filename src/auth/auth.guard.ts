import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Request } from "express";
import { ApiError } from "../common/constants/api-errors.constant";
import { ALLOW_EXPIRED_ACCESS_TOKEN_KEY } from "../common/decorators/allow-expired-access-token.decorator";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import { AccessTokenPayload } from "../common/types/access-token-payload";
import { AuthenticatedRequest } from "../common/types/authenticated-request";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  public constructor(
    private readonly reflector: Reflector,

    @Inject("accessJwt")
    private readonly accessJwtProvider: JwtService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (type !== "Bearer" || !token) throw new UnauthorizedException(ApiError.MISSING_TOKEN);

    try {
      const payload = await this.accessJwtProvider.verifyAsync<AccessTokenPayload>(token);

      (request as AuthenticatedRequest).user = payload;
    } catch (error: unknown) {
      this.logger.debug(error);

      const allowExpiredAccessToken = this.reflector.getAllAndOverride<boolean>(
        ALLOW_EXPIRED_ACCESS_TOKEN_KEY,
        [context.getHandler(), context.getClass()]
      );

      switch (true) {
        case error instanceof TokenExpiredError:
          if (!allowExpiredAccessToken) throw new UnauthorizedException(ApiError.INVALID_TOKEN);

          // Unverified token, payload still needed in some cases
          (request as AuthenticatedRequest).user = this.accessJwtProvider.decode(token);

          return true;
        case error instanceof JsonWebTokenError:
          throw new UnauthorizedException(ApiError.INVALID_TOKEN);
        default:
          throw error;
      }
    }

    return true;
  }
}
