import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { useAppStore } from "../store";
import { beautyHomeCopy } from "./beautyI18n";
import { useBeautyWorkspaceAttentionCount } from "./beautyWorkspaceAttention";
import { canShowBeautyWorkspaceEntry } from "./servicesRoleNavigation";
import "./beauty-home-entry.css";

export function BeautyHomeEntryPortal() {
  const language = useAppStore((state) => state.language);
  const view = useAppStore((state) => state.view);
  const userRole = useAppStore((state) => state.userRole);
  const attentionCount = useBeautyWorkspaceAttentionCount();
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    const resolve = () => setTarget(document.querySelector(".quick-actions"));
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (view !== "home" || !target || !canShowBeautyWorkspaceEntry(userRole)) return null;
  const text = beautyHomeCopy[language];
  return createPortal(
    <a className="beauty-home-entry" href="/beauty/workspace" target="_blank" rel="noopener noreferrer">
      <span className="beauty-home-entry-icon"><Sparkles />{attentionCount > 0 && <b className="beauty-workspace-entry-badge">{attentionCount > 99 ? "99+" : attentionCount}</b>}</span>
      <span className="beauty-home-entry-copy"><strong>{text.title}</strong><small>{text.hint}</small></span>
      <span className="beauty-home-entry-action">{text.action}<ChevronRight /></span>
    </a>,
    target.parentElement || target,
  );
}
