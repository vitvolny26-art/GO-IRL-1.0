import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { stripLeadingEmoji } from "../cardText";
import { useAppStore } from "../store";
import type { Activity, ActivityMember, Language } from "../types";
import { ParticipantIdentityLabel } from "./ParticipantIdentityLabel";

type PortalRow = {
  key: string;
  target: HTMLElement;
  avatar: HTMLElement;
  name: HTMLElement;
  member: ActivityMember;
  avatarClassName: string;
  nameClassName?: string;
  nameTag: "span" | "strong";
};

type ActivityPresentation = {
  context: "card" | "sheet";
  primaryText: string | null | undefined;
  secondaryText?: string | null | undefined;
};

type ParticipantMatch = {
  activity: Activity;
  member: ActivityMember;
};

export const participantCardSelector = ".activity-card, .sport-card";

const normalize = (value: string | null | undefined) => stripLeadingEmoji(String(value || "")).trim();

export const resolveParticipantActivity = (
  activities: readonly Activity[],
  language: Language,
  presentation: ActivityPresentation,
) => {
  const primaryText = normalize(presentation.primaryText);
  if (!primaryText) return null;

  const candidates = activities.filter((activity) => {
    const primaryValue = presentation.context === "card"
      ? activity.activity[language]
      : activity.title[language];
    return normalize(primaryValue) === primaryText;
  });

  if (candidates.length === 1) return candidates[0];

  const secondaryText = normalize(presentation.secondaryText);
  if (!secondaryText) return null;

  const narrowed = candidates.filter((activity) => {
    const secondaryValue = presentation.context === "card"
      ? activity.title[language]
      : activity.description[language];
    return normalize(secondaryValue) === secondaryText;
  });

  return narrowed.length === 1 ? narrowed[0] : null;
};

export const resolveParticipantMember = (
  activity: Activity | null,
  status: ActivityMember["status"],
  statusIndex: number,
  snapshotName: string,
) => {
  if (!activity || statusIndex < 0) return null;

  const members = activity.members.filter((member) => member.status === status);
  const indexed = members[statusIndex] || null;
  const normalizedSnapshot = normalize(snapshotName);

  if (indexed && normalize(indexed.name) === normalizedSnapshot) return indexed;

  const matching = members.filter((member) => normalize(member.name) === normalizedSnapshot);
  return matching.length === 1 ? matching[0] : null;
};

export const findActivityForCard = (
  row: HTMLElement,
  activities: readonly Activity[],
  language: Language,
) => {
  const card = row.closest<HTMLElement>(participantCardSelector);
  return resolveParticipantActivity(activities, language, {
    context: "card",
    primaryText: card?.querySelector<HTMLElement>("h3")?.textContent,
    secondaryText: card?.querySelector<HTMLElement>(".sport-card-main p")?.textContent,
  });
};

export const findActivityForSheet = (
  row: HTMLElement,
  activities: readonly Activity[],
  language: Language,
) => {
  const sheet = row.closest<HTMLElement>(".activity-sheet");
  return resolveParticipantActivity(activities, language, {
    context: "sheet",
    primaryText: sheet?.querySelector<HTMLElement>("h2")?.textContent,
    secondaryText: sheet?.querySelector<HTMLElement>(".sheet-description, .sport-sheet-hero p")?.textContent,
  });
};

const statusForRow = (row: HTMLElement): ActivityMember["status"] => {
  if (row.classList.contains("waiting-member")) return "waiting";
  if (row.classList.contains("pending-member")) return "pending";
  return "joined";
};

const statusIndexForRow = (row: HTMLElement, status: ActivityMember["status"]) => {
  const container = row.closest<HTMLElement>(".sport-card-members-preview, .members-list");
  if (!container) return -1;

  const peers = Array.from(container.children).filter((child): child is HTMLElement => (
    child instanceof HTMLElement
    && child.matches(".sport-card-member-preview-row, .member-row")
    && statusForRow(child) === status
  ));

  return peers.indexOf(row);
};

const findParticipantMatch = (
  row: HTMLElement,
  activities: readonly Activity[],
  language: Language,
): ParticipantMatch | null => {
  const activity = row.closest(".activity-sheet")
    ? findActivityForSheet(row, activities, language)
    : findActivityForCard(row, activities, language);
  if (!activity) return null;

  const status = statusForRow(row);
  const statusIndex = statusIndexForRow(row, status);
  const snapshotName = row.querySelector<HTMLElement>(".sport-card-member-name, :scope > strong")?.textContent?.trim() || "";
  const member = resolveParticipantMember(activity, status, statusIndex, snapshotName);

  return member ? { activity, member } : null;
};

export function ParticipantIdentityPortal() {
  const activities = useAppStore((state) => state.activities);
  const language = useAppStore((state) => state.language);
  const [rows, setRows] = useState<PortalRow[]>([]);
  const activityVersion = useMemo(() => activities.map((activity) => (
    `${activity.id}:${activity.activity[language]}:${activity.title[language]}:${activity.members.map((member) => `${member.userKey}:${member.status}:${member.name}`).join(",")}`
  )).join("|"), [activities, language]);

  useEffect(() => {
    const refresh = () => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(
        ".sport-card-member-preview-row, .members-list .member-row",
      ));
      const next: PortalRow[] = [];

      candidates.forEach((row) => {
        if (row.dataset.profileIdentityPortal === "1") return;
        const avatar = row.querySelector<HTMLElement>(".sport-card-member-avatar, .member-avatar");
        const name = row.querySelector<HTMLElement>(".sport-card-member-name, :scope > strong");
        const match = findParticipantMatch(row, activities, language);
        if (!avatar || !name || !match) return;

        const target = document.createElement("span");
        target.className = "participant-identity-portal-slot";
        row.insertBefore(target, avatar);
        avatar.classList.add("participant-identity-legacy-hidden");
        name.classList.add("participant-identity-legacy-hidden");
        row.dataset.profileIdentityPortal = "1";
        next.push({
          key: `${match.activity.id}:${match.member.userKey}:${match.member.status}:${statusIndexForRow(row, match.member.status)}`,
          target,
          avatar,
          name,
          member: match.member,
          avatarClassName: avatar.className.replace("participant-identity-legacy-hidden", "").trim(),
          nameClassName: name.className.replace("participant-identity-legacy-hidden", "").trim() || undefined,
          nameTag: name.tagName.toLowerCase() === "strong" ? "strong" : "span",
        });
      });

      setRows((current) => [...current.filter((item) => item.target.isConnected), ...next]);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setRows((current) => {
        current.forEach((item) => {
          item.target.remove();
          item.avatar.classList.remove("participant-identity-legacy-hidden");
          item.name.classList.remove("participant-identity-legacy-hidden");
          item.avatar.closest<HTMLElement>("[data-profile-identity-portal]")?.removeAttribute("data-profile-identity-portal");
        });
        return [];
      });
    };
  }, [activities, activityVersion, language]);

  return rows.map((row) => createPortal(
    <ParticipantIdentityLabel
      userKey={row.member.userKey}
      snapshotName={row.member.name}
      avatarClassName={row.avatarClassName}
      nameClassName={row.nameClassName}
      nameTag={row.nameTag}
    />,
    row.target,
    row.key,
  ));
}
