export const mockInstance = {
  setContents: jest.fn(),
  history: {
    clear: jest.fn()
  },
  on: jest.fn(),
  updateContents: jest.fn(),
  submitOp: jest.fn(),
};
const Quill = jest.fn().mockImplementation(() => mockInstance);

export default Quill;
