interface EnvConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppConfig extends EnvConfig {
  backend: 'agent-platform' | 'google-ai';
  appcheckSiteKey: string;
  appcheckDebug: boolean;
  cloudModel: string;
  targetLanguage: string;
}

export function loadConfig(): AppConfig {
  const env = import.meta.env as Record<string, string | undefined>;
  return {
    apiKey: env['VITE_FIREBASE_API_KEY'] ?? '',
    authDomain: env['VITE_FIREBASE_AUTH_DOMAIN'] ?? '',
    projectId: env['VITE_FIREBASE_PROJECT_ID'] ?? '',
    storageBucket: env['VITE_FIREBASE_STORAGE_BUCKET'] ?? '',
    messagingSenderId: env['VITE_FIREBASE_MESSAGING_SENDER_ID'] ?? '',
    appId: env['VITE_FIREBASE_APP_ID'] ?? '',
    backend: env['VITE_AI_BACKEND'] === 'google-ai' ? 'google-ai' : 'agent-platform',
    appcheckSiteKey: env['VITE_APPCHECK_SITE_KEY'] ?? '',
    appcheckDebug: env['VITE_APPCHECK_DEBUG'] === '1',
    cloudModel: env['VITE_CLOUD_MODEL'] ?? 'gemini-2.5-flash',
    targetLanguage: env['VITE_TARGET_LANGUAGE'] ?? 'English',
  };
}

/** True when every Firebase config value is present. */
export function isConfigured(config: AppConfig): boolean {
  const required: (keyof EnvConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return required.every((key) => config[key].length > 0);
}
