/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    setupFiles: ['<rootDir>/tests/setup-env.ts'],
    clearMocks: true,
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['@swc/jest'],
    },
};
