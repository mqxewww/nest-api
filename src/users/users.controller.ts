import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { UserDTO } from "./dto/outbound/user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get("/find-by-uuid/:uuid")
  public async findByUuid(@Param("uuid") uuid: string): Promise<UserDTO> {
    const user = await this.usersService.findByUuid(uuid);

    return UserDTO.fromEntity(user);
  }

  @Post("/register")
  public async register(@Body() registerDto: RegisterDTO): Promise<UserDTO> {
    const userCreated = await this.usersService.register(registerDto);

    return UserDTO.fromEntity(userCreated);
  }

  @Post("/login")
  public async login(@Body() loginDto: LoginDTO): Promise<boolean> {
    await this.usersService.login(loginDto);

    return true;
  }
}
