const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Only use local node_modules to prevent version conflicts
config.resolver.nodeModulesPaths = [
    require('path').resolve(projectRoot, 'node_modules'),
];

module.exports = config;

