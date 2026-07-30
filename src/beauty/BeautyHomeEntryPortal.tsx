import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { useAppStore } from "../store";
import { beautyHomeCopy } from "./beautyI18n";
import "./beauty-home-entry.css";

export function BeautyHomeEntryPortal() {
  const language = useAppStore((state) => state.language);
  const view = useAppStore((state) => state.view);
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    const resolve = () => setTarget(document.querySelector(".quick-actions"));
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (view !== "home" || !target) return null;
  const text = beautyHomeCopy[language];
  return createPortal(
    <a className="beauty-home-entry" href="/beauty">
      <span className="beauty-home-entry-icon"><Sparkles /></span>
      <span className="beauty-home-entry-copy"><strong>{text.title}</strong><small>{text.hint}</small></span>
      <span className="beauty-home-entry-action">{text.action}<ChevronRight /></span>
    </a>,
    target.parentElement || target,
  );
}
