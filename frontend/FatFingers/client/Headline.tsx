import { useEffect, useRef, useState } from "preact/hooks";
import type { Language } from "./copy";
import { fontsReady } from "./hooks";

// A word is split so that each typo is a pair of transposed letters. The DOM
// keeps the correct order; the typo is drawn by offsetting the pair.
type Part = string | readonly [string, string];
type Word = { parts: readonly Part[]; tail?: string };

const FIRST_LINE: Record<Language, Word[]> = {
  es: [{ parts: ["Esc", ["r", "i"], "be"] }, { parts: ["ráp", ["i", "d"], "o"], tail: "." }],
  en: [{ parts: ["W", ["r", "i"], "te"] }, { parts: ["f", ["a", "s"], "t"], tail: "." }],
};

type State = "wait" | "typo" | "fixing" | "fixed";

type HeadlineProps = {
  id: string;
  language: Language;
  line1: string;
  line2: string;
  reduceMotion: boolean;
};

export function Headline({ id, language, line1, line2, reduceMotion }: HeadlineProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<State>(reduceMotion ? "fixed" : "wait");

  useEffect(() => {
    if (reduceMotion) {
      setState("fixed");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    void fontsReady().then(() => {
      const root = rootRef.current;
      if (cancelled || !root) return;

      // Measure each pair and shift both letters into each other's slot. The
      // offsets are stored in em so they survive a resize mid-animation.
      const fontSize = Number.parseFloat(window.getComputedStyle(root).fontSize) || 1;
      root.querySelectorAll<HTMLElement>(".hl-swap-a").forEach((first) => {
        const second = first.nextElementSibling as HTMLElement | null;
        if (!second) return;
        first.style.setProperty("--dx", `${second.getBoundingClientRect().width / fontSize}em`);
        second.style.setProperty("--dx", `${-first.getBoundingClientRect().width / fontSize}em`);
      });

      setState("typo");
      timers.push(window.setTimeout(() => setState("fixing"), 1500));
      timers.push(window.setTimeout(() => setState("fixed"), 2500));
    });

    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [reduceMotion]);

  return (
    <h1 className="hl" data-state={state} id={id} ref={rootRef}>
      <span className="sr-only">
        {line1} {line2}
      </span>
      <span aria-hidden="true" className="hl-visual">
        <span className="hl-line hl-line-1">
          {FIRST_LINE[language].map((word, wordIndex) => (
            <span key={wordIndex}>
              {wordIndex > 0 ? " " : null}
              <span className="hl-word" style={{ "--wd": `${wordIndex * 140}ms` }}>
                {word.parts.map((part, partIndex) =>
                  typeof part === "string" ? (
                    <span key={partIndex}>{part}</span>
                  ) : (
                    <span className="hl-pair" key={partIndex}>
                      <span className="hl-swap hl-swap-a">{part[0]}</span>
                      <span className="hl-swap hl-swap-b">{part[1]}</span>
                    </span>
                  ),
                )}
              </span>
              {word.tail}
            </span>
          ))}
        </span>
        <span className="hl-line hl-line-2">{line2}</span>
      </span>
    </h1>
  );
}
