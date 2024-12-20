import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "~common/entities/base.entity";
import { User } from "~routes/users/entities/user.entity";

@Entity({ abstract: true })
export abstract class IsolatedResetPasswordRequest extends BaseEntity<"verification_code_generated_at"> {
  @Property()
  public verification_code!: string;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP" })
  public verification_code_generated_at!: Date;

  @Property({ nullable: true })
  public update_key?: string;

  @Property({ type: "datetime", nullable: true })
  public update_key_generated_at?: Date;
}

@Entity({ tableName: "reset_password_requests" })
export class ResetPasswordRequest extends IsolatedResetPasswordRequest {
  @OneToOne(() => User, (user) => user.reset_password_request, {
    unique: true,
    owner: true
  })
  public user!: User;
}
