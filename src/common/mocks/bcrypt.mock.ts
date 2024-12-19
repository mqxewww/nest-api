export class BcryptMock {
  public hashSync = jest.fn();
  public compareSync = jest.fn();
}
