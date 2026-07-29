import { Eye, EyeOff, FileText, ShieldCheck } from "lucide-react";
import type { Language } from "../types";

export type ProfilePrivacySnapshot = {
  displayName: string;
  bio: string;
  cityLabel: string;
  avatar: string;
  isPublic: boolean;
  showFavorites: boolean;
  favoriteLabels: string[];
};

type Props = {
  language: Language;
  snapshot: ProfilePrivacySnapshot;
  saving: boolean;
  onChange: (next: Pick<ProfilePrivacySnapshot, "isPublic" | "showFavorites">) => void;
};

const copy: Record<Language, {
  title: string; hint: string; publicProfile: string; publicHint: string; favorites: string; favoritesHint: string;
  preview: string; hidden: string; notice: string; terms: string; rights: string; rightsUnavailable: string; adult: string;
}> = {
  ru: { title: "Приватность и безопасность", hint: "Управляйте тем, что видно другим участникам.", publicProfile: "Публичный профиль", publicHint: "Имя, фото, город и короткое описание могут отображаться в событиях.", favorites: "Показывать избранные интересы", favoritesHint: "Личная цель и скрытые интересы никогда не публикуются.", preview: "Публичный предпросмотр", hidden: "Профиль скрыт", notice: "Уведомление о конфиденциальности", terms: "Условия использования", rights: "Запросы по данным", rightsUnavailable: "Запрос доступа, исправления или удаления будет подключён после запуска support backend.", adult: "GO IRL предназначен для пользователей 18+. Возраст указывается пользователем самостоятельно и не считается проверенным." },
  uk: { title: "Приватність і безпека", hint: "Керуйте тим, що бачать інші учасники.", publicProfile: "Публічний профіль", publicHint: "Ім’я, фото, місто та короткий опис можуть відображатися у подіях.", favorites: "Показувати улюблені інтереси", favoritesHint: "Приватна мета та приховані інтереси ніколи не публікуються.", preview: "Публічний перегляд", hidden: "Профіль приховано", notice: "Повідомлення про конфіденційність", terms: "Умови використання", rights: "Запити щодо даних", rightsUnavailable: "Запити доступу, виправлення або видалення буде підключено після запуску support backend.", adult: "GO IRL призначений для користувачів 18+. Вік вказується користувачем самостійно і не вважається перевіреним." },
  cs: { title: "Soukromí a bezpečnost", hint: "Spravujte, co uvidí ostatní účastníci.", publicProfile: "Veřejný profil", publicHint: "Jméno, fotka, město a krátký popis se mohou zobrazit u událostí.", favorites: "Zobrazit oblíbené zájmy", favoritesHint: "Soukromý cíl a skryté zájmy se nikdy nezveřejňují.", preview: "Veřejný náhled", hidden: "Profil je skrytý", notice: "Oznámení o ochraně soukromí", terms: "Podmínky používání", rights: "Žádosti o údaje", rightsUnavailable: "Žádosti o přístup, opravu nebo výmaz budou dostupné po spuštění support backendu.", adult: "GO IRL je určeno uživatelům 18+. Věk uvádí uživatel sám a není považován za ověřený." },
  en: { title: "Privacy and safety", hint: "Control what other participants can see.", publicProfile: "Public profile", publicHint: "Your name, photo, city and short bio may appear around events.", favorites: "Show favorite interests", favoritesHint: "Private goals and hidden interests are never published.", preview: "Public preview", hidden: "Profile hidden", notice: "Privacy Notice", terms: "Terms of Use", rights: "Data rights requests", rightsUnavailable: "Access, correction and deletion requests will be connected after the support backend launches.", adult: "GO IRL is for users 18+. Age is self-declared and is not treated as verified." },
};

const isImageAvatar = (value: string) => value.startsWith("data:image/") || /^https?:\/\//.test(value);

export function ProfilePrivacyCenter({ language, snapshot, saving, onChange }: Props) {
  const labels = copy[language];
  return (
    <section className="profile-privacy-center" aria-labelledby="profile-privacy-title">
      <header><h2 id="profile-privacy-title">{labels.title}</h2><p>{labels.hint}</p></header>
      <label className="profile-privacy-toggle"><span>{snapshot.isPublic ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}</span><span><strong>{labels.publicProfile}</strong><small>{labels.publicHint}</small></span><input type="checkbox" checked={snapshot.isPublic} disabled={saving} onChange={(event) => onChange({ isPublic: event.target.checked, showFavorites: snapshot.showFavorites })} /></label>
      <label className="profile-privacy-toggle"><span><ShieldCheck aria-hidden="true" /></span><span><strong>{labels.favorites}</strong><small>{labels.favoritesHint}</small></span><input type="checkbox" checked={snapshot.showFavorites} disabled={saving || !snapshot.isPublic} onChange={(event) => onChange({ isPublic: snapshot.isPublic, showFavorites: event.target.checked })} /></label>
      <section className="profile-public-preview" aria-label={labels.preview}><h3>{labels.preview}</h3>{snapshot.isPublic ? <div><span className="profile-public-preview-avatar">{isImageAvatar(snapshot.avatar) ? <img src={snapshot.avatar} alt="" /> : snapshot.avatar}</span><strong>{snapshot.displayName}</strong><small>{snapshot.cityLabel}</small><p>{snapshot.bio}</p>{snapshot.showFavorites && snapshot.favoriteLabels.length > 0 ? <div className="profile-interest-list">{snapshot.favoriteLabels.map((label) => <span key={label}>{label}</span>)}</div> : null}</div> : <p>{labels.hidden}</p>}</section>
      <div className="profile-privacy-links"><a href="/privacy" target="_blank" rel="noreferrer"><FileText aria-hidden="true" />{labels.notice}</a><a href="/terms.html" target="_blank" rel="noreferrer"><FileText aria-hidden="true" />{labels.terms}</a></div>
      <section className="profile-rights-status"><h3>{labels.rights}</h3><p>{labels.rightsUnavailable}</p></section>
      <p className="profile-age-notice">{labels.adult}</p>
    </section>
  );
}
