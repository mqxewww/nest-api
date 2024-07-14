import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { RefreshToken } from "~routes/auth/entities/refresh_token.entity";
import { Avatar } from "~routes/avatars/entities/avatar.entity";
import { ResetPasswordRequest } from "~routes/reset-password-requests/entities/reset-password-request.entity";

@Entity({ tableName: "users" })
export class User extends BaseEntity<"login"> {
  @Property()
  public first_name!: string;

  @Property()
  public last_name!: string;

  @Property({ unique: true })
  public email!: string;

  @Property({ unique: true })
  public login!: string;

  @Property()
  public password!: string;

  @OneToOne(() => Avatar, (avatar) => avatar.user, { nullable: true, orphanRemoval: true })
  public avatar?: Avatar;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user, {
    nullable: true,
    orphanRemoval: true
  })
  public refresh_token?: RefreshToken;

  @OneToOne(() => ResetPasswordRequest, (resetPasswordRequest) => resetPasswordRequest.user, {
    nullable: true,
    orphanRemoval: true
  })
  public reset_password_request?: ResetPasswordRequest;
}
