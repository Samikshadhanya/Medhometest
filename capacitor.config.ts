import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medhome.app',
  appName: 'MedHome',
  server: {
    url: 'https://medhome-81dq.vercel.app',
    cleartext: true
  }
};

export default config;