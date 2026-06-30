import { LoadingState } from "./LoadingState";
import { t } from "../lib/i18n";
import type { AppLanguage } from "../types/app";

type ResultPanelProps = {
  result: string;
  isLoading: boolean;
  latencyMs?: number | null;
  language?: AppLanguage;
  onCopy: () => void;
  onReplaceInput: () => void;
  onTryAgain: () => void;
  onNew: () => void;
  onClose: () => void;
};

export function ResultPanel({
  result,
  isLoading,
  latencyMs,
  language = "en",
  onCopy,
  onReplaceInput,
  onTryAgain,
  onNew,
  onClose,
}: ResultPanelProps) {
  if (!result && !isLoading) {
    return null;
  }

  return (
    <section className="result-panel" aria-label={t(language, "result")}>
      <div className="panel-header">
        <h2>{t(language, "result")}</h2>
        {latencyMs ? <span className="muted">{latencyMs} ms</span> : null}
      </div>

      <div className="result-output">
        {isLoading ? (
          <LoadingState language={language} />
        ) : (
          result || <span className="placeholder">{t(language, "noResultYet")}</span>
        )}
      </div>

      <div className="button-row">
        <button disabled={!result || isLoading} onClick={onCopy} type="button">
          {t(language, "copy")}
        </button>
        <button disabled={!result || isLoading} onClick={onReplaceInput} type="button">
          {t(language, "replaceInput")}
        </button>
        <button disabled={isLoading} onClick={onTryAgain} type="button">
          {t(language, "tryAgain")}
        </button>
        <button disabled={isLoading} onClick={onNew} type="button">
          {t(language, "new")}
        </button>
        <button onClick={onClose} type="button">
          {t(language, "close")}
        </button>
      </div>
    </section>
  );
}
