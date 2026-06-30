import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_SETTINGS, SECRET_PROVIDER_API_KEY } from "../lib/settings";
import { Onboarding } from "./Onboarding";

const mocks = vi.hoisted(() => ({
  deleteSecret: vi.fn(),
  hasSecret: vi.fn(),
  registerUserHotkey: vi.fn(),
  saveSecret: vi.fn(),
  saveSettings: vi.fn(),
  testProviderConnection: vi.fn(),
}));

vi.mock("../lib/tauri", () => ({
  deleteSecret: mocks.deleteSecret,
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

describe("Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteSecret.mockResolvedValue(undefined);
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

  it("renders provider and shortcut setup", () => {
    render(
      <Onboarding
        hasApiKey={false}
        onFinish={vi.fn()}
        settings={FALLBACK_SETTINGS}
      />,
    );

    expect(screen.getByRole("heading", { name: "Provider" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Shortcut" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Finish" })).toBeTruthy();
  });

  it("marks the API key as saved after saving it", async () => {
    render(
      <Onboarding
        hasApiKey={false}
        onFinish={vi.fn()}
        settings={FALLBACK_SETTINGS}
      />,
    );

    fireEvent.change(screen.getByLabelText("API key"), {
      target: { value: "test-api-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save API key" }));

    expect(await screen.findByText("API key saved.")).toBeTruthy();
    expect(mocks.saveSecret).toHaveBeenCalledWith(SECRET_PROVIDER_API_KEY, "test-api-key");
    expect((screen.getByLabelText("API key") as HTMLInputElement).value).toBe("");
    expect(screen.getByPlaceholderText("Saved key exists")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Clear API key" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it("saves a typed API key before testing the provider", async () => {
    render(
      <Onboarding
        hasApiKey={false}
        onFinish={vi.fn()}
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
