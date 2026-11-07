const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const webRoot = path.resolve(__dirname, "..");

// Shared code (API types, generation rules) and message catalogs come from the web app next door.
config.watchFolders = [path.join(webRoot, "src"), path.join(webRoot, "messages")];

// Shared files must stay dependency-free: packages always resolve from mobile/node_modules,
// never from the web app's (different React version).
config.resolver.nodeModulesPaths = [path.join(__dirname, "node_modules")];
config.resolver.blockList = [new RegExp(`^${escape(path.join(webRoot, "node_modules"))}/.*`)];

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = config;
