import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.coinquest.app',
  appName: 'CoinQuest',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    backgroundColor: '#ffffff',
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
  },
}

export default config
