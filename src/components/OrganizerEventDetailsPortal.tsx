import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { stripLeadingEmoji } from "../cardText";
import { getTranslation } from "../i18n";
import { useAppStore } from "../store";
import type { Activity, Language } from "../types";
import { OrganizerDetailAction } from "./EventCardPrimitives";

const normalizeText = (value: string) => stripLeadingEmoji(value).trim();

export const findSportActivityForSheet = (
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
};

export function OrganizerEventDetailsPortal() {
  const { activities, language } = useAppStore();
  const [portal, setPortal] = useState<PortalState | null>(null);
  const labels = getTranslation(language);

  useEffect(() => {
    const refresh = () => {
      const sheet = document.querySelector<HTMLElement>(".activity-sheet.sport-sheet");
      const detailList = sheet?.querySelector<HTMLElement>(".sport-detail-list");
      const title = sheet?.querySelector("h2")?.textContent || "";
      const description = sheet?.querySelector(".sport-sheet-hero p")?.textContent || "";
      const activity = detailList
        ? findSportActivityForSheet(activities, language, title, description)
        : null;

      if (!detailList || !activity) {
        setPortal((current) => {
          current?.target.remove();
          return null;
        });
        return;
      }

      setPortal((current) => {
        if (
          current?.target.isConnected
          && current.activity.id === activity.id
          && current.target.parentElement === detailList
        ) {
          return current;
        }

        current?.target.remove();
        const target = document.createElement("div");
        target.className = "organizer-detail-portal-slot";
        target.style.display = "contents";
        detailList.appendChild(target);
        return { target, activity };
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      setPortal((current) => {
        current?.target.remove();
        return null;
      });
    };
  }, [activities, language]);

  if (!portal) return null;

  return createPortal(
    <OrganizerDetailAction
      organizerKey={portal.activity.organizerKey}
      organizerName={portal.activity.organizer}
      label={labels.organizer}
    />,
    portal.target,
  );
}
