import { EntityManager } from "@mikro-orm/mysql";
import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import bcrypt, { hashSync } from "bcrypt";
import { UserHelper } from "../common/helpers/user.helper";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { User } from "../users/entities/user.entity";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { AuthTokensDTO } from "./dto/outbound/auth-tokens.dto";
import { RefreshToken } from "./entities/refresh_token.entity";

@Injectable()
export class AuthService {
  public constructor(
    private readonly em: EntityManager,

    @Inject("AccessJwtService")
    private readonly accessJwtService: JwtService,

    @Inject("RefreshJwtService")
    private readonly refreshJwtService: JwtService
  ) {}

  public async register(body: RegisterDTO): Promise<UserDTO> {
    const user = this.em.create(User, {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: hashSync(body.password, 10)
    });

    user.login = await UserHelper.formatUserLogin(
      user.first_name,
      user.last_name,
      async (login) => {
        // Login is valid if it's not already taken
        return !(await this.em.findOne(User, { login }));
      }
    );

    await this.em.persistAndFlush(user);

    return UserDTO.from(user);
  }

  public async login(body: LoginDTO): Promise<AuthTokensDTO> {
    const user = await this.em.findOne(User, { login: body.login });

    if (!user || !bcrypt.compareSync(body.password, user.password))
      throw new UnauthorizedException("Wrong credentials. Verify and try again.");

    user.refresh_token
      ? (user.refresh_token.token = this.refreshJwtService.sign({}))
      : (user.refresh_token = this.em.create(RefreshToken, {
          token: this.refreshJwtService.sign({}),
          user
        }));

    await this.em.persistAndFlush(user.refresh_token);

    return AuthTokensDTO.from(
      this.accessJwtService.sign(user.getDefaultPayload()),
      user.refresh_token.token
    );
  }

  public async refresh(refresh_token: string, user_uuid: string): Promise<AuthTokensDTO> {
    const user = await this.em.findOne(User, { uuid: user_uuid }, { populate: ["refresh_token"] });

    if (!user || user.refresh_token?.token !== refresh_token)
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

    user.refresh_token.token = this.refreshJwtService.sign({});

    await this.em.persistAndFlush(user.refresh_token);

    return AuthTokensDTO.from(
      this.accessJwtService.sign(user.getDefaultPayload()),
      user.refresh_token.token
    );
  }
}
