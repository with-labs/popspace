export const mockDocument = {
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  create: jest.fn(),
  on: jest.fn(),
};

export const mockConnection = {
  get: jest.fn().mockImplementation(() => mockDocument),
  close: jest.fn(),
};

const Connection = jest.fn().mockImplementation(() => mockConnection);

const mockTypes = {
  register: jest.fn(),
};

export default {
  Connection,
  types: mockTypes,
};
