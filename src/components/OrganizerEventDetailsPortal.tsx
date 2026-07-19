import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getTranslation } from "../i18n";
import { stripLeadingEmoji } from "../cardText";
import { useAppStore } from "../store";
import type { Activity, Language } from "../types";
import { OrganizerDetailAction } from "./EventCardPrimitives";

export const findActivityForSheetTitle = (activities: Activity[], language: Language, title: string) => {
  const normalized = title.trim();
  return activities.find((activity) => stripLeadingEmoji(activity.title[language]).trim() === normalized)
    || activities.find((activity) => Object.values(activity.title).some((value) => stripLeadingEmoji(value).trim() === normalized))
    || null;
};

type PortalState = {
  target: HTMLElement;
  activity: Activity;
  legacyRow: HTMLElement | null;
};

const findLegacyOrganizerRow = (detailList: HTMLElement) => {
  return Array.from(detailList.children).find((child) => {
    if (!(child instanceof HTMLElement)) return false;
    return Boolean(child.querySelector(".lucide-circle-user-round"));
  }) as HTMLElement | undefined;
};

export function OrganizerEventDetailsPortal() {
  const { activities, language } = useAppStore();
  const [portal, setPortal] = useState<PortalState | null>(null);
  const labels = getTranslation(language);

  useEffect(() => {
    const refresh = () => {
      const sheet = document.querySelector<HTMLElement>(".activity-sheet");
      const detailList = sheet?.querySelector<HTMLElement>(".detail-list");
      const title = sheet?.querySelector("h2")?.textContent || "";
      const activity = detailList ? findActivityForSheetTitle(activities, language, title) : null;

      if (!detailList || !activity) {
        setPortal((current) => {
          current?.target.remove();
          current?.legacyRow?.classList.remove("organizer-detail-legacy-hidden");
          return null;
        });
        return;
      }

      setPortal((current) => {
        if (current?.target.isConnected && current.activity.id === activity.id && current.target.parentElement === detailList) return current;
        current?.target.remove();
        current?.legacyRow?.classList.remove("organizer-detail-legacy-hidden");

        const legacyRow = findLegacyOrganizerRow(detailList) || null;
        legacyRow?.classList.add("organizer-detail-legacy-hidden");
        const target = document.createElement("div");
        target.className = "organizer-detail-portal-slot";
        detailList.appendChild(target);
        return { target, activity, legacyRow };
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortal((current) => {
        current?.target.remove();
        current?.legacyRow?.classList.remove("organizer-detail-legacy-hidden");
        return null;
      });
    };
  }, [activities, language]);

  if (!portal) return null;
  return createPortal(
    <OrganizerDetailAction organizerKey={portal.activity.organizerKey} organizerName={portal.activity.organizer} label={labels.organizer} />,
    portal.target,
  );
}
