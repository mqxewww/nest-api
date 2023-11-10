import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   * @param body - The registration data.
   * @returns The registered user.
   */
  @Post("register")
  public async register(@Body() body: RegisterDTO): Promise<UserDTO> {
    const user = await this.authService.register(body);

    return UserDTO.from(user);
  }

  /**
   * Logs in a user with the provided credentials.
   * @param body - The login credentials.
   * @returns A boolean indicating whether the login was successful.
   */
  @Post("login")
  public async login(@Body() body: LoginDTO): Promise<boolean> {
    const user = await this.authService.validateUser(body.login, body.password);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    return !!user;
  }
}
