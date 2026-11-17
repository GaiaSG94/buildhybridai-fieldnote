import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import { getAI, AgentPlatformBackend, GoogleAIBackend, type AI } from 'firebase/ai';
import { isConfigured, loadConfig, type AppConfig } from './config';

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

export interface FirebaseBundle {
  app: FirebaseApp;
  appCheck?: AppCheck;
  ai: AI;
}

/** Initialize Firebase, App Check and Firebase AI Logic. */
export function initFirebase(config: AppConfig = loadConfig()): FirebaseBundle | null {
  if (!isConfigured(config)) {
    return null;
  }
  const app = initializeApp(config);
  const appCheck = initAppCheck(app, config);
  const backend = config.backend === 'google-ai'
    ? new GoogleAIBackend()
    : new AgentPlatformBackend('global');
  const ai = getAI(app, { backend });
  return { app, appCheck, ai };
}

const initAppCheck = (app: FirebaseApp, config: AppConfig): AppCheck | undefined => {
  if (config.appcheckDebug) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  if (!config.appcheckSiteKey) {
    return undefined;
  }
  return initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(config.appcheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
};
