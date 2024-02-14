import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ abstract: true })
export abstract class IdAndDates {
  @PrimaryKey({ autoincrement: true })
  public id: number;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP" })
  public created_at: Date;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP", onUpdate: () => new Date() })
  public updated_at: Date;
}
