import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_SETTINGS, SECRET_PROVIDER_API_KEY } from "../lib/settings";
import { Settings } from "./Settings";

const mocks = vi.hoisted(() => ({
  clearLocalHistory: vi.fn(),
  getPasteCapability: vi.fn(),
  hasSecret: vi.fn(),
  saveSecret: vi.fn(),
  saveSettings: vi.fn(),
  testUserHotkey: vi.fn(),
  testProviderConnection: vi.fn(),
}));

vi.mock("../lib/tauri", () => ({
  clearAllLocalData: vi.fn(async () => undefined),
  clearLocalHistory: mocks.clearLocalHistory,
  deleteSecret: vi.fn(async () => undefined),
  getPasteCapability: mocks.getPasteCapability,
  hasSecret: mocks.hasSecret,
  normalizeError: (error: unknown) =>
    typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string })
      : { message: "Unexpected error." },
  saveSecret: mocks.saveSecret,
  saveSettings: mocks.saveSettings,
  testUserHotkey: mocks.testUserHotkey,
  testProviderConnection: mocks.testProviderConnection,
}));

function renderSettings() {
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
}

describe("Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clearLocalHistory.mockResolvedValue(undefined);
    mocks.getPasteCapability.mockResolvedValue("clipboard_only");
    mocks.hasSecret.mockResolvedValue(true);
    mocks.testUserHotkey.mockResolvedValue(undefined);
    mocks.saveSecret.mockResolvedValue(undefined);
    mocks.saveSettings.mockResolvedValue(undefined);
    mocks.testProviderConnection.mockResolvedValue({
      ok: true,
      message: "Provider connection succeeded.",
      latencyMs: 1,
    });
  });

  it("renders section navigation, general panel, and privacy notice", async () => {
    renderSettings();

    expect(screen.getByRole("button", { name: "General" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Shortcut" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "AI Provider" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Writing Behavior" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Privacy" })).toBeTruthy();

    expect(screen.getByRole("heading", { name: "General" })).toBeTruthy();
    expect(screen.getByLabelText("Interface language")).toBeTruthy();
    expect(screen.getByLabelText("After improving, Enter will")).toBeTruthy();
    expect(await screen.findByText(/Automatic paste is not available/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Privacy" }));
    expect(screen.getByRole("heading", { name: "Privacy" })).toBeTruthy();
    expect(
      screen.getByText("Your text is sent only to the AI provider you configure."),
    ).toBeTruthy();
  });

  it("updates visible labels when switching to Spanish and saves language", async () => {
    renderSettings();

    fireEvent.change(screen.getByLabelText("Interface language"), {
      target: { value: "es" },
    });

    expect(screen.getByRole("button", { name: "Privacidad" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Guardar configuración" }));

    expect(await screen.findByText("Configuración guardada.")).toBeTruthy();
    expect(mocks.saveSettings).toHaveBeenCalledWith({
      ...FALLBACK_SETTINGS,
      language: "es",
    });
  });

  it("shows shortcut registration errors", async () => {
    mocks.testUserHotkey.mockRejectedValueOnce({
      message: "This shortcut could not be registered. It may already be used by another app.",
    });

    renderSettings();

    fireEvent.click(screen.getByRole("button", { name: "Shortcut" }));
    fireEvent.click(screen.getByRole("button", { name: "Test shortcut" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "This shortcut could not be registered.",
    );
  });

  it("saves a typed API key before testing the provider", async () => {
    renderSettings();

    fireEvent.click(screen.getByRole("button", { name: "AI Provider" }));
    fireEvent.change(screen.getByLabelText("API key"), {
      target: { value: "test-api-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Test connection" }));

    expect(await screen.findByText("Provider connection succeeded.")).toBeTruthy();
    expect(mocks.saveSecret).toHaveBeenCalledWith(SECRET_PROVIDER_API_KEY, "test-api-key");
    expect(mocks.testProviderConnection).toHaveBeenCalledOnce();
  });

  it("persists a typed API key with the footer save button", async () => {
    renderSettings();

    fireEvent.click(screen.getByRole("button", { name: "AI Provider" }));
    fireEvent.change(screen.getByLabelText("API key"), {
      target: { value: "typed-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

    expect(await screen.findByText("Settings saved.")).toBeTruthy();
    expect(mocks.saveSettings).toHaveBeenCalledWith(FALLBACK_SETTINGS);
    expect(mocks.saveSecret).toHaveBeenCalledWith(SECRET_PROVIDER_API_KEY, "typed-key");
  });

  it("requires a second click before clearing local history", async () => {
    renderSettings();

    fireEvent.click(screen.getByRole("button", { name: "Privacy" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear local history" }));

    expect(mocks.clearLocalHistory).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm clear?" }));

    expect(await screen.findByText("Local history cleared.")).toBeTruthy();
    expect(mocks.clearLocalHistory).toHaveBeenCalledOnce();
  });
});
