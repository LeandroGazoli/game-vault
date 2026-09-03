import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gamevault.app",
  appName: "GameVault",
  webDir: "public",
  server: {
    // Aponta para o ambiente de produção por padrão, ou para o IP local (ex: http://192.168.0.x:3000)
    // ao rodar em desenvolvimento via variável de ambiente CAPACITOR_SERVER_URL
    url: process.env.CAPACITOR_SERVER_URL || "https://www.mygameslist.com.br",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#0b0d11",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b0d11",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    backgroundColor: "#0b0d11",
  },
  android: {
    backgroundColor: "#0b0d11",
    allowMixedContent: true,
  },
};

export default config;
