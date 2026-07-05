import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  CUSTOM_MODEL_VALUE,
  FALLBACK_SETTINGS,
  MINIMAX_BASE_URL,
  OPENAI_RESPONSES_URL,
  OPENROUTER_CHAT_COMPLETIONS_URL,
} from "../lib/settings";
import { ProviderForm } from "./ProviderForm";

function renderProviderForm(
  overrides: Partial<Parameters<typeof ProviderForm>[0]> = {},
) {
  const props: Parameters<typeof ProviderForm>[0] = {
    apiKeyDraft: "",
    customHeadersDraft: "",
    hasApiKey: false,
    isTesting: false,
    onApiKeyDraftChange: vi.fn(),
    onClearApiKey: vi.fn(),
    onClearCustomHeaders: vi.fn(),
    onCustomHeadersDraftChange: vi.fn(),
    onSaveApiKey: vi.fn(),
    onSaveCustomHeaders: vi.fn(),
    onSettingsChange: vi.fn(),
    onTestConnection: vi.fn(),
    settings: FALLBACK_SETTINGS,
    ...overrides,
  };

  render(<ProviderForm {...props} />);
  return props;
}

describe("ProviderForm", () => {
  it("shows the OpenAI Responses URL and current model choices", () => {
    renderProviderForm();

    const baseUrlInput = screen.getByLabelText("Base URL") as HTMLInputElement;
    const modelSelect = screen.getByLabelText("Model") as HTMLSelectElement;
    const modelLabels = Array.from(modelSelect.options).map((option) => option.text);

    expect(baseUrlInput.value).toBe(OPENAI_RESPONSES_URL);
    expect(baseUrlInput.hasAttribute("readonly")).toBe(true);
    expect(modelLabels).toContain("GPT-5.5");
    expect(modelLabels).toContain("GPT-5.4 mini");
    expect(modelLabels).toContain("Custom model...");
  });

  it("keeps custom OpenAI model IDs editable", () => {
    renderProviderForm({
      settings: {
        ...FALLBACK_SETTINGS,
        model: "gpt-custom-private",
      },
    });

    const customModelInput = screen.getByLabelText("Custom model ID") as HTMLInputElement;

    expect((screen.getByLabelText("Model") as HTMLSelectElement).value).toBe(
      CUSTOM_MODEL_VALUE,
    );
    expect(customModelInput.value).toBe("gpt-custom-private");
  });

  it("switches OpenAI model selection into custom mode", () => {
    const onSettingsChange = vi.fn();
    renderProviderForm({ onSettingsChange });

    fireEvent.change(screen.getByLabelText("Model"), {
      target: { value: CUSTOM_MODEL_VALUE },
    });

    expect(onSettingsChange).toHaveBeenCalledWith({
      ...FALLBACK_SETTINGS,
      model: "",
    });
  });

  it("sets MiniMax defaults when selecting the MiniMax provider", () => {
    const onSettingsChange = vi.fn();
    renderProviderForm({ onSettingsChange });

    fireEvent.change(screen.getByLabelText("Provider type"), {
      target: { value: "minimax" },
    });

    expect(onSettingsChange).toHaveBeenCalledWith({
      ...FALLBACK_SETTINGS,
      provider: "minimax",
      baseUrl: MINIMAX_BASE_URL,
      model: "MiniMax-M3",
    });
  });

  it("sets OpenRouter defaults when selecting the OpenRouter provider", () => {
    const onSettingsChange = vi.fn();
    renderProviderForm({ onSettingsChange });

    fireEvent.change(screen.getByLabelText("Provider type"), {
      target: { value: "openrouter" },
    });

    expect(onSettingsChange).toHaveBeenCalledWith({
      ...FALLBACK_SETTINGS,
      provider: "openrouter",
      baseUrl: null,
      model: "openrouter/auto",
    });
  });

  it("shows the fixed OpenRouter Chat Completions URL", () => {
    renderProviderForm({
      settings: {
        ...FALLBACK_SETTINGS,
        provider: "openrouter",
        baseUrl: null,
        model: "openrouter/auto",
      },
    });

    const baseUrlInput = screen.getByLabelText("Base URL") as HTMLInputElement;

    expect(baseUrlInput.value).toBe(OPENROUTER_CHAT_COMPLETIONS_URL);
    expect(baseUrlInput.hasAttribute("readonly")).toBe(true);
    expect((screen.getByLabelText("Model") as HTMLInputElement).value).toBe(
      "openrouter/auto",
    );
  });

  it("exposes a clear headers action", () => {
    const onClearCustomHeaders = vi.fn();
    renderProviderForm({ onClearCustomHeaders });

    fireEvent.click(screen.getByRole("button", { name: "Clear headers" }));

    expect(onClearCustomHeaders).toHaveBeenCalledOnce();
  });

  it("shows the selected MiniMax model after changing provider", () => {
    render(<ControlledProviderForm />);

    fireEvent.change(screen.getByLabelText("Provider type"), {
      target: { value: "minimax" },
    });

    expect((screen.getByLabelText("Model") as HTMLInputElement).value).toBe("MiniMax-M3");
    expect((screen.getByLabelText("Base URL") as HTMLInputElement).value).toBe(
      MINIMAX_BASE_URL,
    );
  });
});

function ControlledProviderForm() {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);

  return (
    <ProviderForm
      apiKeyDraft=""
      customHeadersDraft=""
      hasApiKey={false}
      isTesting={false}
      onApiKeyDraftChange={vi.fn()}
      onClearApiKey={vi.fn()}
      onClearCustomHeaders={vi.fn()}
      onCustomHeadersDraftChange={vi.fn()}
      onSaveApiKey={vi.fn()}
      onSaveCustomHeaders={vi.fn()}
      onSettingsChange={setSettings}
      onTestConnection={vi.fn()}
      settings={settings}
    />
  );
}
