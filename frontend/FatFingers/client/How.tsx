import { SHORTCUT_KEYS, STEP_KEYS, type Copy } from "./copy";
import { useKeyboardDemo } from "./hooks";
import { Combo } from "./Keycap";

export function HowSection({ copy, mac }: { copy: Copy; mac: boolean }) {
  const { pressed, stage } = useKeyboardDemo();
  const how = copy.how;

  return (
    <section aria-labelledby="how-title" className="how section-ink" id="como-funciona">
      <div className="section-head" data-reveal>
        <p className="kicker">{how.kicker}</p>
        <h2 className="h2" id="how-title">
          {how.title}
        </h2>
      </div>

      <p className="try">
        <i aria-hidden="true" />
        {how.tryIt}
      </p>

      <ol className="steps" data-reveal>
        {how.steps.map((item, index) => {
          const lit = stage === index + 1;
          const done = stage > index + 1;
          return (
            <li className={`step${lit ? " is-lit" : ""}${done ? " is-done" : ""}`} key={item.title}>
              <div className="step-keys">
                <Combo lit={lit} mac={mac} pressed={pressed} size="lg" tokens={STEP_KEYS[index]} tone="dark" />
                {index === 2 ? <span className="step-again">{how.again}</span> : null}
              </div>
              <span className="step-num">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          );
        })}
      </ol>

      <div className="shortcuts" data-reveal>
        <h3>{how.shortcutsTitle}</h3>
        <ul className="shortcut-list">
          {how.shortcuts.map((label, index) => (
            <li key={label}>
              <span>{label}</span>
              <Combo mac={mac} pressed={pressed} size="sm" tokens={SHORTCUT_KEYS[index]} tone="dark" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
