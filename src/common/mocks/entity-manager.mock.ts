export const EntityManagerMock = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  persistAndFlush: jest.fn(),
  removeAndFlush: jest.fn()
};
