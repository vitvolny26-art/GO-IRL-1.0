import { isMapUrl, isResolvedMapProviderUrl } from "./mapProvider";
import { requestMapProvider } from "./mapProviderPicker";

const replaceVisibleMapLabels = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLElement>("a, button").forEach((element) => {
    if (element.closest("[data-map-provider-choice]")) return;
    if (/open in google maps|открыть в google maps/i.test(element.textContent || "")) {
      element.textContent = (element.textContent || "")
        .replace(/open in google maps/gi, "Open map")
        .replace(/открыть в google maps/gi, "Открыть карту");
    }
  });
};

export const enableMapyRuntimeLinks = () => {
  const nativeOpen = window.open.bind(window);

  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const value = typeof url === "string" ? url : url?.toString();
    if (value && isMapUrl(value) && !isResolvedMapProviderUrl(value)) {
      requestMapProvider(value);
      return null;
    }
    return nativeOpen(url, target, features);
  }) as typeof window.open;

  const handleClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(target instanceof HTMLAnchorElement)) return;
    if (target.closest("[data-map-provider-choice]")) return;
    if (!isMapUrl(target.href) || isResolvedMapProviderUrl(target.href)) return;

    event.preventDefault();
    event.stopPropagation();
    requestMapProvider(target.href);
  };

  replaceVisibleMapLabels();
  document.addEventListener("click", handleClick, true);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) replaceVisibleMapLabels(node);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    window.open = nativeOpen;
    document.removeEventListener("click", handleClick, true);
    observer.disconnect();
  };
};
