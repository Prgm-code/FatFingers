import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { FALLBACK_SETTINGS } from "../lib/settings";
import { Helper } from "./Helper";

describe("Helper", () => {
  it("shows a local error for empty input", () => {
    renderHelper();

    fireEvent.keyDown(screen.getByLabelText("Write or paste text"), { key: "Enter" });

    expect(screen.getByRole("alert").textContent).toContain("Enter text");
  });

  it("improves with Enter and shows review hints", async () => {
    const onRun = vi.fn(async () => ({
      outputText: "Fixed text",
      provider: "openai",
      model: "model",
      latencyMs: 10,
    }));
    renderHelper({ onRun });

    const input = screen.getByLabelText("Write or paste text");
    fireEvent.change(input, { target: { value: "helo" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onRun).toHaveBeenCalledWith("helo", "correct");
    });
    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();
    expect(screen.getByText("Copy & close")).toBeTruthy();
  });

  it("copies and shows the paste notice on the second Enter in clipboard mode", async () => {
    const onCopy = vi.fn(async () => undefined);
    renderHelper({ onCopy });

    const input = screen.getByLabelText("Write or paste text");
    fireEvent.change(input, { target: { value: "helo" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();

    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledWith("Fixed text");
    });
    expect(screen.getByRole("status").textContent).toContain("Copied");
  });

  it("pastes into the previous app on the second Enter in auto-paste mode", async () => {
    const onPaste = vi.fn(async () => ({ method: "simulated" as const }));
    const onRun = vi.fn(async () => ({
      outputText: "Fixed text",
      provider: "openai",
      model: "model",
      latencyMs: 10,
    }));
    renderHelper({
      onPaste,
      onRun,
      settings: { ...FALLBACK_SETTINGS, pasteBehavior: "auto_paste" },
    });

    const input = screen.getByLabelText("Write or paste text");
    fireEvent.change(input, { target: { value: "helo" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();

    fireEvent.change(input, { target: { value: "Fixed text edited" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onPaste).toHaveBeenCalledWith("Fixed text edited");
    });
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("shows the copied notice when auto-paste falls back to clipboard", async () => {
    const onPaste = vi.fn(async () => ({ method: "clipboard_only" as const }));
    renderHelper({
      onPaste,
      settings: { ...FALLBACK_SETTINGS, pasteBehavior: "auto_paste" },
    });

    const input = screen.getByLabelText("Write or paste text");
    fireEvent.change(input, { target: { value: "helo" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();

    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain("Copied");
    });
  });

  it("re-improves with Cmd/Ctrl+Enter during review and undoes with Cmd/Ctrl+Z", async () => {
    const onRun = vi.fn(async () => ({
      outputText: "Fixed text",
      provider: "openai",
      model: "model",
      latencyMs: 10,
    }));
    renderHelper({ onRun });

    const input = screen.getByLabelText("Write or paste text");
    fireEvent.change(input, { target: { value: "helo" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();

    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    await waitFor(() => {
      expect(onRun).toHaveBeenCalledTimes(2);
    });

    fireEvent.keyDown(input, { key: "z", ctrlKey: true });
    expect(screen.getByDisplayValue("Fixed text")).toBeTruthy();
  });

  it("clears previous result when a new helper session starts", async () => {
    const { rerender } = renderHelper({ sessionId: 0 });

    const input = screen.getByLabelText("Write or paste text");
    fireEvent.change(input, { target: { value: "helo" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();
    expect(screen.getByText("Copy & close")).toBeTruthy();

    rerender(
      <Helper
        onClose={vi.fn()}
        onCopy={vi.fn(async () => undefined)}
        onOpenSettings={vi.fn()}
        onPaste={vi.fn(async () => ({ method: "simulated" as const }))}
        onRun={vi.fn(async () => ({
          outputText: "Fixed text",
          provider: "openai",
          model: "model",
          latencyMs: 10,
        }))}
        sessionId={1}
        settings={FALLBACK_SETTINGS}
      />,
    );

    await waitFor(() => {
      expect((screen.getByLabelText("Write or paste text") as HTMLTextAreaElement).value).toBe("");
      expect(screen.queryByText("Copy & close")).toBeNull();
    });
  });

  it("renders helper labels and validation in Spanish", async () => {
    renderHelper({ settings: { ...FALLBACK_SETTINGS, language: "es" } });

    const input = screen.getByLabelText("Escribe o pega texto");
    expect(screen.getByText("Mejorar")).toBeTruthy();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("alert").textContent).toContain("Ingresa texto");

    fireEvent.change(input, { target: { value: "hola" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();
    expect(screen.getByText("Copiar y cerrar")).toBeTruthy();
  });
});

type RenderOverrides = {
  onRun?: ComponentProps<typeof Helper>["onRun"];
  onCopy?: ComponentProps<typeof Helper>["onCopy"];
  onPaste?: ComponentProps<typeof Helper>["onPaste"];
  settings?: ComponentProps<typeof Helper>["settings"];
  sessionId?: ComponentProps<typeof Helper>["sessionId"];
};

function renderHelper(overrides: RenderOverrides = {}) {
  return render(
    <Helper
      onClose={vi.fn()}
      onCopy={overrides.onCopy ?? vi.fn(async () => undefined)}
      onOpenSettings={vi.fn()}
      onPaste={overrides.onPaste ?? vi.fn(async () => ({ method: "simulated" as const }))}
      onRun={
        overrides.onRun ??
        vi.fn(async () => ({
          outputText: "Fixed text",
          provider: "openai",
          model: "model",
          latencyMs: 10,
        }))
      }
      sessionId={overrides.sessionId ?? 0}
      settings={overrides.settings ?? FALLBACK_SETTINGS}
    />,
  );
}
