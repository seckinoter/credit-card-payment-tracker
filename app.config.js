import 'dotenv/config';

export default {
  expo: {
    name: 'Credit Card Payment Tracker',
    slug: 'credit-card-payment-tracker',
    privacy: 'public',
    platforms: ['ios'],
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/credit-card-tracker_whitebg_512.png',
    splash: {
      image: './assets/credit-card-tracker-splash.png',
      resizeMode: 'cover',
      backgroundColor: '#F57C00'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.seckinoter.credit-card-tracker"
    },
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID
    },
    plugins: ["sentry-expo"],
    hooks: {
      postPublish: [
        {
          file: "sentry-expo/upload-sourcemaps",
          config: {
            organization: "seckin-oter",
            project: "creditcardpaymenttracker",
            authToken: process.env.CONFIG_AUTH_TOKEN
          }
        }
      ]
    }
  }
};
