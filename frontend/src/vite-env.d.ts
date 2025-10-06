/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_HOST: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
