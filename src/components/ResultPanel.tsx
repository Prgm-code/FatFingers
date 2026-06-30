import { LoadingState } from "./LoadingState";

type ResultPanelProps = {
  result: string;
  isLoading: boolean;
  latencyMs?: number | null;
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
  onCopy,
  onReplaceInput,
  onTryAgain,
  onNew,
  onClose,
}: ResultPanelProps) {
  return (
    <section className="result-panel" aria-label="Result">
      <div className="panel-header">
        <h2>Result</h2>
        {latencyMs ? <span className="muted">{latencyMs} ms</span> : null}
      </div>

      <div className="result-output">
        {isLoading ? <LoadingState /> : result || <span className="placeholder">No result yet</span>}
      </div>

      <div className="button-row">
        <button disabled={!result || isLoading} onClick={onCopy} type="button">
          Copy
        </button>
        <button disabled={!result || isLoading} onClick={onReplaceInput} type="button">
          Replace input
        </button>
        <button disabled={isLoading} onClick={onTryAgain} type="button">
          Try again
        </button>
        <button disabled={isLoading} onClick={onNew} type="button">
          New
        </button>
        <button onClick={onClose} type="button">
          Close
        </button>
      </div>
    </section>
  );
}
