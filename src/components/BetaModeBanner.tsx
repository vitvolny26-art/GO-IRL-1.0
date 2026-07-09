type BetaModeBannerProps = {
  visible?: boolean;
};

export function BetaModeBanner({ visible = true }: BetaModeBannerProps) {
  if (!visible) return null;

  return (
    <aside className="beta-mode-banner" role="status">
      <strong>Demo mode</strong>
      <span>Вы тестируете GO IRL без Telegram. Данные сохраняются только локально.</span>
    </aside>
  );
}
