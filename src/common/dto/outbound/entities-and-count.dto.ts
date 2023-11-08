export class EntitiesAndCount<T> {
  public readonly count: number;
  public readonly entities: T[];

  public static from<T>(entities: T[], count: number): EntitiesAndCount<T> {
    return { count, entities };
  }
}
