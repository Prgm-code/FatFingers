import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  CUSTOM_MODEL_VALUE,
  FALLBACK_SETTINGS,
  OPENAI_RESPONSES_URL,
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
});
