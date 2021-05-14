export const generateThumbnail = jest.fn((buffer: Buffer) =>
  Promise.resolve(buffer),
);
export const extractDominantColor = jest.fn().mockResolvedValue('rgb(0, 0, 0)');
