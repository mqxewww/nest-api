import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { LoginDTO } from "../users/dto/inbound/login.dto";
import { RegisterDTO } from "../users/dto/inbound/register.dto";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("/register")
  public async register(@Body() registerDto: RegisterDTO): Promise<UserDTO> {
    const userCreated = await this.authService.register(registerDto);

    return UserDTO.fromEntity(userCreated);
  }

  @Post("/login")
  public async login(@Body() loginDto: LoginDTO): Promise<boolean> {
    const user = await this.authService.validateUser(loginDto.login, loginDto.password);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    return !!user;
  }
}
