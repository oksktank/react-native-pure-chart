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
// USE_NPM_PKG=1 skips the source alias so the app runs against the published
// package in example/node_modules instead (release smoke testing):
//   USE_NPM_PKG=1 npx expo start --clear
// app.config.js also turns off tsconfig-paths aliasing for that flag — both
// layers must be off or the ../src mapping silently wins over node_modules.
const useNpmPkg = process.env.USE_NPM_PKG === '1';
config.resolver.extraNodeModules = {
  ...(useNpmPkg ? {} : { 'react-native-pure-chart': path.join(root, 'src') }),
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
