import { EntityManager } from "@mikro-orm/mysql";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import bcrypt, { hashSync } from "bcrypt";
import { TokenHelper } from "../common/helpers/token.helper";
import { UserHelper } from "../common/helpers/user.helper";
import { NodeMailerService } from "../common/providers/node-mailer.provider";
import { NodeMailerTemplate } from "../common/templates/node-mailer.template";
import { UserDTO } from "../users/dto/outbound/user.dto";
import { User } from "../users/entities/user.entity";
import { ChangePasswordDTO } from "./dto/inbound/change-password.dto";
import { LoginDTO } from "./dto/inbound/login.dto";
import { RegisterDTO } from "./dto/inbound/register.dto";
import { AuthTokensDTO } from "./dto/outbound/auth-tokens.dto";
import { RefreshToken } from "./entities/refresh_token.entity";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(NodeMailerService.name);

  public constructor(
    private readonly em: EntityManager,
    private readonly nodeMailerService: NodeMailerService,

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

    const login = await UserHelper.formatUserLogin(
      user.first_name,
      user.last_name,
      async (login) => {
        // Login is valid if it's not already taken
        return !(await this.em.findOne(User, { login }));
      }
    );

    user.login = login;

    await this.em.persistAndFlush(user);

    return UserDTO.from(user);
  }

  public async login(body: LoginDTO): Promise<AuthTokensDTO> {
    const user = await this.em.findOne(User, { login: body.login });

    if (!user || !bcrypt.compareSync(body.password, user.password))
      throw new UnauthorizedException("Wrong credentials. Verify and try again.");

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

  public async changePassword(user_uuid: string, body: ChangePasswordDTO): Promise<boolean> {
    const user = await this.em.findOneOrFail(User, { uuid: user_uuid });

    if (!bcrypt.compareSync(body.old_password, user.password))
      throw new BadRequestException("Your old password is wrong. Verify and try again.");

    user.password = hashSync(body.new_password, 10);

    await this.em.persistAndFlush(user);

    return true;
  }

  public async sendResetPasswordRequest(to: string): Promise<boolean> {
    const params: Record<string, unknown> = {
      PRIVATE_TOKEN: TokenHelper.generateForEmails()
    };

    await this.nodeMailerService.sendMail(to, NodeMailerTemplate.RESET_PASSWORD_REQUEST, params);

    this.logger.log(
      `A reset password request was sent to ${to} with the following parameters: ${JSON.stringify(params)}`
    );

    return true;
  }
}
