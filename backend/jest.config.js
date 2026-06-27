/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/env.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          // Tests are not bound by the strict app tsconfig include/exclude.
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          strict: false,
        },
      },
    ],
  },
};
