export class CustomJwtMock {
  public sign = jest.fn();
  public verifyAsync = jest.fn();
  public decode = jest.fn();
}
