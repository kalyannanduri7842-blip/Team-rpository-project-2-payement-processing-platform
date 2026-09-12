module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/packages', '<rootDir>/apps'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  moduleNameMapper: {
    '^@payment-system/shared-types$': '<rootDir>/packages/shared-types/src',
    '^@payment-system/shared-config$': '<rootDir>/packages/shared-config/src',
    '^@payment-system/shared-utils$': '<rootDir>/packages/shared-utils/src',
    '^@payment-system/database$': '<rootDir>/packages/database/src'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  verbose: true,
  testTimeout: 10000
};
