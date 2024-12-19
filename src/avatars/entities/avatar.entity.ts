import { Entity, OneToOne } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { User } from "~routes/users/entities/user.entity";

@Entity({ tableName: "avatars" })
export class Avatar extends BaseEntity {
  @OneToOne(() => User, (user) => user.avatar, { unique: true, owner: true })
  public user!: User;
}
