const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Node and Metro use the physical checkout path. Xcode canonicalizes its
// PROJECT_ROOT and ENTRY_FILE in the bundle phase to match this path.
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch only the directories that Metro actually needs to resolve modules
// from. Watching the whole monorepoRoot pulls in `.local/`, where the agent
// runtime creates and deletes ephemeral `.tmp-*` files; the FallbackWatcher
// crashes with ENOENT when one of those files vanishes between the readdir
// and the watch() call.
config.watchFolders = [
  path.resolve(monorepoRoot, "node_modules"),
  path.resolve(monorepoRoot, "artifacts"),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Belt-and-braces: also block the agent skills tmp churn from resolution.
config.resolver.blockList = [
  /[/\\]\.local[/\\].*/,
];

// Stub shaka-player on web — react-native-track-player's web fallback
// references it inside a dynamic import, but we never reach that code path
// (we early-return when Platform.OS === "web"). Without the stub the metro
// web bundler still tries to resolve it and fails the entire bundle.
const emptyModule = path.resolve(projectRoot, "stubs/empty.js");
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName.startsWith("shaka-player")) {
    return { type: "sourceFile", filePath: emptyModule };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
