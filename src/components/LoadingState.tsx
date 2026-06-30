type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Generating" }: LoadingStateProps) {
  return (
    <div className="loading-state" aria-live="polite">
      <span className="loading-dot" />
      {label}
    </div>
  );
}
