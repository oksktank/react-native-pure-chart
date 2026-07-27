const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const root = path.resolve(__dirname, '..');
const config = getDefaultConfig(__dirname);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Watch the library source so edits reload instantly.
config.watchFolders = [root];

// Resolve the library name straight to its TypeScript source, and make sure
// react/react-native always come from the example app (a second React copy
// in the root's devDependencies would break hooks).
config.resolver.extraNodeModules = {
  'react-native-pure-chart': path.join(root, 'src'),
  react: path.join(__dirname, 'node_modules', 'react'),
  'react-native': path.join(__dirname, 'node_modules', 'react-native'),
};
config.resolver.blockList = [
  new RegExp(`^${escapeRegExp(path.join(root, 'node_modules', 'react'))}/.*$`),
  new RegExp(
    `^${escapeRegExp(path.join(root, 'node_modules', 'react-native'))}/.*$`
  ),
];

module.exports = config;
