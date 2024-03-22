export class EntitiesAndCountDTO<T> {
  public constructor(
    public readonly entities: T[],
    public readonly count: number
  ) {}

  /**
   * @param count - Count corresponds to the number of entities in the db according to the search filters, excluding the limit.
   */
  public static build<T>(entities: T[], count: number): EntitiesAndCountDTO<T> {
    return new EntitiesAndCountDTO(entities, count);
  }
}
