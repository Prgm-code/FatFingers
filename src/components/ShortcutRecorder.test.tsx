import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShortcutRecorder } from "./ShortcutRecorder";

describe("ShortcutRecorder", () => {
  it("captures and confirms a shortcut without editing text", () => {
    const onChange = vi.fn();
    render(
      <ShortcutRecorder
        onChange={onChange}
        onReset={vi.fn()}
        onTest={vi.fn()}
        value="Ctrl+Shift+Space"
      />,
    );

    expect(screen.getByLabelText("Current shortcut")).toHaveProperty("readOnly", true);
    fireEvent.click(screen.getByRole("button", { name: "Change shortcut" }));

    const captureArea = screen.getByLabelText("Press the key combination you want to use.");
    fireEvent.keyDown(captureArea, {
      code: "KeyK",
      key: "k",
      ctrlKey: true,
      shiftKey: true,
    });

    expect(screen.getByText("Ctrl")).toBeTruthy();
    expect(screen.getByText("Shift")).toBeTruthy();
    expect(screen.getByText("K")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Use shortcut" }));

    expect(onChange).toHaveBeenCalledWith("Ctrl+Shift+K");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cancels capture with Escape without changing the shortcut", () => {
    const onChange = vi.fn();
    render(
      <ShortcutRecorder
        onChange={onChange}
        onReset={vi.fn()}
        onTest={vi.fn()}
        value="Ctrl+Shift+Space"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Change shortcut" }));
    fireEvent.keyDown(
      screen.getByLabelText("Press the key combination you want to use."),
      { code: "Escape", key: "Escape" },
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
