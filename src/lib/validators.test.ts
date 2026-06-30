import { describe, expect, it } from "vitest";
import { FALLBACK_SETTINGS } from "./settings";
import { validateInput, validateSettings } from "./validators";

describe("validateInput", () => {
  it("rejects empty input", () => {
    expect(validateInput("   ")).toBe("Enter text before running an action.");
  });

  it("accepts text", () => {
    expect(validateInput("hello")).toBeNull();
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

  it("rejects temperature outside range", () => {
    expect(validateSettings({ ...FALLBACK_SETTINGS, temperature: 2.5 })).toBe(
      "Temperature must be between 0.0 and 2.0.",
    );
  });
});
