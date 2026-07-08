import { useState } from "react";
import { Bell, Check, ChevronDown, Globe2, MapPin } from "lucide-react";
import { cities, getCity } from "../config/cities";
import { languageOptions, type Translation } from "../i18n";
import type { Language } from "../types";

type HeaderMenu = "city" | "language" | "notifications" | null;

type AppHeaderProps = {
  language: Language;
  selectedCityId: string;
  translation: Translation;
  onBrandClick: () => void;
  onCityChange: (cityId: string) => void;
  onLanguageChange: (language: Language) => void;
};

export function AppHeader({
  language,
  selectedCityId,
  translation,
  onBrandClick,
  onCityChange,
  onLanguageChange,
}: AppHeaderProps) {
  const [openMenu, setOpenMenu] = useState<HeaderMenu>(null);
  const selectedCity = getCity(selectedCityId);
  const selectedLanguage = languageOptions.find((item) => item.id === language) ?? languageOptions[0];

  const toggleMenu = (menu: Exclude<HeaderMenu, null>) => {
    setOpenMenu((current) => current === menu ? null : menu);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <button className="header-brand" onClick={onBrandClick} type="button" aria-label="GO IRL">
            <img src="/brand/logo-square.png" alt="GO IRL" />
          </button>

          <div className="header-controls">
            <button
              className={openMenu === "city" ? "header-control is-active" : "header-control"}
              onClick={() => toggleMenu("city")}
              type="button"
              aria-label={translation.selectCity}
              aria-expanded={openMenu === "city"}
            >
              <MapPin />
              <span>{selectedCity.name[language]}</span>
              <ChevronDown className="control-chevron" />
            </button>

            <button
              className={openMenu === "language" ? "header-control language-control is-active" : "header-control language-control"}
              onClick={() => toggleMenu("language")}
              type="button"
              aria-label={translation.selectLanguage}
              aria-expanded={openMenu === "language"}
            >
              <Globe2 />
              <span>{selectedLanguage.shortLabel}</span>
              <ChevronDown className="control-chevron" />
            </button>

            <button
              className={openMenu === "notifications" ? "header-icon-button is-active" : "header-icon-button"}
              onClick={() => toggleMenu("notifications")}
              type="button"
              aria-label={translation.notifications}
              aria-expanded={openMenu === "notifications"}
              title={translation.notifications}
            >
              <Bell />
            </button>
          </div>

          {openMenu === "city" && (
            <div className="header-popover city-popover" role="menu" aria-label={translation.selectCity}>
              <div className="popover-title">{translation.selectCity}</div>
              {cities.map((city) => (
                <button key={city.id} onClick={() => { onCityChange(city.id); setOpenMenu(null); }} type="button" role="menuitem">
                  <span className="option-icon"><MapPin /></span>
                  <span><strong>{city.name[language]}</strong><small>{city.countryCode}</small></span>
                  {city.id === selectedCityId && <Check />}
                </button>
              ))}
            </div>
          )}

          {openMenu === "language" && (
            <div className="header-popover language-popover" role="menu" aria-label={translation.selectLanguage}>
              <div className="popover-title">{translation.selectLanguage}</div>
              {languageOptions.map((option) => (
                <button key={option.id} onClick={() => { onLanguageChange(option.id); setOpenMenu(null); }} type="button" role="menuitem">
                  <span className="language-code">{option.shortLabel}</span>
                  <strong>{option.name}</strong>
                  {option.id === language && <Check />}
                </button>
              ))}
            </div>
          )}

          {openMenu === "notifications" && (
            <div className="header-popover notifications-popover" role="status">
              <div className="popover-title">{translation.notifications}</div>
              <div className="notification-empty"><Bell /><span>{translation.noNotifications}</span></div>
            </div>
          )}
        </div>
      </header>
      {openMenu && <button className="header-scrim" onClick={() => setOpenMenu(null)} type="button" aria-label={translation.close} />}
    </>
  );
}
