import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ abstract: true })
export abstract class UuidAndDates {
  @PrimaryKey()
  public id: number;

  @Property({ length: 36, defaultRaw: "(UUID())" })
  public uuid: string;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP" })
  public created_at: Date;

  @Property({ defaultRaw: "CURRENT_TIMESTAMP", onUpdate: () => new Date() })
  public updated_at: Date;
}
