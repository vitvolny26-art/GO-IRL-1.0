const fs = require("fs");

let supabase = fs.readFileSync("src/supabase.ts", "utf8");
supabase = supabase.replace(
  'if (!url || !publishableKey) {\n  throw new Error("Supabase environment variables are missing");\n}',
  'if ((!url || !publishableKey) && !isLegacyDemoAuthEnabled()) {\n  throw new Error("Supabase environment variables are missing");\n}\n\nconst resolvedSupabaseUrl = url || "http://127.0.0.1:54321";\nconst resolvedPublishableKey = publishableKey || "demo-browser-mock-key";'
);
supabase = supabase.replace(
  'export const supabase = createClient(url, publishableKey, {',
  'export const supabase = createClient(resolvedSupabaseUrl, resolvedPublishableKey, {'
);
fs.writeFileSync("src/supabase.ts", supabase);

let store = fs.readFileSync("src/store.ts", "utf8");
store = store.replace(
  'if (!realtimeChannel && !(typeof document !== "undefined" && document.hidden)) {',
  'if (!isVisualDemoMode() && !realtimeChannel && !(typeof document !== "undefined" && document.hidden)) {'
);
fs.writeFileSync("src/store.ts", store);
