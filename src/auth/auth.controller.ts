import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { AuthTokensDTO } from "./dto/outbound/auth-tokens.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   * @param body - The registration data.
   * @returns The registered user.
   */
  @Public()
  @Post("register")
  public async register(@Body() body: RegisterDTO): Promise<UserDTO> {
    return await this.authService.register(body);
  }

  /**
   * Logs in a user with the provided credentials.
   * @param body - The login credentials.
   * @returns A boolean indicating whether the login was successful.
   */
  @Public()
  @Post("login")
  public async login(@Body() body: LoginDTO): Promise<AuthTokensDTO> {
    return await this.authService.login(body);
  }
}
