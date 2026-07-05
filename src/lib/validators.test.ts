import { describe, expect, it } from "vitest";
import { FALLBACK_SETTINGS } from "./settings";
import { validateCustomHeadersJson, validateInput, validateSettings } from "./validators";

describe("validateInput", () => {
  it("rejects empty input", () => {
    expect(validateInput("   ")).toBe("Enter text before running an action.");
  });

  it("returns Spanish validation errors", () => {
    expect(validateInput("   ", "es")).toBe("Ingresa texto antes de ejecutar una acción.");
  });

  it("accepts text", () => {
    expect(validateInput("hello")).toBeNull();
  });
});

describe("validateCustomHeadersJson", () => {
  it("accepts an empty draft", () => {
    expect(validateCustomHeadersJson("")).toBeNull();
  });

  it("accepts a JSON object with string values", () => {
    expect(validateCustomHeadersJson('{"X-Test":"yes"}')).toBeNull();
  });

  it("rejects non-object JSON", () => {
    expect(validateCustomHeadersJson("[1,2]")).toBe(
      "Custom headers must be a JSON object with string values.",
    );
  });

  it("rejects non-string header values in Spanish", () => {
    expect(validateCustomHeadersJson('{"X-Test":true}', "es")).toBe(
      "Los headers custom deben ser un objeto JSON con valores string.",
    );
  });
});

describe("validateSettings", () => {
  it("rejects missing base URL for custom HTTP", () => {
    expect(
      validateSettings({
        ...FALLBACK_SETTINGS,
        provider: "custom_http",
        baseUrl: null,
      }),
    ).toBe("Base URL is required for this provider.");
  });

  it("allows MiniMax to use its default base URL", () => {
    expect(
      validateSettings({
        ...FALLBACK_SETTINGS,
        provider: "minimax",
        baseUrl: null,
        model: "MiniMax-M3",
      }),
    ).toBeNull();
  });

  it("allows OpenRouter to use its fixed default endpoint", () => {
    expect(
      validateSettings({
        ...FALLBACK_SETTINGS,
        provider: "openrouter",
        baseUrl: null,
        model: "openrouter/auto",
      }),
    ).toBeNull();
  });

  it("rejects temperature outside range", () => {
    expect(validateSettings({ ...FALLBACK_SETTINGS, temperature: 2.5 })).toBe(
      "Temperature must be between 0.0 and 2.0.",
    );
  });
});
