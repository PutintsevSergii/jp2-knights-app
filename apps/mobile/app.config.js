const iosBundleIdentifier = readEnvString("EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER");
const androidPackage = readEnvString("EXPO_PUBLIC_ANDROID_PACKAGE");

export default ({ config }) => ({
  ...config,
  scheme: readEnvString("EXPO_PUBLIC_APP_SCHEME") ?? config.scheme,
  ios: {
    ...config.ios,
    ...(iosBundleIdentifier ? { bundleIdentifier: iosBundleIdentifier } : {})
  },
  android: {
    ...config.android,
    ...(androidPackage ? { package: androidPackage } : {})
  }
});

function readEnvString(key) {
  const value = process.env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}
