const fs = require("node:fs");

const path = "src/App.tsx";
let source = fs.readFileSync(path, "utf8");

const replaceOnce = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`PLAN1147 anchor missing: ${label}`);
  source = source.replace(from, to);
};

replaceOnce(
  'import { getCurrentStartParam, initializeTrustedAuth } from "./authSession";',
  'import { getCurrentAuthIdentity, getCurrentStartParam, initializeTrustedAuth } from "./authSession";',
  "auth import",
);
replaceOnce(
  'import { getUserKey } from "./supabase";',
  'import { getUserKey, supabase } from "./supabase";',
  "supabase import",
);
replaceOnce(
  'import { readProfileAvatarAsDataUrl } from "./profileAvatar";\n',
  "",
  "legacy avatar import",
);
replaceOnce(
  'import { isTemplateCarouselDrag } from "./templateCarousel";',
  'import { isTemplateCarouselDrag } from "./templateCarousel";\nimport { createProfileRepository, type ProfileRepository } from "./profile/profileRepository";\nimport type { UserProfile, UserProfileDraft } from "./profile/profileTypes";',
  "profile repository imports",
);

const functionStart = source.indexOf("function ProfileView(");
const functionEnd = source.indexOf("\nfunction ProfileEventGroup(", functionStart);
if (functionStart < 0 || functionEnd < 0) throw new Error("PLAN1147 ProfileView block not found");

const replacement = `type ProfileViewState = {
  name: string;
  bio: string;
  cityId: string;
  avatar: string;
  avatarPath: string | null;
  avatarCode: string | null;
  registeredAt: string;
  favoriteActivities: string[];
  isPublic: boolean;
  showFavorites: boolean;
};

const createFallbackProfileViewState = (name: string, cityId: string): ProfileViewState => ({
  name,
  bio: "",
  cityId,
  avatar: "GI",
  avatarPath: null,
  avatarCode: "GI",
  registeredAt: new Date().toISOString(),
  favoriteActivities: [],
  isPublic: true,
  showFavorites: true,
});

const mapProfileViewState = (profile: UserProfile, avatar: string): ProfileViewState => ({
  name: profile.displayName,
  bio: profile.bio,
  cityId: profile.cityId,
  avatar: avatar || profile.avatarCode || "GI",
  avatarPath: profile.avatarPath,
  avatarCode: profile.avatarCode,
  registeredAt: profile.createdAt,
  favoriteActivities: profile.favoriteActivityIds,
  isPublic: profile.isPublic,
  showFavorites: profile.showFavorites,
});

const isProfileAvatarImage = (value: string) => value.startsWith("data:image/") || /^https?:\\/\\//.test(value);

function ProfileView({ language, onOpen, onJoin, onCloseMiniApp }: { language: Language; onOpen: OpenActivity; onJoin: (activity: Activity) => void; onCloseMiniApp: () => void }) {
  const { activities, joinedIds, pendingIds, loading, syncError, selectedCityId, setSelectedCity } = useAppStore();
  const [editing, setEditing] = useState(false);
  const t = getTranslation(language);
  const tgUser = getTelegramWebApp()?.initDataUnsafe?.user;
  const fallbackName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" ") || t.guestName;
  const identity = getCurrentAuthIdentity();
  const identityKey = identity?.source === "trusted-telegram" ? identity.user.userKey : getUserKey();
  const repository = useMemo<ProfileRepository>(() => createProfileRepository({
    identity,
    supabaseClient: supabase,
    storage: localStorage,
    fallbackDisplayName: fallbackName,
    fallbackCityId: selectedCityId,
  }), [fallbackName, identityKey, selectedCityId]);
  const [profile, setProfile] = useState<ProfileViewState>(() => createFallbackProfileViewState(fallbackName, selectedCityId));
  const [avatarDraft, setAvatarDraft] = useState(profile.avatar);
  const [avatarPathDraft, setAvatarPathDraft] = useState<string | null>(profile.avatarPath);
  const [avatarCodeDraft, setAvatarCodeDraft] = useState<string | null>(profile.avatarCode);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const userKey = getUserKey();
  const city = getCity(profile.cityId);
  const today = new Date().toISOString().slice(0, 10);
  const organized = activities.filter((item) => item.organizerKey === userKey);
  const participating = activities.filter((item) => joinedIds.includes(item.id) && item.organizerKey !== userKey);
  const pendingRequests = activities.filter((item) => pendingIds.includes(item.id));
  const activeEvents = activities.filter((item) => item.date >= today && (item.organizerKey === userKey || joinedIds.includes(item.id) || pendingIds.includes(item.id)));
  const joinedCount = activities.filter((item) => joinedIds.includes(item.id)).length;
  const registeredLabel = new Intl.DateTimeFormat(localeByLanguage[language], { day: "numeric", month: "short", year: "numeric" }).format(safeDate(profile.registeredAt));
  const favoriteOptions = favoriteActivityOptions(language);
  const selectedFavorites = favoriteOptions.filter((option) => profile.favoriteActivities.includes(option.id));
  const profileCopy = profilePolishCopy[language];

  useEffect(() => {
    let active = true;
    setProfileLoading(true);
    setProfileError(false);
    void repository.loadOwnProfile()
      .then(async (loaded) => {
        if (!active) return;
        if (!loaded) {
          const fallback = createFallbackProfileViewState(fallbackName, selectedCityId);
          setProfile(fallback);
          setAvatarDraft(fallback.avatar);
          setAvatarPathDraft(null);
          setAvatarCodeDraft("GI");
          return;
        }
        const resolvedAvatar = loaded.avatarPath
          ? await repository.resolveAvatarUrl(loaded.avatarPath)
          : loaded.avatarCode || "GI";
        if (!active) return;
        const next = mapProfileViewState(loaded, resolvedAvatar);
        setProfile(next);
        setAvatarDraft(next.avatar);
        setAvatarPathDraft(next.avatarPath);
        setAvatarCodeDraft(next.avatarCode);
      })
      .catch(() => { if (active) setProfileError(true); })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [fallbackName, repository, selectedCityId]);

  const processAvatarFile = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > maxAvatarBytes) {
      setAvatarError(profileCopy.invalid);
      return;
    }

    setAvatarError("");
    setAvatarBusy(true);
    try {
      const cropped = await openAvatarCropper(file);
      if (!cropped) return;
      const stored = await repository.uploadAvatar(cropped);
      const display = stored.startsWith("data:image/") ? stored : await repository.resolveAvatarUrl(stored);
      setAvatarDraft(display);
      setAvatarPathDraft(stored);
      setAvatarCodeDraft(null);
    } catch {
      setAvatarError(profileCopy.invalid);
    } finally {
      setAvatarBusy(false);
    }
  };

  const selectAvatarCode = (avatar: string) => {
    setAvatarDraft(avatar);
    setAvatarPathDraft(null);
    setAvatarCodeDraft(avatar);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const draft: UserProfileDraft = {
      displayName: String(data.get("profileName") || fallbackName).trim() || fallbackName,
      bio: String(data.get("profileBio") || "").trim(),
      cityId: String(data.get("profileCity") || selectedCityId),
      avatarPath: avatarPathDraft,
      avatarCode: avatarCodeDraft,
      isPublic: profile.isPublic,
      showFavorites: profile.showFavorites,
      favoriteActivityIds: data.getAll("favoriteActivities").map(String),
    };
    setAvatarBusy(true);
    setProfileError(false);
    try {
      const saved = await repository.saveOwnProfile(draft);
      const resolvedAvatar = saved.avatarPath
        ? await repository.resolveAvatarUrl(saved.avatarPath)
        : saved.avatarCode || "GI";
      const next = mapProfileViewState(saved, resolvedAvatar);
      setProfile(next);
      setAvatarDraft(next.avatar);
      setAvatarPathDraft(next.avatarPath);
      setAvatarCodeDraft(next.avatarCode);
      setSelectedCity(next.cityId);
      setEditing(false);
      notifyTelegram("success");
    } catch {
      setProfileError(true);
      notifyTelegram("error");
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <section className={\`page-section profile-page\${editing ? " is-editing" : ""}\`}>
      {(loading || profileLoading) && <ProfileSkeleton />}
      {(syncError || profileError) && <div className="details-error profile-error"><ShieldCheck /><span>{t.databaseError}</span></div>}
      {!editing && <div className="profile-hero">
        <div className="profile-avatar">{isProfileAvatarImage(profile.avatar) ? <img src={profile.avatar} alt={t.avatar} /> : profile.avatar}</div>
        <div className="profile-main">
          <div className="profile-kicker"><MapPin />{city.name[language]}</div>
          <h1>{profile.name}</h1>
          <p>{profile.bio || t.profileBioFallback}</p>
          <small>{t.registeredAt}: {registeredLabel}</small>
        </div>
        <button className="profile-edit-button" onClick={() => setEditing(true)} type="button"><Pencil size={18} />{t.editProfile}</button>
      </div>}

      {editing && (
        <form id="profile-edit-form" className="profile-edit-form" onSubmit={saveProfile}>
          <div className="profile-edit-intro">
            <h1>{profileCopy.title}</h1>
            <p>{profileCopy.hint}</p>
            <div className="profile-edit-avatar">
              {isProfileAvatarImage(avatarDraft) ? <img src={avatarDraft} alt={t.avatar} /> : <span>{avatarDraft}</span>}
              <i aria-hidden="true"><Camera size={16} /></i>
            </div>
          </div>
          <label><span>{t.name}</span><input name="profileName" defaultValue={profile.name} required /></label>
          <label><span>{t.shortBio}</span><textarea name="profileBio" rows={3} defaultValue={profile.bio} placeholder={t.profileBioPlaceholder} /></label>
          <label><span>{t.city}</span><select name="profileCity" defaultValue={profile.cityId}>{cities.map((item) => <option key={item.id} value={item.id}>{item.name[language]}</option>)}</select></label>
          <div className="interest-picker">
            <span>{t.favoriteActivities}</span>
            <p>{t.favoriteActivitiesHint}</p>
            <div>
              {favoriteOptions.map((option) => (
                <label key={option.id}>
                  <input name="favoriteActivities" type="checkbox" value={option.id} defaultChecked={profile.favoriteActivities.includes(option.id)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="profile-avatar-choice-label">{t.avatar}</div>
          <div className="avatar-picker" role="radiogroup" aria-label={t.avatar}>
            {avatarOptions.map((avatar) => (
              <label key={avatar}>
                <input name="profileAvatar" type="radio" value={avatar} defaultChecked={profile.avatarCode === avatar} onChange={() => selectAvatarCode(avatar)} />
                <span>{avatar}</span>
              </label>
            ))}
          </div>
          <label
            className={\`profile-avatar-upload\${avatarBusy ? " is-busy" : ""}\`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void processAvatarFile(event.dataTransfer.files?.[0]);
            }}
          >
            <input type="file" accept="image/jpeg,image/png" disabled={avatarBusy} aria-label={t.avatar} onChange={(event) => {
              const input = event.currentTarget;
              void processAvatarFile(input.files?.[0]).finally(() => { input.value = ""; });
            }} />
            <UploadCloud aria-hidden="true" />
            <strong>{avatarBusy ? "…" : profileCopy.upload}</strong>
            <small>{profileCopy.formats}</small>
          </label>
          {avatarError && <div className="profile-avatar-error" role="alert">{avatarError}</div>}
          <button className="publish-button" type="submit" disabled={avatarBusy}><Pencil size={18} />{avatarBusy ? "…" : t.save}</button>
        </form>
      )}

      {!editing && <>
        <SectionHeader title={t.favoriteActivities} />
        {selectedFavorites.length ? (
          <div className="profile-interest-list">
            {selectedFavorites.map((option) => <span key={option.id}>{option.label}</span>)}
          </div>
        ) : (
          <EmptyState text={t.noFavoriteActivities} />
        )}

        <SectionHeader title={t.profileStats} />
        <div className="life-grid profile-stats-grid">
          <Metric icon={<Star />} value={String(organized.length)} label={t.createdEvents} />
          <Metric icon={<UserRoundCheck />} value={String(joinedCount)} label={t.visitedEvents} />
          <Metric icon={<Zap />} value={String(activeEvents.length)} label={t.activeEvents} />
          <Metric icon={<Clock3 />} value={String(pendingRequests.length)} label={t.pendingRequests} />
        </div>

        <SectionHeader title={t.myEvents} />
        <ProfileEventGroup title={t.organizing} activities={organized} language={language} emptyText={t.noOrganizedEvents} onOpen={onOpen} onJoin={onJoin} />
        <ProfileEventGroup title={t.participating} activities={participating} language={language} emptyText={t.noJoinedEvents} onOpen={onOpen} onJoin={onJoin} />
        <ProfileEventGroup title={t.waitingDecision} activities={pendingRequests} language={language} emptyText={t.noPendingRequests} onOpen={onOpen} onJoin={onJoin} />
        <button className="telegram-close-button" onClick={onCloseMiniApp} type="button">{t.backToTelegram}</button>
      </>}
    </section>
  );
}
`;

source = source.slice(0, functionStart) + replacement + source.slice(functionEnd);
fs.writeFileSync(path, source);
