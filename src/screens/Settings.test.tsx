import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_SETTINGS, SECRET_PROVIDER_API_KEY } from "../lib/settings";
import { Settings } from "./Settings";

const mocks = vi.hoisted(() => ({
  hasSecret: vi.fn(),
  registerUserHotkey: vi.fn(),
  saveSecret: vi.fn(),
  saveSettings: vi.fn(),
  testProviderConnection: vi.fn(),
}));

vi.mock("../lib/tauri", () => ({
  clearAllLocalData: vi.fn(async () => undefined),
  clearLocalHistory: vi.fn(async () => undefined),
  deleteSecret: vi.fn(async () => undefined),
  hasSecret: mocks.hasSecret,
  normalizeError: (error: unknown) =>
    typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string })
      : { message: "Unexpected error." },
  registerUserHotkey: mocks.registerUserHotkey,
  saveSecret: mocks.saveSecret,
  saveSettings: mocks.saveSettings,
  testProviderConnection: mocks.testProviderConnection,
}));

describe("Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSecret.mockResolvedValue(true);
    mocks.registerUserHotkey.mockResolvedValue(undefined);
    mocks.saveSecret.mockResolvedValue(undefined);
    mocks.saveSettings.mockResolvedValue(undefined);
    mocks.testProviderConnection.mockResolvedValue({
      ok: true,
      message: "Provider connection succeeded.",
      latencyMs: 1,
    });
  });

  it("renders required settings sections and privacy notice", () => {
    render(
      <Settings
        hasApiKey={false}
        onApiKeyChanged={vi.fn()}
        onBack={vi.fn()}
        onDataCleared={vi.fn()}
        onSettingsSaved={vi.fn()}
        settings={FALLBACK_SETTINGS}
      />,
    );

    expect(screen.getByRole("heading", { name: "General" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Shortcut" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "AI Provider" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Writing Behavior" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Privacy" })).toBeTruthy();
    expect(
      screen.getByText("Your text is sent only to the AI provider you configure."),
    ).toBeTruthy();
  });

  it("shows shortcut registration errors", async () => {
    mocks.registerUserHotkey.mockRejectedValueOnce({
      message: "This shortcut could not be registered. It may already be used by another app.",
    });

    render(
      <Settings
        hasApiKey={false}
        onApiKeyChanged={vi.fn()}
        onBack={vi.fn()}
        onDataCleared={vi.fn()}
        onSettingsSaved={vi.fn()}
        settings={FALLBACK_SETTINGS}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test shortcut" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "This shortcut could not be registered.",
    );
  });

  it("saves a typed API key before testing the provider", async () => {
    render(
      <Settings
        hasApiKey={false}
        onApiKeyChanged={vi.fn()}
        onBack={vi.fn()}
        onDataCleared={vi.fn()}
        onSettingsSaved={vi.fn()}
        settings={FALLBACK_SETTINGS}
      />,
    );

    fireEvent.change(screen.getByLabelText("API key"), {
      target: { value: "test-api-key" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Test connection" })[0]);

    expect(await screen.findByText("Provider connection succeeded.")).toBeTruthy();
    expect(mocks.saveSecret).toHaveBeenCalledWith(SECRET_PROVIDER_API_KEY, "test-api-key");
    expect(mocks.testProviderConnection).toHaveBeenCalledOnce();
  });
});
