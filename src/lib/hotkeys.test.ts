import { describe, expect, it } from "vitest";
import { hotkeyFromKeyboardEvent, isLikelyHotkey, normalizeHotkey } from "./hotkeys";

function keyboardEvent(code: string, init: KeyboardEventInit = {}) {
  return new KeyboardEvent("keydown", { code, ...init });
}

describe("hotkeys", () => {
  it("normalizes manually supplied accelerators", () => {
    expect(normalizeHotkey(" Ctrl + Shift + Space ")).toBe("Ctrl+Shift+Space");
    expect(isLikelyHotkey("Ctrl+Space")).toBe(true);
  });

  it("converts a physical key combination to a Tauri accelerator", () => {
    expect(
      hotkeyFromKeyboardEvent(
        keyboardEvent("Space", { ctrlKey: true, shiftKey: true }),
      ),
    ).toBe("Ctrl+Shift+Space");
  });

  it("requires a modifier and ignores modifier-only presses", () => {
    expect(hotkeyFromKeyboardEvent(keyboardEvent("KeyK"))).toBeNull();
    expect(hotkeyFromKeyboardEvent(keyboardEvent("ControlLeft", { ctrlKey: true }))).toBeNull();
  });
});
