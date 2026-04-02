import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'developers.iamsupreme.safecircle.tracker',
  appName: 'safe-circle-tracker',
  webDir: 'out',

  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
};

export default config;
