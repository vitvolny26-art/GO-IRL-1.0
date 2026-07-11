/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_GO_IRL_LEGACY_DEMO_AUTH?: string;
  readonly VITE_GO_IRL_BOT_USERNAME?: string;
  readonly VITE_GO_IRL_APP_NAME?: string;
  readonly VITE_GO_IRL_ADMIN_KEYS?: string;
  readonly VITE_GIT_COMMIT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __GO_IRL_COMMIT__: string;
declare const __GO_IRL_BUILT_AT__: string;
