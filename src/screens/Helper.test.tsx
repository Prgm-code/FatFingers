import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { FALLBACK_SETTINGS } from "../lib/settings";
import { Helper } from "./Helper";

describe("Helper", () => {
  it("shows a local error for empty input", () => {
    renderHelper();

    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    expect(screen.getByRole("alert").textContent).toContain("Enter text");
  });

  it("submits with Ctrl+Enter", async () => {
    const onRun = vi.fn(async () => ({
      outputText: "Fixed text",
      provider: "openai",
      model: "model",
      latencyMs: 10,
    }));
    renderHelper({ onRun });

    const input = screen.getByLabelText("Text to rewrite");
    fireEvent.change(input, { target: { value: "helo" } });
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });

    await waitFor(() => {
      expect(onRun).toHaveBeenCalledWith("helo", "correct");
    });
  });

  it("copies generated result", async () => {
    const onCopy = vi.fn(async () => undefined);
    renderHelper({
      onCopy,
      onRun: async () => ({
        outputText: "Fixed text",
        provider: "openai",
        model: "model",
        latencyMs: 10,
      }),
    });

    fireEvent.change(screen.getByLabelText("Text to rewrite"), {
      target: { value: "helo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    await screen.findByText("Fixed text");
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledWith("Fixed text");
    });
  });
});

type RenderOverrides = {
  onRun?: ComponentProps<typeof Helper>["onRun"];
  onCopy?: ComponentProps<typeof Helper>["onCopy"];
};

function renderHelper(overrides: RenderOverrides = {}) {
  return render(
    <Helper
      onClose={vi.fn()}
      onCopy={overrides.onCopy ?? vi.fn(async () => undefined)}
      onOpenSettings={vi.fn()}
      onRun={
        overrides.onRun ??
        vi.fn(async () => ({
          outputText: "Fixed text",
          provider: "openai",
          model: "model",
          latencyMs: 10,
        }))
      }
      settings={FALLBACK_SETTINGS}
    />,
  );
}
