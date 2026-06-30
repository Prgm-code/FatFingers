type ErrorBannerProps = {
  message: string | null;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-banner" role="alert">
      {message}
    </div>
  );
}
