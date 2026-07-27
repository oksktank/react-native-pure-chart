// Used by jest (babel-jest) only. react-native-builder-bob uses its own
// preset with configFile: false, so this does not affect build output.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
};
