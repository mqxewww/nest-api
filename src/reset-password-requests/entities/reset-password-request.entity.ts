import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "reset_password_requests" })
export class ResetPasswordRequest {
  @PrimaryKey({ autoincrement: true })
  public id: number;

  @Property()
  public email: string;

  @Property()
  public secret_token: string;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP" })
  public secret_token_generated_at: Date;

  @Property({ nullable: true })
  public verification_key?: string;

  @Property({ type: "datetime", nullable: true })
  public verification_key_generated_at?: Date;

  public constructor(values: Partial<ResetPasswordRequest>) {
    Object.assign(this, values);
  }
}
