import { Entity, OneToOne } from "@mikro-orm/core";
import { UuidAndDates } from "../../common/entities/uuid-and-dates.entity";
import { User } from "../../users/entities/user.entity";

@Entity({ tableName: "avatars" })
export class Avatar extends UuidAndDates {
  @OneToOne(() => User, (user) => user.avatar, { nullable: true, unique: true, owner: true })
  public user?: User;

  public constructor(values: Partial<User>) {
    super();
    Object.assign(this, values);
  }
}
