/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    setupFiles: ['<rootDir>/tests/setup-env.ts'],
    clearMocks: true,
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    },
};
