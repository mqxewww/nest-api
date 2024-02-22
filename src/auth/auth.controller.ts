import { Body, Controller, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AllowExpiredAccessToken } from "../common/decorators/allow-expired-access-token.decorator";
import { GetUserUuid } from "../common/decorators/get-user-uuid.decorator";
import { Public } from "../common/decorators/public.decorator";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { AuthService } from "./auth.service";
import { ChangePasswordDTO } from "./dto/inbound/change-password.dto";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RefreshDTO } from "./dto/inbound/refresh.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { SendResetPasswordRequestDTO } from "./dto/inbound/send-reset-password-request.dto";
import { AuthTokensDTO } from "./dto/outbound/auth-tokens.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /** Registers a new user. */
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

  /** Get a new access token. */
  @ApiBearerAuth()
  @AllowExpiredAccessToken()
  @Post("refresh")
  public async refresh(
    @Body() body: RefreshDTO,
    @GetUserUuid() uuid: string
  ): Promise<AuthTokensDTO> {
    return await this.authService.refresh(body.refresh_token, uuid);
  }

  /** Change authenticated user's password. The user must be logged in to change his password this way. */
  @ApiBearerAuth()
  @Put("change-password")
  public async changePassword(
    @Body() body: ChangePasswordDTO,
    @GetUserUuid() uuid: string
  ): Promise<boolean> {
    return await this.authService.changePassword(uuid, body);
  }

  /** Create a password change request, and send a secret token by email. */
  @Public()
  @Post("send-reset-password-request")
  public async sendResetPasswordRequest(
    @Body() body: SendResetPasswordRequestDTO
  ): Promise<boolean> {
    return await this.authService.sendResetPasswordRequest(body.email);
  }
}
