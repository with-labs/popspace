module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|svg|eot|ttf|otf|webp|woff|woff2|mp4|css|less)$': '<rootDir>/src/__mocks__/fileMock.ts',
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@features(.*)$': '<rootDir>/src/features$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@providers(.*)$': '<rootDir>/src/providers$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@roomState(.*)$': '<rootDir>/src/roomState$1',
    '^@constants(.*)$': '<rootDir>/src/constants$1',
    '^@analytics(.*)$': '<rootDir>/src/analytics$1',
    '^@layouts(.*)$': '<rootDir>/src/Layouts$1',
    '^@images(.*)$': '<rootDir>/src/images$1',
    '^@api(.*)$': '<rootDir>/src/api/$1',
    '^@src(.*)$': '<rootDir>/src$1',
  },
  snapshotSerializers: [],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  reporters: ['default', 'jest-junit'],
  // commonsense option to reset mocks between test runs so no
  // mock invocations carry over
  clearMocks: true,
};
