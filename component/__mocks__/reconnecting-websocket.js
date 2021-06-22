export const mockInstance = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn()
}

const ReconnectingWebsocket = jest.fn().mockImplementation(() => mockInstance);

export default ReconnectingWebsocket;
