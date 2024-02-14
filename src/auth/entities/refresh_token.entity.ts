import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { IdAndDates } from "../../common/entities/id-and-dates.entity";
import { User } from "../../users/entities/user.entity";

@Entity({ tableName: "refresh_tokens" })
export class RefreshToken extends IdAndDates {
  @Property({ type: "text" })
  public token: string;

  @OneToOne(() => User, (user) => user.refresh_token, { nullable: true, unique: true, owner: true })
  public user?: User;

  public constructor(values: Partial<RefreshToken>) {
    super();
    Object.assign(this, values);
  }
}
