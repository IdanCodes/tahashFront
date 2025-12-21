/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PATH: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
