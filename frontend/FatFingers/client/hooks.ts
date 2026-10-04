import { useEffect, useState } from "preact/hooks";
import type { KeyToken } from "./copy";

export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,300;1,6..72,400&display=swap";

export const IS_MAC =
  typeof navigator !== "undefined" && /mac|iphone|ipad|ipod/i.test(`${navigator.platform} ${navigator.userAgent}`);

// Runs once when the bundle loads, before the first render, so fonts start
// downloading early and reveal styles apply without a flash of content.
export function installHead() {
  if (typeof document === "undefined" || document.getElementById("ff-fonts")) return;

  const addLink = (attributes: Record<string, string>) => {
    const link = document.createElement("link");
    for (const [name, value] of Object.entries(attributes)) link.setAttribute(name, value);
    document.head.appendChild(link);
  };

  addLink({ rel: "preconnect", href: "https://fonts.googleapis.com" });
  addLink({ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" });
  addLink({ rel: "stylesheet", href: FONT_HREF, id: "ff-fonts" });
  document.documentElement.classList.add("js-reveal");
}

let fontsPromise: Promise<void> | null = null;

// Resolves when the display fonts are usable, or after a timeout so a blocked
// font request never stalls the headline animation.
export function fontsReady(timeoutMs = 1800): Promise<void> {
  if (fontsPromise) return fontsPromise;

  const link = document.getElementById("ff-fonts") as HTMLLinkElement | null;
  const sheetLoaded = new Promise<void>((resolve) => {
    if (!link || link.sheet) {
      resolve();
      return;
    }
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => resolve(), { once: true });
  });
  const loaded = sheetLoaded
    .then(() =>
      Promise.all([document.fonts.load("600 100px Manrope"), document.fonts.load("italic 300 100px Newsreader")]),
    )
    .then(
      () => undefined,
      () => undefined,
    );

  fontsPromise = Promise.race([loaded, new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs))]);
  return fontsPromise;
}

export function useReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduce, setReduce] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setReduce(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduce;
}

export function useInView(ref: { current: Element | null }, rootMargin = "0px"): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

export function useScrolled(threshold = 12): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}

// Marks [data-reveal] elements with data-in once they scroll into view. The
// attribute is not a Preact prop, so re-renders never remove it.
export function useReveal(dependency: unknown) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])"));
    if (typeof IntersectionObserver === "undefined") {
      for (const element of elements) element.setAttribute("data-in", "");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [dependency]);
}

const MODIFIER_TOKENS: KeyToken[] = ["mod", "shift"];

function tokenFromEvent(event: KeyboardEvent): KeyToken | null {
  switch (event.key) {
    case "Meta":
    case "Control":
    case "OS":
      return "mod";
    case "Shift":
      return "shift";
    case "Enter":
      return "enter";
    case "Tab":
      return "tab";
    case "Escape":
      return "esc";
    case ",":
      return "comma";
  }
  if (event.code === "Space") return "space";
  if (/^[1-5]$/.test(event.key)) return "digits";
  const letter = event.key.length === 1 ? event.key.toLowerCase() : "";
  if (letter === "l" || letter === "z" || letter === "c" || letter === "n" || letter === "v") return letter;
  return null;
}

function ownsKeys(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable], [data-own-keys]"));
}

function activatesControl(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("a, button, summary, [role='button']"));
}

// Tracks which keys the visitor is holding, and walks through the three-step
// flow: Cmd/Ctrl+Shift+Space opens, Enter improves, a second Enter confirms.
export function useKeyboardDemo(): { pressed: ReadonlySet<KeyToken>; stage: number } {
  const [pressed, setPressed] = useState<ReadonlySet<KeyToken>>(() => new Set());
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const held = new Set<KeyToken>();
    const releaseTimers = new Map<KeyToken, number>();
    let stageTimer = 0;
    let currentStage = 0;
    let lastEnter = 0;

    const commit = () => setPressed(new Set(held));
    const release = (token: KeyToken) => {
      window.clearTimeout(releaseTimers.get(token));
      releaseTimers.delete(token);
      if (held.delete(token)) commit();
    };
    const releaseAll = () => {
      releaseTimers.forEach((id) => window.clearTimeout(id));
      releaseTimers.clear();
      held.clear();
      commit();
    };
    const moveTo = (next: number) => {
      currentStage = next;
      setStage(next);
      window.clearTimeout(stageTimer);
      stageTimer = window.setTimeout(() => {
        currentStage = 0;
        setStage(0);
      }, 4500);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (ownsKeys(event.target)) return;
      const token = tokenFromEvent(event);
      if (token) {
        if (!held.has(token)) {
          held.add(token);
          commit();
        }
        // Browsers drop keyup events for letters while Cmd is held on macOS,
        // so non-modifier keys release themselves after a moment.
        if (!MODIFIER_TOKENS.includes(token)) {
          window.clearTimeout(releaseTimers.get(token));
          releaseTimers.set(token, window.setTimeout(() => release(token), 900));
        }
      }

      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        moveTo(1);
        return;
      }
      if (event.key === "Enter" && !event.shiftKey && !mod && !event.repeat && !activatesControl(event.target)) {
        const now = performance.now();
        moveTo(currentStage === 2 && now - lastEnter < 4500 ? 3 : 2);
        lastEnter = now;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const token = tokenFromEvent(event);
      if (!token) return;
      if (token === "mod") releaseAll();
      else release(token);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
      releaseTimers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(stageTimer);
    };
  }, []);

  return { pressed, stage };
}
