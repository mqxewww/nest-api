import { Entity, Property } from "@mikro-orm/core";
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

  public constructor(values: Partial<User>) {
    super();
    Object.assign(this, values);
  }
}
