import { EntityManager, UniqueConstraintViolationException } from "@mikro-orm/mysql";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiError } from "~common/constants/api-errors.constant";
import { UserHelper } from "~common/helpers/user.helper";
import { Bcrypt } from "~common/providers/bcrypt.provider";
import { LoginDTO } from "~routes/auth/dto/inbound/login.dto";
import { RegisterDTO } from "~routes/auth/dto/inbound/register.dto";
import { AuthTokensDTO } from "~routes/auth/dto/outbound/auth-tokens.dto";
import { NewRegisteredUserDTO } from "~routes/auth/dto/outbound/new-registered-user.dto";
import { RefreshToken } from "~routes/auth/entities/refresh_token.entity";
import { User } from "~routes/users/entities/user.entity";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public constructor(
    private readonly em: EntityManager,

    @Inject("accessJwt")
    private readonly accessJwtProvider: JwtService,

    @Inject("refreshJwt")
    private readonly refreshJwtProvider: JwtService,

    @Inject("bcrypt")
    private readonly bcryptProvider: Bcrypt
  ) {}

  public async register(body: RegisterDTO): Promise<NewRegisteredUserDTO> {
    const user = this.em.create(User, {
      first_name: UserHelper.capitalizeFirstname(body.first_name.trim()),
      last_name: body.last_name.trim().toUpperCase(),
      email: body.email.trim(),
      password: this.bcryptProvider.hashSync(body.password.trim(), 10)
    });

    user.login = await UserHelper.formatUserLogin(
      user.first_name,
      user.last_name,
      async (login) => {
        // Login is valid if it's not already taken
        return !(await this.em.findOne(User, { login }));
      }
    );

    try {
      await this.em.persistAndFlush(user);
    } catch (error: unknown) {
      this.logger.debug(error);

      if (
        error instanceof UniqueConstraintViolationException &&
        error.sqlMessage?.includes("email")
      )
        throw new BadRequestException(ApiError.EMAIL_ALREADY_IN_USE);

      throw error;
    }

    user.refresh_token = this.em.create(RefreshToken, {
      token: this.refreshJwtProvider.sign({}),
      user
    });

    await this.em.persistAndFlush(user.refresh_token);

    return NewRegisteredUserDTO.build(
      user as User & { refresh_token: RefreshToken },
      this.accessJwtProvider.sign(UserHelper.getAccessTokenPayload(user))
    );
  }

  public async login(body: LoginDTO): Promise<AuthTokensDTO> {
    const user = await this.em.findOne(User, { login: body.login });

    if (!user || !this.bcryptProvider.compareSync(body.password.trim(), user.password))
      throw new UnauthorizedException(ApiError.INVALID_CREDENTIALS);

    user.refresh_token
      ? (user.refresh_token.token = this.refreshJwtProvider.sign({}))
      : (user.refresh_token = this.em.create(RefreshToken, {
          token: this.refreshJwtProvider.sign({}),
          user
        }));

    await this.em.persistAndFlush(user.refresh_token);

    return AuthTokensDTO.build(
      user.refresh_token,
      this.accessJwtProvider.sign(UserHelper.getAccessTokenPayload(user))
    );
  }

  public async refresh(refresh_token: string, user_uuid: string): Promise<AuthTokensDTO> {
    const user = await this.em.findOneOrFail(
      User,
      { uuid: user_uuid },
      { populate: ["refresh_token"] }
    );

    if (user.refresh_token?.token !== refresh_token)
      throw new BadRequestException(ApiError.NON_MATCHING_TOKEN);

    try {
      await this.refreshJwtProvider.verifyAsync(user.refresh_token.token);
    } catch (error: unknown) {
      this.logger.debug(error);

      throw new UnauthorizedException(ApiError.INVALID_TOKEN);
    }

    user.refresh_token.token = this.refreshJwtProvider.sign({});

    await this.em.persistAndFlush(user.refresh_token);

    return AuthTokensDTO.build(
      user.refresh_token,
      this.accessJwtProvider.sign(UserHelper.getAccessTokenPayload(user))
    );
  }
}
