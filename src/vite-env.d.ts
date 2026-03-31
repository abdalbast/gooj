/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_WEB_VITALS_DEBUG?: string;
  readonly VITE_WEB_VITALS_ENABLED?: string;
  readonly VITE_WEB_VITALS_ENDPOINT?: string;
  readonly VITE_WEB_VITALS_RELEASE_ID?: string;
  readonly VITE_WEB_VITALS_SAMPLE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_BUILD_ID__: string;
declare const __APP_BUILT_AT__: string;
