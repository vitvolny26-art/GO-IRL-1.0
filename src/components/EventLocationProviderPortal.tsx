import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { detectEventLocationProvider, resolveEventLocationProviderUrl } from "../eventLocationProvider";
import { mapProviderOptions } from "../mapProviderPicker";
import { readUserPreferences, updateUserPreferences, type MapProvider } from "../userPreferences";

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

const setReactInputValue = (input: HTMLInputElement, value: string) => {
  nativeInputValueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

type PortalTarget = { target: HTMLElement; form: HTMLFormElement };

export function EventLocationProviderPortal() {
  const [portal, setPortal] = useState<PortalTarget | null>(null);
  const [provider, setProvider] = useState<MapProvider>(() => readUserPreferences().mapProvider || "mapy");

  useEffect(() => {
    const refresh = () => {
      const form = document.querySelector<HTMLFormElement>("form.create-form");
      const picker = form?.querySelector<HTMLElement>(".event-location-picker-portal");
      if (!form || !picker) {
        setPortal((current) => {
          current?.target.remove();
          return null;
        });
        return;
      }
      setPortal((current) => {
        if (current?.target.isConnected && current.form === form) return current;
        current?.target.remove();
        const target = document.createElement("div");
        target.className = "event-location-provider-portal";
        picker.insertAdjacentElement("afterend", target);
        return { target, form };
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!portal) return;
    const field = portal.form.elements.namedItem("locationUrl");
    if (!(field instanceof HTMLInputElement)) return;

    const sync = () => {
      const value = field.value.trim();
      if (!value) return;
      const detected = detectEventLocationProvider(value);
      if (detected === provider) return;
      try {
        setReactInputValue(field, resolveEventLocationProviderUrl(value, provider));
      } catch {
        // Keep manually entered URLs untouched when they cannot be routed.
      }
    };

    field.addEventListener("change", sync);
    field.addEventListener("input", sync);
    return () => {
      field.removeEventListener("change", sync);
      field.removeEventListener("input", sync);
    };
  }, [portal, provider]);

  if (!portal) return null;

  const choose = (next: MapProvider) => {
    setProvider(next);
    updateUserPreferences({ mapProvider: next });
    const field = portal.form.elements.namedItem("locationUrl");
    if (field instanceof HTMLInputElement && field.value.trim()) {
      try {
        setReactInputValue(field, resolveEventLocationProviderUrl(field.value, next));
      } catch {
        // Preserve manual non-map URLs.
      }
    }
  };

  return createPortal(
    <section className="event-location-provider" aria-label="Провайдер карты">
      <div className="event-location-provider-title"><MapPin />Сохранить точку для</div>
      <div className="event-location-provider-options">
        {mapProviderOptions.map((option) => (
          <button
            type="button"
            key={option.id}
            className={provider === option.id ? "is-selected" : ""}
            onClick={() => choose(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>,
    portal.target,
  );
}
