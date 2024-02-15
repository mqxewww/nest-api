import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import bcrypt, { hashSync } from "bcrypt";
import formatUserLoginHelper from "../common/helpers/format-user-login.helper";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { AuthTokensDTO } from "./dto/outbound/auth-tokens.dto";
import { RefreshToken } from "./entities/refresh_token.entity";

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly em: EntityManager,

    @Inject("AccessJwtService")
    private readonly accessJwtService: JwtService,

    @Inject("RefreshJwtService")
    private readonly refreshJwtService: JwtService
  ) {}

  public async register(body: RegisterDTO): Promise<UserDTO> {
    const user = new User({
      first_name: body.first_name,
      last_name: body.last_name,
      password: hashSync(body.password, 10)
    });

    const login = await formatUserLoginHelper(user.first_name, user.last_name, async (login) => {
      // Login is valid if it's not already taken
      return !(await this.em.findOne(User, { login }));
    });

    user.login = login;

    await this.em.persistAndFlush(user);

    return UserDTO.from(user);
  }

  public async login(body: LoginDTO): Promise<AuthTokensDTO> {
    const user = await this.validateUser(body.login, body.password);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    if (user.refresh_token) await this.em.removeAndFlush(user.refresh_token);

    const refreshToken = new RefreshToken({ user, token: this.refreshJwtService.sign({}) });

    await this.em.persistAndFlush(refreshToken);

    return AuthTokensDTO.from(
      this.accessJwtService.sign(user.getDefaultPayload()),
      refreshToken.token
    );
  }

  public async refresh(refresh_token: string, user_uuid: string): Promise<AuthTokensDTO> {
    const user = await this.em.findOneOrFail(
      User,
      { uuid: user_uuid },
      { populate: ["refresh_token"] }
    );

    if (user.refresh_token?.token !== refresh_token)
      throw new BadRequestException(
        "The token supplied does not correspond to the one associated with your account."
      );

    try {
      await this.refreshJwtService.verifyAsync(user.refresh_token.token);
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          "Your refresh token has expired. Get a new one via auth/login.",
          `${error.name}: ${error.message}`
        );
      }

      throw error;
    }

    await this.em.removeAndFlush(user.refresh_token);

    const refreshToken = new RefreshToken({ user, token: this.refreshJwtService.sign({}) });

    await this.em.persistAndFlush(refreshToken);

    return AuthTokensDTO.from(
      this.accessJwtService.sign(user.getDefaultPayload()),
      refreshToken.token
    );
  }

  /**
   * Validates a user's login credentials.
   * @param login The user's login.
   * @param password The user's password.
   * @returns The user if the credentials are valid, null otherwise.
   */
  public async validateUser(login: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(login);

    const areParametersValid = user && bcrypt.compareSync(password, user.password);

    return areParametersValid ? user : null;
  }
}
