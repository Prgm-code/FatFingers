import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { ACTION_ORDER, TARGET_CHIP, TARGET_ORDER, type Copy, type DemoExample, type KeyToken } from "./copy";
import { useInView } from "./hooks";
import { ChevronIcon, GearIcon } from "./icons";
import { Keycap } from "./Keycap";

type Phase = "summon" | "select" | "lang" | "typing" | "ready" | "working" | "review" | "sent";
type Step = { phase: Phase; ms: number };

const PHASE_ORDER: Phase[] = ["summon", "select", "lang", "typing", "ready", "working", "review", "sent"];
const TAB_MS = 460;
const LANG_MS = 600;
const TYPE_MS = 34;

// Each example plays the real flow: shortcut, Tab to the action, Cmd/Ctrl+Shift+L
// to the language, type, Enter, review, Enter, paste into the source app.
function timelineFor(example: DemoExample): Step[] {
  const tabs = ACTION_ORDER.indexOf(example.action);
  const languageSteps = TARGET_ORDER.indexOf(example.target);
  const steps: Step[] = [{ phase: "summon", ms: 1200 }];
  if (tabs > 0) steps.push({ phase: "select", ms: tabs * TAB_MS + 520 });
  if (languageSteps > 0) steps.push({ phase: "lang", ms: languageSteps * LANG_MS + 480 });
  steps.push(
    { phase: "typing", ms: example.input.length * TYPE_MS + 450 },
    { phase: "ready", ms: 780 },
    { phase: "working", ms: 1250 },
    { phase: "review", ms: 2500 },
    { phase: "sent", ms: 3400 },
  );
  return steps;
}

function clock(exampleIndex: number, offset: number): string {
  return `09:${String(41 + exampleIndex * 3 + offset).padStart(2, "0")}`;
}

type Hud = { keys: KeyToken[]; label: string; id: string; delay?: "late" | "later" };

type HeroSceneProps = { copy: Copy; mac: boolean; reduceMotion: boolean };

export function HeroScene({ copy, mac, reduceMotion }: HeroSceneProps) {
  const examples = copy.demo;
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  // The tick belongs to one step; a stale value from the previous step reads as 0.
  const [tickState, setTickState] = useState({ key: "", value: 0 });
  const artRef = useRef<HTMLDivElement>(null);
  const inView = useInView(artRef);

  const example = examples[exampleIndex];
  const timeline = useMemo(() => timelineFor(example), [example]);
  const step = timeline[Math.min(stepIndex, timeline.length - 1)];
  const phase: Phase = reduceMotion ? "review" : step.phase;
  const running = inView && !reduceMotion;
  const tickKey = `${exampleIndex}:${stepIndex}`;
  const tick = tickState.key === tickKey ? tickState.value : 0;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (stepIndex < timeline.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        setExampleIndex((exampleIndex + 1) % examples.length);
        setStepIndex(0);
      }
    }, step.ms);
    return () => window.clearTimeout(timer);
  }, [running, exampleIndex, stepIndex, step.ms, timeline.length, examples.length]);

  useEffect(() => {
    if (!running) return;
    const interval = phase === "select" ? TAB_MS : phase === "lang" ? LANG_MS : phase === "typing" ? TYPE_MS : 0;
    if (!interval) return;
    const max =
      phase === "select"
        ? ACTION_ORDER.indexOf(example.action)
        : phase === "lang"
          ? TARGET_ORDER.indexOf(example.target)
          : example.input.length;
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setTickState({ key: tickKey, value: count });
      if (count >= max) window.clearInterval(timer);
    }, interval);
    return () => window.clearInterval(timer);
  }, [running, tickKey]);

  const at = PHASE_ORDER.indexOf(phase);
  const actionIndex =
    phase === "select" ? tick : at > PHASE_ORDER.indexOf("select") ? ACTION_ORDER.indexOf(example.action) : 0;
  const targetIndex =
    phase === "lang" ? tick : at > PHASE_ORDER.indexOf("lang") ? TARGET_ORDER.indexOf(example.target) : 0;
  const action = ACTION_ORDER[actionIndex];
  const target = TARGET_ORDER[targetIndex];
  const isReview = phase === "review" || phase === "sent";
  const runLabel = action === "correct" && target !== "original" ? copy.helper.translate : copy.helper.improve;
  const editorText =
    phase === "typing"
      ? example.input.slice(0, tick)
      : phase === "ready" || phase === "working"
        ? example.input
        : isReview
          ? example.output
          : "";
  const showCaret = phase === "select" || phase === "lang" || phase === "typing" || phase === "ready";
  const notice = copy.helper.copiedPaste.replace("{keys}", mac ? "⌘V" : "Ctrl+V");

  let hud: Hud | null = null;
  if (phase === "summon") hud = { keys: ["mod", "shift", "space"], label: copy.scene.hud.summon, id: `s${exampleIndex}` };
  if (phase === "select") hud = { keys: ["tab"], label: copy.scene.hud.select, id: `t${exampleIndex}-${tick}` };
  if (phase === "lang") hud = { keys: ["mod", "shift", "l"], label: copy.scene.hud.lang, id: `l${exampleIndex}-${tick}` };
  if (phase === "ready") hud = { keys: ["enter"], label: runLabel, id: `r${exampleIndex}` };
  if (phase === "review" && !reduceMotion) {
    hud = { keys: ["enter"], label: copy.scene.hud.confirm, id: `v${exampleIndex}`, delay: "late" };
  }
  if (phase === "sent") hud = { keys: ["mod", "v"], label: copy.scene.hud.paste, id: `p${exampleIndex}`, delay: "later" };

  const messages: Array<{ id: string; out: boolean; from: string; text: string; time: string; pending: boolean }> = [];
  for (let index = 0; index <= exampleIndex; index += 1) {
    const item = examples[index];
    messages.push({ id: `in-${index}`, out: false, from: item.from, text: item.incoming, time: clock(index, 0), pending: false });
    const current = index === exampleIndex;
    if (!current || phase === "sent" || reduceMotion) {
      messages.push({
        id: `out-${index}`,
        out: true,
        from: "",
        text: item.output,
        time: clock(index, 2),
        pending: current && !reduceMotion,
      });
    }
  }

  const totalMs = timeline.reduce((sum, item) => sum + item.ms, 0);
  const elapsedMs = timeline.slice(0, stepIndex + 1).reduce((sum, item) => sum + item.ms, 0);
  const progress = reduceMotion ? 100 : Math.round((elapsedMs / totalMs) * 1000) / 10;

  function jump(index: number) {
    setExampleIndex(index);
    setStepIndex(0);
    setTickState({ key: "", value: 0 });
  }

  return (
    <div className="scene">
      <p className="sr-only">{copy.hero.sceneDescription}</p>
      <p className="sr-only">
        {example.label}. {copy.hero.exampleBefore} {example.input} {copy.hero.exampleAfter} {example.output}
      </p>
      <div aria-hidden="true" className="scene-art" data-phase={phase} ref={artRef}>
        <div className="scene-deco">
          <div className="scene-disc" />
          <div className="scene-orbit orbit-a" />
          <div className="scene-orbit orbit-b" />
        </div>

        <div className="chat">
          <div className="win-bar">
            <span className="win-dots">
              <i />
              <i />
              <i />
            </span>
            <span>{copy.scene.app}</span>
          </div>
          <div className="chat-head">
            <span className="chat-hash">#</span>
            <span>
              <strong>{copy.scene.channel}</strong>
              <small>{copy.scene.members}</small>
            </span>
          </div>
          <div className="chat-log">
            {messages.map((message) => (
              <div
                className={`bubble ${message.out ? "bubble-out" : "bubble-in"}${message.pending ? " is-pending" : ""}`}
                key={message.id}
              >
                {message.out ? null : <span className="bubble-avatar">{message.from.slice(0, 1)}</span>}
                <div className="bubble-body">
                  {message.out ? null : <b>{message.from}</b>}
                  <p>{message.text}</p>
                  <time>{message.time}</time>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-compose">
            {phase === "summon" ? <i className="compose-caret" /> : null}
            <span className="compose-placeholder">{copy.scene.compose}</span>
            <span className="compose-paste">{example.output}</span>
          </div>
        </div>

        <div className="scene-helper" data-review={String(isReview)} data-visible={String(phase !== "summon")}>
          <div className="sh-grip" />
          <span className="sh-close">×</span>
          {phase === "sent" ? (
            <p className="sh-notice">
              <i>✓</i>
              {notice}
            </p>
          ) : null}
          <p
            className={`sh-editor${phase === "working" ? " is-working" : ""}${isReview ? " is-review" : ""}`}
            key={isReview ? `out-${exampleIndex}` : "in"}
          >
            {editorText ? editorText : <span className="sh-placeholder">{copy.helper.placeholder}</span>}
            {showCaret ? <span className="caret" /> : null}
          </p>
          <div className="sh-status">
            <div className="sh-controls">
              <span className="sh-action" key={`a-${action}`}>
                {copy.helper.actions[action]}
                <ChevronIcon />
              </span>
              <span className={`sh-chip${target === "original" ? "" : " is-on"}`} key={`t-${target}`}>
                {TARGET_CHIP[target]}
              </span>
            </div>
            <div className="sh-hints">
              {phase === "working" ? (
                <span className="sh-working">
                  <i />
                  {copy.helper.working}
                </span>
              ) : isReview ? (
                <>
                  <span className="sh-muted">{example.latency} ms</span>
                  <span>
                    <kbd className={phase === "review" && !reduceMotion ? "is-pulse-late" : ""}>↵</kbd> {copy.helper.copyClose}
                  </span>
                  <span className="hide-sm">
                    <kbd>{mac ? "⌘Z" : "Ctrl Z"}</kbd> {copy.helper.undo}
                  </span>
                </>
              ) : (
                <>
                  {editorText ? (
                    <span className="sh-muted hide-sm">
                      {editorText.length} {copy.helper.chars}
                    </span>
                  ) : null}
                  <span>
                    <kbd className={phase === "ready" ? "is-pulse" : ""}>↵</kbd> {runLabel}
                  </span>
                  <span className="hide-sm">
                    <kbd>Esc</kbd> {copy.helper.close}
                  </span>
                </>
              )}
              <span className="sh-gear">
                <GearIcon />
              </span>
            </div>
          </div>
        </div>

        {hud ? (
          <div className={`hud${hud.delay ? ` is-${hud.delay}` : ""}`} key={hud.id}>
            <span className="hud-keys">
              {hud.keys.map((token) => (
                <Keycap key={token} mac={mac} size="sm" token={token} />
              ))}
            </span>
            <span className="hud-label">{hud.label}</span>
          </div>
        ) : null}
      </div>

      <div aria-label={copy.hero.examplesLabel} className="rail" role="group">
        {examples.map((item, index) => {
          const active = index === exampleIndex;
          return (
            <button aria-pressed={active} className="rail-item" key={item.label} onClick={() => jump(index)} type="button">
              <span className="rail-num">0{index + 1}</span>
              <span className="rail-label">{item.label}</span>
              <span aria-hidden="true" className="rail-bar">
                <i
                  style={
                    active
                      ? { width: `${progress}%`, transitionDuration: `${running ? step.ms : 0}ms` }
                      : { width: "0%", transitionDuration: "0ms" }
                  }
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
