import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AllowExpiredAccessToken } from "../common/decorators/allow-expired-access-token.decorator";
import { GetUserUuid } from "../common/decorators/get-user-uuid.decorator";
import { Public } from "../common/decorators/public.decorator";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RefreshDTO } from "./dto/inbound/refresh.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { AuthTokensDTO } from "./dto/outbound/auth-tokens.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /** Registers a new user. Login is automatically generated from user's firstName and lastName. */
  @Public()
  @Post("register")
  public async register(@Body() body: RegisterDTO): Promise<UserDTO> {
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
