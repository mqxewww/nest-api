declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: number;
      DATABASE_HOST: string;
      DATABASE_PORT: number;
      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      ACCESS_TOKEN_EXPIRES_IN: string;
      REFRESH_TOKEN_EXPIRES_IN: string;
      NODEMAILER_USER: string;
      NODEMAILER_PASS: string;
      PINO_PRETTY: boolean;
    }
  }
}

export {};
