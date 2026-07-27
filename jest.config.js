/**
 * Two projects, routed by file extension:
 *  - *.test.ts  → 'core': plain node environment for the pure logic in
 *    src/core and src/constants. Anything here that imports react-native
 *    fails to resolve — by design, to keep the core layer dependency-free.
 *  - *.test.tsx → 'components': @react-native/jest-preset + Testing Library.
 */
const core = {
  displayName: 'core',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  globals: { __DEV__: true },
};

const components = {
  displayName: 'components',
  preset: '@react-native/jest-preset',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.tsx'],
  // The preset pins babel-jest/jest-environment-node to Jest 29. Point both
  // at this project's Jest 30 copies so resolution is deterministic. The
  // transform override drops the preset's asset transformer — fine here,
  // this library imports no images or media.
  transform: { '^.+\\.(js|ts|tsx)$': require.resolve('babel-jest') },
  testEnvironment: 'jest-environment-node',
  testEnvironmentOptions: {
    customExportConditions: ['require', 'react-native'],
  },
  // Every chart starts an Animated.timing on mount; fake timers keep those
  // from leaking past test end. Opt out per-test with jest.useRealTimers().
  fakeTimers: { enableGlobally: true },
  // The first render in a file lazily requires (and babel-transforms) the
  // react-native internals it touches. On a cold CI cache that alone can
  // outrun the 5s default, so the first test of a suite fails while every
  // later one passes. Give it room; nothing here legitimately runs long.
  testTimeout: 30000,
};

module.exports = {
  projects: [core, components],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/types.ts',
    '!src/index.ts',
  ],
  // Enforced only when running with --coverage (npm run test:coverage / CI).
  coverageThreshold: {
    global: { statements: 92, branches: 80, functions: 95, lines: 92 },
  },
};
