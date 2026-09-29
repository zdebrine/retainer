import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json with plugins that depend on environment variables.
 * Google Sign-In is only added once its iOS client ID is configured, because the plugin
 * fails the build without one.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? [])];

  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (iosClientId) {
    // com.googleusercontent.apps.<id> is the iOS client ID reversed.
    const iosUrlScheme = `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`;
    plugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme }]);
  }

  return {
    ...config,
    name: config.name ?? 'Retainer',
    slug: config.slug ?? 'retainer-people',
    plugins,
  };
};
