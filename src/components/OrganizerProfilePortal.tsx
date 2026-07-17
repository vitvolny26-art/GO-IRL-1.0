import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getCity } from "../config/cities";
import { useAppStore } from "../store";
import type { Language } from "../types";
import { isOrganizerAvatarImage, organizerProfileEventName, resolveOrganizerAvatar, type OrganizerProfileDetail } from "./EventCardPrimitives";

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
  const avatar = profile.avatar || resolveOrganizerAvatar(profile.organizerKey, profile.organizerName);
  const city = events[0] ? getCity(events[0].cityId).name[language] : "";
  return createPortal(
    <div className="organizer-profile-backdrop" role="presentation" onClick={() => setProfile(null)}>
      <section className="organizer-profile-sheet" role="dialog" aria-modal="true" aria-label={labels.title} onClick={(event) => event.stopPropagation()}>
        <button className="organizer-profile-close" type="button" aria-label={labels.close} onClick={() => setProfile(null)}><X aria-hidden="true" /></button>
        <div className="organizer-profile-avatar-large">{isOrganizerAvatarImage(avatar) ? <img src={avatar} alt="" /> : <span>{avatar}</span>}</div>
        <small>{labels.title}</small><h2>{profile.organizerName}</h2>{city ? <p>{city}</p> : null}
        <div className="organizer-profile-count"><strong>{events.length}</strong><span>{labels.events}</span></div>
      </section>
    </div>, document.body,
  );
}
