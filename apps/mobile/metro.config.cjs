const fs = require("node:fs");
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { resolve } = require("metro-resolver");

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const tsResolution = resolveTypescriptSourceSpecifier(context, moduleName);

  if (tsResolution) {
    return tsResolution;
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return resolve({ ...context, resolveRequest: null }, moduleName, platform);
};

function resolveTypescriptSourceSpecifier(context, moduleName) {
  if (!moduleName.endsWith(".js") || !isRelativeSpecifier(moduleName)) {
    return null;
  }

  const originDir = path.dirname(context.originModulePath);
  const requestedPath = path.resolve(originDir, moduleName);
  const withoutJsExtension = requestedPath.slice(0, -".js".length);
  const candidates = [
    `${withoutJsExtension}.ts`,
    `${withoutJsExtension}.tsx`,
    path.join(withoutJsExtension, "index.ts"),
    path.join(withoutJsExtension, "index.tsx")
  ];
  const filePath = candidates.find((candidate) => fs.existsSync(candidate));

  return filePath ? { type: "sourceFile", filePath } : null;
}

function isRelativeSpecifier(moduleName) {
  return moduleName.startsWith("./") || moduleName.startsWith("../");
}

module.exports = config;
