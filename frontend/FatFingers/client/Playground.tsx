import { useEffect, useRef, useState } from "preact/hooks";
import { PLAY_ACTIONS, TARGET_CHIP, TARGET_ORDER, type Copy, type PlayAction, type TargetLanguage } from "./copy";
import { useInView } from "./hooks";
import { ChevronIcon } from "./icons";

type PlayPhase = "compose" | "working" | "review";

const PUNCTUATION = /^([¿¡"(]*)(.*?)([.,!?;:")]*)$/;

function markTypos(text: string, typos: string[]) {
  const typoSet = new Set(typos.map((typo) => typo.toLowerCase()));
  return text.split(/(\s+)/).map((token, index) => {
    const match = token.match(PUNCTUATION);
    const core = match?.[2] ?? token;
    if (!core || !typoSet.has(core.toLowerCase())) return token;
    return (
      <span key={index}>
        {match?.[1]}
        <span className="typo">{core}</span>
        {match?.[3]}
      </span>
    );
  });
}

type PlaygroundProps = { copy: Copy; reduceMotion: boolean };

export function Playground({ copy, reduceMotion }: PlaygroundProps) {
  const pg = copy.playground;
  const sample = pg.sample;
  const [action, setAction] = useState<PlayAction>("professional");
  const [target, setTarget] = useState<TargetLanguage>(sample.source === "es" ? "en" : "es");
  const [phase, setPhase] = useState<PlayPhase>("compose");
  const [runId, setRunId] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const runTimer = useRef<number | undefined>(undefined);
  const noticeTimer = useRef<number | undefined>(undefined);
  const autoRun = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, "0px 0px -25% 0px");

  const sameLanguage = target === "original" || target === sample.source;
  const output = sameLanguage ? sample.outputs[action].same : sample.outputs[action].other;
  const runLabel = action === "correct" && target !== "original" ? copy.helper.translate : copy.helper.improve;
  const latency = 540 + PLAY_ACTIONS.indexOf(action) * 113 + TARGET_ORDER.indexOf(target) * 71;
  const words = output.split(" ");

  useEffect(
    () => () => {
      window.clearTimeout(runTimer.current);
      window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  // Show one result on its own the first time the demo scrolls into view.
  useEffect(() => {
    if (!inView || autoRun.current) return;
    autoRun.current = true;
    runTimer.current = window.setTimeout(run, reduceMotion ? 0 : 650);
  }, [inView]);

  function run() {
    window.clearTimeout(runTimer.current);
    setNotice(null);
    if (reduceMotion) {
      setPhase("review");
      setRunId((id) => id + 1);
      return;
    }
    setPhase("working");
    runTimer.current = window.setTimeout(() => {
      setPhase("review");
      setRunId((id) => id + 1);
    }, 780);
  }

  function chooseAction(next: PlayAction) {
    setAction(next);
    if (phase !== "compose") run();
  }

  function chooseTarget(next: TargetLanguage) {
    setTarget(next);
    if (phase !== "compose") run();
  }

  function cycleTarget() {
    chooseTarget(TARGET_ORDER[(TARGET_ORDER.indexOf(target) + 1) % TARGET_ORDER.length]);
  }

  function back() {
    window.clearTimeout(runTimer.current);
    setPhase("compose");
    setNotice(null);
  }

  function flash(message: string) {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 1800);
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      flash(pg.copied);
    } catch {
      flash(pg.copyFailed);
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod && !event.altKey && /^[1-4]$/.test(event.key)) {
      event.preventDefault();
      chooseAction(PLAY_ACTIONS[Number(event.key) - 1]);
      return;
    }
    // Plain L, or Cmd/Ctrl+Shift+L as in the app. Never Ctrl+L alone, which
    // belongs to the browser address bar.
    if (event.key.toLowerCase() === "l" && !event.altKey && (!mod || event.shiftKey)) {
      event.preventDefault();
      cycleTarget();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      if (phase === "review" && !mod) void copyOutput();
      else run();
      return;
    }
    if ((event.key === "Escape" || (mod && event.key.toLowerCase() === "z")) && phase !== "compose") {
      event.preventDefault();
      back();
    }
  }

  return (
    <section aria-labelledby="pg-title" className="pg" id="idiomas">
      <div aria-hidden="true" className="pg-watermark">
        Aa→{sample.source === "es" ? "EN" : "ES"}
      </div>
      <div className="pg-grid">
        <div className="pg-intro" data-reveal>
          <p className="kicker">
            <span className="new-badge">{pg.badge}</span>
            {pg.kicker}
          </p>
          <h2 className="h2" id="pg-title">
            {pg.title} <em>{pg.titleAccent}</em>
          </h2>
          <p className="lead">{pg.lead}</p>
        </div>

        <div className="pg-stage" data-reveal ref={stageRef}>
          <div
            aria-label={pg.helperLabel}
            className="pg-helper"
            data-own-keys=""
            data-phase={phase}
            onKeyDown={onKeyDown}
            role="group"
            tabIndex={0}
          >
            <div aria-hidden="true" className="sh-grip" />
            {notice ? (
              <p className="pg-notice" role="status">
                <i aria-hidden="true">✓</i>
                {notice}
              </p>
            ) : null}
            <div aria-live="polite" className={`pg-editor${phase === "working" ? " is-working" : ""}`}>
              {phase === "review" ? (
                <span className="pg-out" key={runId}>
                  {words.map((word, index) => (
                    <span className="word" key={index} style={{ "--i": index }}>
                      {index < words.length - 1 ? `${word} ` : word}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="pg-in">{markTypos(sample.input, sample.typos)}</span>
              )}
            </div>
            <div className="pg-status">
              <div aria-hidden="true" className="sh-controls">
                <span className="sh-action" key={`a-${action}`}>
                  {copy.helper.actions[action]}
                  <ChevronIcon />
                </span>
                <span className={`sh-chip${target === "original" ? "" : " is-on"}`} key={`t-${target}`}>
                  {TARGET_CHIP[target]}
                </span>
              </div>
              <div className="pg-hints">
                {phase === "working" ? (
                  <span className="sh-working">
                    <i aria-hidden="true" />
                    {copy.helper.working}
                  </span>
                ) : phase === "review" ? (
                  <>
                    <span className="sh-muted hide-sm">{latency} ms</span>
                    <button className="hint-btn" onClick={() => void copyOutput()} type="button">
                      <kbd>↵</kbd> {copy.helper.copy}
                    </button>
                    <button className="hint-btn" onClick={back} type="button">
                      <kbd>Esc</kbd> {copy.helper.back}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="sh-muted hide-sm">
                      {sample.input.length} {copy.helper.chars}
                    </span>
                    <button className="hint-btn is-primary" onClick={() => run()} type="button">
                      <kbd>↵</kbd> {runLabel}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <ul aria-hidden="true" className="pg-keys">
            {pg.keys.map(([key, label]) => (
              <li key={key}>
                <kbd>{key}</kbd>
                {label}
              </li>
            ))}
          </ul>
          <p className="pg-note">{pg.note}</p>
        </div>

        <div className="pg-controls" data-reveal>
          <div className="pg-groups">
            <div className="pg-group">
              <span className="pg-label" id="pg-action-label">
                {pg.actionLabel}
              </span>
              <div aria-labelledby="pg-action-label" className="pg-options" role="group">
                {PLAY_ACTIONS.map((item, index) => (
                  <button
                    aria-pressed={item === action}
                    className="pg-option"
                    key={item}
                    onClick={() => chooseAction(item)}
                    type="button"
                  >
                    <kbd aria-hidden="true">{index + 1}</kbd>
                    {copy.helper.actions[item]}
                  </button>
                ))}
              </div>
            </div>
            <div className="pg-group">
              <span className="pg-label" id="pg-lang-label">
                {pg.languageLabel}
              </span>
              <div aria-labelledby="pg-lang-label" className="pg-options" role="group">
                {TARGET_ORDER.map((item) => (
                  <button
                    aria-pressed={item === target}
                    className="pg-option"
                    key={item}
                    onClick={() => chooseTarget(item)}
                    type="button"
                  >
                    <span aria-hidden="true" className="pg-chip">
                      {TARGET_CHIP[item]}
                    </span>
                    {pg.languages[item]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="pg-equation">
            <span className="eq-term">{copy.helper.actions[action]}</span>
            <span aria-hidden="true" className="eq-op">
              +
            </span>
            <span className="eq-term is-lang">{TARGET_CHIP[target]}</span>
            <span aria-hidden="true" className="eq-op">
              =
            </span>
            <span className="eq-result" key={`${action}-${target}`}>
              {pg.actionDesc[action]} {pg.languageDesc[target]}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
