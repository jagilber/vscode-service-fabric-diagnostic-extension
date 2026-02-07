module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testMatch: [
        '**/__tests__/**/*.ts',
        '**/?(*.)+(spec|test).ts'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/test/integration/' // Integration tests require live cluster — run via npm run test:integration
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/sdk/**', // Exclude generated SDK code
        '!src/extension.ts', // Test separately with integration tests
        '!src/fileExplorer.ts', // Legacy demo file with pre-existing build errors
        '!src/ftpExplorer.ts', // Legacy demo file with pre-existing build errors
        '!src/jsftp.d.ts', // Type declaration
        '!src/treeview/**', // New treeview nodes behind feature flag, not active yet
        '!src/types/**', // Type definitions
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 75,
            lines: 80,
            statements: 80
        }
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                isolatedModules: true
            }
        }]
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    testTimeout: 30000,
    verbose: true
};
