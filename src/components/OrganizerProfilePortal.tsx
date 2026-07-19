import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getCity } from "../config/cities";
import { useAppStore } from "../store";
import type { Language } from "../types";
import { isOrganizerAvatarImage, organizerProfileEventName, type OrganizerProfileDetail } from "./EventCardPrimitives";

const copy: Record<Language, { title: string; events: string; close: string }> = {
  ru: { title: "Профиль организатора", events: "События", close: "Закрыть" },
  uk: { title: "Профіль організатора", events: "Події", close: "Закрити" },
  cs: { title: "Profil organizátora", events: "Události", close: "Zavřít" },
  en: { title: "Organizer profile", events: "Events", close: "Close" },
};

export function OrganizerProfilePortal() {
  const { activities, language } = useAppStore();
  const [profile, setProfile] = useState<OrganizerProfileDetail | null>(null);
  const events = useMemo(() => profile ? activities.filter((item) => item.organizerKey === profile.organizerKey) : [], [activities, profile]);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<OrganizerProfileDetail>).detail;
      if (detail?.organizerKey) setProfile(detail);
    };
    window.addEventListener(organizerProfileEventName, open);
    return () => window.removeEventListener(organizerProfileEventName, open);
  }, []);

  if (!profile || typeof document === "undefined") return null;
  const labels = copy[language];
  const fallbackCityId = events[0]?.cityId || "";
  const cityId = profile.cityId || fallbackCityId;
  const city = cityId ? getCity(cityId).name[language] : "";

  return createPortal(
    <div className="organizer-profile-backdrop" role="presentation" onClick={() => setProfile(null)}>
      <section className="organizer-profile-sheet" role="dialog" aria-modal="true" aria-label={labels.title} onClick={(event) => event.stopPropagation()}>
        <button className="organizer-profile-close" type="button" aria-label={labels.close} onClick={() => setProfile(null)}><X aria-hidden="true" /></button>
        <div className="organizer-profile-avatar-large">{isOrganizerAvatarImage(profile.avatar) ? <img src={profile.avatar} alt="" /> : <span>{profile.avatar}</span>}</div>
        <small>{labels.title}</small>
        <h2>{profile.displayName}</h2>
        {profile.bio ? <p>{profile.bio}</p> : null}
        {city ? <p>{city}</p> : null}
        <div className="organizer-profile-count"><strong>{events.length}</strong><span>{labels.events}</span></div>
      </section>
    </div>, document.body,
  );
}
