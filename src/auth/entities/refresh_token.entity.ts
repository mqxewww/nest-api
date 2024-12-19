import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { User } from "~routes/users/entities/user.entity";

@Entity({ tableName: "refresh_tokens" })
export class RefreshToken extends BaseEntity {
  @Property({ type: "text" })
  public token!: string;

  @OneToOne(() => User, (user) => user.refresh_token, { unique: true, owner: true })
  public user!: User;
}
