type JoinSuccessNoticeProps = {
  visible: boolean;
  onOpenChat?: () => void;
};

export function JoinSuccessNotice({ visible, onOpenChat }: JoinSuccessNoticeProps) {
  if (!visible) return null;

  return (
    <section className="join-success-notice" role="status">
      <strong>Ты идёшь 🎉</strong>
      <span>Ты присоединился к событию. Теперь можно написать группе.</span>
      {onOpenChat && (
        <button type="button" onClick={onOpenChat}>
          Открыть чат события
        </button>
      )}
    </section>
  );
}
