import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Request } from "express";
import { ALLOW_EXPIRED_ACCESS_TOKEN_KEY } from "../common/decorators/allow-expired-access-token.decorator";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import { AuthPayload } from "../common/types/auth-payload";

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,

    @Inject("AccessJwtService")
    private readonly accessJwtService: JwtService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token)
      throw new UnauthorizedException("Missing (bearer) access token. Get one via auth/login.");

    try {
      const payload = await this.accessJwtService.verifyAsync<AuthPayload>(token);

      request["payload"] = payload;
    } catch (error: unknown) {
      const allowExpiredAccessToken = this.reflector.getAllAndOverride<boolean>(
        ALLOW_EXPIRED_ACCESS_TOKEN_KEY,
        [context.getHandler(), context.getClass()]
      );

      switch (true) {
        case error instanceof TokenExpiredError:
          if (!allowExpiredAccessToken) {
            throw new UnauthorizedException(
              "Your access token has expired. Refresh your access token via auth/refresh.",
              `${error.name}: ${error.message}`
            );
          }

          // Unverified token, payload still needed in some cases
          request["payload"] = this.accessJwtService.decode(token);

          return true;
        case error instanceof JsonWebTokenError:
          throw new UnauthorizedException(
            "Your access token is invalid. Get a new one via auth/login.",
            `${error.name}: ${error.message}`
          );
        default:
          throw error;
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : null;
  }
}
