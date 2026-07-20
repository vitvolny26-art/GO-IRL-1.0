import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getTranslation } from "../i18n";
import { stripLeadingEmoji } from "../cardText";
import { useAppStore } from "../store";
import type { Activity, Language } from "../types";
import { OrganizerDetailAction } from "./EventCardPrimitives";

const normalizeText = (value: string) => stripLeadingEmoji(value).trim();

export const findActivityForSheet = (
  activities: Activity[],
  language: Language,
  title: string,
  description: string,
) => {
  const normalizedTitle = title.trim();
  const normalizedDescription = description.trim();
  return activities.find((activity) => (
    normalizeText(activity.title[language]) === normalizedTitle
    && normalizeText(activity.description[language]) === normalizedDescription
  )) || null;
};

type PortalState = {
  target: HTMLElement;
  activity: Activity;
  legacyRow: HTMLElement | null;
};

const findLegacyOrganizerRow = (detailList: HTMLElement, organizerLabel: string) => {
  return Array.from(detailList.children).find((child) => {
    if (!(child instanceof HTMLElement)) return false;
    const label = child.querySelector(":scope > span")?.textContent?.trim() || "";
    return label === organizerLabel;
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
      const description = sheet?.querySelector(".sheet-description, .sport-sheet-hero p")?.textContent || "";
      const activity = detailList ? findActivityForSheet(activities, language, title, description) : null;

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

        const legacyRow = findLegacyOrganizerRow(detailList, labels.organizer) || null;
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
  }, [activities, language, labels.organizer]);

  if (!portal) return null;
  return createPortal(
    <OrganizerDetailAction organizerKey={portal.activity.organizerKey} organizerName={portal.activity.organizer} label={labels.organizer} />,
    portal.target,
  );
}
