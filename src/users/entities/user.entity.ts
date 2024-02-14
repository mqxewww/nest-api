import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { RefreshToken } from "../../auth/entities/refresh_token.entity";
import { Avatar } from "../../avatars/entities/avatar.entity";
import { UuidAndDates } from "../../common/entities/uuid-and-dates.entity";

@Entity({ tableName: "users" })
export class User extends UuidAndDates {
  @Property()
  public first_name: string;

  @Property()
  public last_name: string;

  @Property({ unique: true })
  public login: string;

  @Property()
  public password: string;

  @OneToOne(() => Avatar, (avatar) => avatar.user, { nullable: true })
  public avatar?: Avatar;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user, { nullable: true })
  public refresh_token?: RefreshToken;

  public constructor(values: Partial<User>) {
    super();
    Object.assign(this, values);
  }
}
