export const ENV = {
  NODE_ENV: import.meta.env.MODE,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_DEBUG: import.meta.env.VITE_DEBUG === 'true',
  IS_LOCAL: import.meta.env.VITE_APP_ENV === 'local',
  IS_PROD: import.meta.env.VITE_APP_ENV === 'production',
  IS_DEV: import.meta.env.VITE_APP_ENV === 'development',
};

export const logger = {
  log: (...args) => {
    if (ENV.VITE_DEBUG) {
      console.log(...args);
    }
  },
  error: (...args) => {
    console.error(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
};
