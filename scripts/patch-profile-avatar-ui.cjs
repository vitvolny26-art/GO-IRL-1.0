const fs = require("fs");

const path = "src/App.tsx";
let source = fs.readFileSync(path, "utf8");

function replaceOnce(from, to) {
  if (!source.includes(from)) {
    throw new Error(`Patch marker not found:\n${from.slice(0, 160)}`);
  }
  source = source.replace(from, to);
}

replaceOnce(
  'import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";',
  'import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";',
);

replaceOnce(
  'import { ActivityChatPanel } from "./components/ActivityChatPanel";\n',
  'import { ActivityChatPanel } from "./components/ActivityChatPanel";\nimport { readProfileAvatarAsDataUrl, resolveProfileAvatarUpload } from "./profileAvatar";\n',
);

replaceOnce(
  '  const [avatarDraft, setAvatarDraft] = useState(profile.avatar);',
  '  const [avatarDraft, setAvatarDraft] = useState(profile.avatar);\n  const [avatarFileDraft, setAvatarFileDraft] = useState<File | null>(null);\n  const [profileSaving, setProfileSaving] = useState(false);\n  const [profileError, setProfileError] = useState("");',
);

replaceOnce(
`  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextProfile: LocalProfile = {
      name: String(data.get("profileName") || fallbackName).trim() || fallbackName,
      bio: String(data.get("profileBio") || "").trim(),
      cityId: String(data.get("profileCity") || selectedCityId),
      avatar: avatarDraft || String(data.get("profileAvatar") || "GI"),
      registeredAt: profile.registeredAt,
      favoriteActivities: data.getAll("favoriteActivities").map(String),
    };
    localStorage.setItem("go-irl-profile", JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setAvatarDraft(nextProfile.avatar);
    setSelectedCity(nextProfile.cityId);
    setEditing(false);
    notifyTelegram("success");
  };
`,
`  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    const data = new FormData(event.currentTarget);

    try {
      const savedAvatar = avatarFileDraft
        ? await resolveProfileAvatarUpload(avatarFileDraft)
        : avatarDraft || String(data.get("profileAvatar") || "GI");
      const nextProfile: LocalProfile = {
        name: String(data.get("profileName") || fallbackName).trim() || fallbackName,
        bio: String(data.get("profileBio") || "").trim(),
        cityId: String(data.get("profileCity") || selectedCityId),
        avatar: savedAvatar,
        registeredAt: profile.registeredAt,
        favoriteActivities: data.getAll("favoriteActivities").map(String),
      };
      localStorage.setItem("go-irl-profile", JSON.stringify(nextProfile));
      setProfile(nextProfile);
      setAvatarDraft(nextProfile.avatar);
      setAvatarFileDraft(null);
      setSelectedCity(nextProfile.cityId);
      setEditing(false);
      notifyTelegram("success");
    } catch {
      setProfileError(t.databaseError);
      notifyTelegram("error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setAvatarFileDraft(file);
    setProfileError("");

    try {
      setAvatarDraft(await readProfileAvatarAsDataUrl(file));
    } catch {
      setAvatarFileDraft(null);
      setProfileError(t.databaseError);
    }
  };
`,
);

replaceOnce(
  '        <div className="profile-avatar">{profile.avatar.startsWith("data:image/") ? <img src={profile.avatar} alt={t.avatar} /> : profile.avatar}</div>',
  '        <div className="profile-avatar">{profile.avatar.startsWith("data:image/") || profile.avatar.startsWith("http") ? <img src={profile.avatar} alt={t.avatar} /> : profile.avatar}</div>',
);

replaceOnce(
  '<input name="profileAvatar" type="radio" value={avatar} defaultChecked={profile.avatar === avatar} onChange={() => setAvatarDraft(avatar)} />',
  '<input name="profileAvatar" type="radio" value={avatar} defaultChecked={profile.avatar === avatar} onChange={() => { setAvatarDraft(avatar); setAvatarFileDraft(null); }} />',
);

replaceOnce(
  '<label><span>{t.avatar}</span><input type="file" accept="image/*" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setAvatarDraft(String(reader.result || "")); reader.readAsDataURL(file); }} /></label>',
  '<label><span>{t.avatar}</span><input type="file" accept="image/*" onChange={handleAvatarChange} disabled={profileSaving} /></label>',
);

replaceOnce(
  '<button className="publish-button" type="submit"><Pencil size={18} />{t.save}</button>',
  '{profileError && <div className="form-error">{profileError}</div>}\n          <button className="publish-button" type="submit" disabled={profileSaving}><Pencil size={18} />{profileSaving ? "…" : t.save}</button>',
);

fs.writeFileSync(path, source);
fs.rmSync(__filename);
console.log("Profile avatar UI patch applied.");
