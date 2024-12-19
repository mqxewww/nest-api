export class EntityManagerMock {
  public find = jest.fn();
  public findOne = jest.fn();
  public findOneOrFail = jest.fn();
  public create = jest.fn();
  public count = jest.fn();
  public persistAndFlush = jest.fn();
  public removeAndFlush = jest.fn();
}
