export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ASSEMBLYAI_API_KEY: string;
      EMAIL: string;
      PASSWORD: string;
      TRACKING_CODES: string;
    }
  }
}
