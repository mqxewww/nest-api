declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: string;
    }
  }
}

export {};
