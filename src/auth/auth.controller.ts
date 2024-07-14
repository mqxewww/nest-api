import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AllowExpiredAccessToken } from "~common/decorators/allow-expired-access-token.decorator";
import { GetUserUuid } from "~common/decorators/get-user-uuid.decorator";
import { Public } from "~common/decorators/public.decorator";
import { AuthService } from "~routes/auth/auth.service";
import { LoginDTO } from "~routes/auth/dto/inbound/login.dto";
import { RefreshDTO } from "~routes/auth/dto/inbound/refresh.dto";
import { RegisterDTO } from "~routes/auth/dto/inbound/register.dto";
import { AuthTokensDTO } from "~routes/auth/dto/outbound/auth-tokens.dto";
import { NewRegisteredUserDTO } from "~routes/auth/dto/outbound/new-registered-user.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /** Registers a new user. Login is automatically generated from user's firstName and lastName. */
  @Public()
  @Post("register")
  public async register(@Body() body: RegisterDTO): Promise<NewRegisteredUserDTO> {
    return await this.authService.register(body);
  }

  /** Logs in a user. */
  @Public()
  @Post("login")
  public async login(@Body() body: LoginDTO): Promise<AuthTokensDTO> {
    return await this.authService.login(body);
  }

  /** Get a new access token by providing the user's refresh token. */
  @ApiBearerAuth()
  @AllowExpiredAccessToken()
  @Post("refresh")
  public async refresh(
    @Body() body: RefreshDTO,
    @GetUserUuid() uuid: string
  ): Promise<AuthTokensDTO> {
    return await this.authService.refresh(body.refresh_token, uuid);
  }
}
