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

  it("submits with Enter", async () => {
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
  });

  it("replaces input with generated result, copies it, and can undo", async () => {
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

    fireEvent.change(screen.getByLabelText("Write or paste text"), {
      target: { value: "helo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledWith("Fixed text");
    });

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(screen.getByDisplayValue("helo")).toBeTruthy();
  });

  it("renders helper labels and validation in Spanish", async () => {
    renderHelper({ settings: { ...FALLBACK_SETTINGS, language: "es" } });

    expect(screen.getByRole("heading", { name: "Entrada" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ejecutar" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));

    expect(screen.getByRole("alert").textContent).toContain("Ingresa texto");

    fireEvent.change(screen.getByLabelText("Escribe o pega texto"), {
      target: { value: "hola" },
    });
    fireEvent.keyDown(screen.getByLabelText("Escribe o pega texto"), { key: "Enter" });

    expect(await screen.findByDisplayValue("Fixed text")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copiar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Deshacer" })).toBeTruthy();
  });
});

type RenderOverrides = {
  onRun?: ComponentProps<typeof Helper>["onRun"];
  onCopy?: ComponentProps<typeof Helper>["onCopy"];
  settings?: ComponentProps<typeof Helper>["settings"];
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
      settings={overrides.settings ?? FALLBACK_SETTINGS}
    />,
  );
}
