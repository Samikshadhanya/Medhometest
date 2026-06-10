import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medhome.app',
  appName: 'MedHome',
  webDir: 'out',
  server: {
    // Remove remote URL to use local static files for offline capability
    // url: 'https://medhome-81dq.vercel.app',
    cleartext: true,
    // Allow navigation to external domains if needed
    allowNavigation: ['*']
  },
  android: {
    // Enable logging for debugging
    loggingBehavior: 'debug'
  },
  plugins: {
    // Configure Capacitor plugins
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#f8fafc',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      splashFullScreen: false,
      splashImmersive: false
    }
  }
};

export default config;