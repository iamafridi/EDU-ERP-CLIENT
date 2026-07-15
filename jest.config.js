/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['**/*.test.{ts,tsx}'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    transformIgnorePatterns: ['node_modules/(?!(jose|firebase|firebase-admin)/)'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss)$': '<rootDir>/tests/__mocks__/styleMock.js',
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    setupFiles: [],
};
