declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: string;
      DATABASE_HOST: string;
      DATABASE_PORT: string;
      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      TOKEN_EXPIRES_IN: string;
    }
  }
}

export {};
