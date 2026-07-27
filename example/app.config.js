// Wraps app.json so USE_NPM_PKG=1 can disable Expo's tsconfig-paths aliasing
// at runtime. tsconfig `paths` maps react-native-pure-chart → ../src for live
// development; that mapping beats node_modules resolution, so it must be off
// when smoke-testing the published package (see metro.config.js).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    tsconfigPaths: process.env.USE_NPM_PKG !== '1',
  },
});
