type SettingsButtonProps = {
  onClick: () => void;
};

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      aria-label="Open settings"
      className="icon-button"
      onClick={onClick}
      title="Open settings"
      type="button"
    >
      Settings
    </button>
  );
}
