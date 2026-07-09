const fs = require("fs");

const path = "src/App.tsx";
let text = fs.readFileSync(path, "utf8");

const replace = (from, to) => {
  if (!text.includes(from)) {
    throw new Error(`Pattern not found:\n${from}`);
  }
  text = text.replace(from, to);
};

replace(
  'import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";',
  'import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";'
);

replace(
  'import { ActivityChatPanel } from "./components/ActivityChatPanel";',
  'import { ActivityChatPanel } from "./components/ActivityChatPanel";\nimport { resolveProfileAvatarUpload } from "./profileAvatar";'
);

replace(
  '  const [avatarDraft, setAvatarDraft] = useState(profile.avatar);',
  '  const [avatarDraft, setAvatarDraft] = useState(profile.avatar);\n  const [avatarUploading, setAvatarUploading] = useState(false);\n  const [avatarError, setAvatarError] = useState("");'
);

replace(
  '  const saveProfile = (event: FormEvent<HTMLFormElement>) => {',
  '  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {\n    const file = event.currentTarget.files?.[0];\n    if (!file) return;\n\n    setAvatarUploading(true);\n    setAvatarError("");\n\n    try {\n      setAvatarDraft(await resolveProfileAvatarUpload(file));\n    } catch {\n      setAvatarError(t.publishError);\n      notifyTelegram("error");\n    } finally {\n      setAvatarUploading(false);\n    }\n  };\n\n  const saveProfile = (event: FormEvent<HTMLFormElement>) => {'
);

replace(
  '          <label><span>{t.avatar}</span><input type="file" accept="image/*" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setAvatarDraft(String(reader.result || "")); reader.readAsDataURL(file); }} /></label>\n          <button className="publish-button" type="submit"><Pencil size={18} />{t.save}</button>',
  '          <label><span>{t.avatar}</span><input type="file" accept="image/*" onChange={handleAvatarFileChange} disabled={avatarUploading} /></label>\n          {avatarError && <div className="form-error">{avatarError}</div>}\n          <button className="publish-button" type="submit" disabled={avatarUploading}><Pencil size={18} />{avatarUploading ? "…" : t.save}</button>'
);

fs.writeFileSync(path, text);
