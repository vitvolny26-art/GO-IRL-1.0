const fs = require("fs");

const authPath = "src/authSession.ts";
let auth = fs.readFileSync(authPath, "utf8");

auth = auth.replace(
  'const legacyDemoAuthEnabled = import.meta.env.DEV || import.meta.env.VITE_GO_IRL_LEGACY_DEMO_AUTH === "true";',
  'const configuredDemoAuthEnabled = import.meta.env.DEV || import.meta.env.VITE_GO_IRL_LEGACY_DEMO_AUTH === "true";\nconst isBrowserMockAuthEnabled = () => typeof window !== "undefined" && !getTelegramInitData();\nconst isDemoAuthEnabled = () => configuredDemoAuthEnabled || isBrowserMockAuthEnabled();'
);

auth = auth.replace(
  "if (!legacyDemoAuthEnabled) return null;",
  "if (!isDemoAuthEnabled()) return null;"
);

auth = auth.replace(
  "telegramId: getTelegramWebApp()?.initDataUnsafe?.user?.id,",
  "telegramId: getTelegramWebApp()?.initDataUnsafe?.user?.id || (isBrowserMockAuthEnabled() ? 999999 : undefined),"
);

auth = auth.replace(
  'const telegramUser = legacyDemoAuthEnabled ? getTelegramWebApp()?.initDataUnsafe?.user : null;\n  return [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(" ") || fallback;',
  'const telegramUser = isDemoAuthEnabled() ? getTelegramWebApp()?.initDataUnsafe?.user : null;\n  return [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(" ") || (isBrowserMockAuthEnabled() ? "Vit_Test" : fallback);'
);

auth = auth.replace(
  "return legacyDemoAuthEnabled;",
  "return isDemoAuthEnabled();"
);

fs.writeFileSync(authPath, auth);

const storePath = "src/store.ts";
let store = fs.readFileSync(storePath, "utf8");

store = store.replace(
  "initializeTrustedAuth,\n  isTrustedAuthReady } from \"./authSession\";",
  "initializeTrustedAuth,\n  isLegacyDemoAuthEnabled,\n  isTrustedAuthReady } from \"./authSession\";"
);

store = store.replace(
  'const isVisualDemoMode = () =>\n  typeof window !== "undefined" &&\n  /^(localhost|127\\.0\\.0\\.1)$/.test(window.location.hostname) &&\n  !isTrustedAuthReady();',
  'const isVisualDemoMode = () =>\n  typeof window !== "undefined" &&\n  isLegacyDemoAuthEnabled() &&\n  !isTrustedAuthReady();'
);

fs.writeFileSync(storePath, store);
