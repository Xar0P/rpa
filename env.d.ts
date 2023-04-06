export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PROFILE: string;
      ML_LOGIN: string;
      ML_PASS: string;
      ALX_LOGIN: string;
      ALX_PASS: string;
      ALBB_LOGIN: string;
      ALBB_PASS: string;
      ALBB_TOTP: string;
    }
  }
}
