import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Helper } from "./screens/Helper";
import { Onboarding } from "./screens/Onboarding";
import { Settings } from "./screens/Settings";
import { About } from "./screens/About";
import { FALLBACK_SETTINGS, SECRET_PROVIDER_API_KEY } from "./lib/settings";
import { t } from "./lib/i18n";
import {
  copyToClipboard,
  correctText,
  getSettings,
  getRuntimeStatus,
  hasSecret,
  hideHelperWindow,
  hideSettingsWindow,
  closeOnboardingWindow,
  normalizeError,
  pasteBack,
  showHelperWindow,
  showOnboardingWindow,
  showSettingsWindow,
} from "./lib/tauri";
import type { AppSettings, PasteBackOutcome, View } from "./types/app";
import type { CorrectTextResponse, WritingAction } from "./types/llm";
import "./styles/globals.css";

async function loadSettingsSnapshot(): Promise<{
  settings: AppSettings;
  hasApiKey: boolean;
  shortcutRegistered: boolean;
}> {
  const [settings, hasApiKey, runtimeStatus] = await Promise.all([
    getSettings(),
    hasSecret(SECRET_PROVIDER_API_KEY),
    getRuntimeStatus(),
  ]);

  return { settings, hasApiKey, shortcutRegistered: runtimeStatus.shortcutRegistered };
}

function App() {
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  const requestedView = new URLSearchParams(window.location.search).get("view");
  const isSettingsWindow = requestedView === "settings";
  const isOnboardingWindow = requestedView === "onboarding";
  const [view, setView] = useState<View>(
    isSettingsWindow ? "settings" : isOnboardingWindow ? "onboarding" : "helper",
  );
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [helperSessionId, setHelperSessionId] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const snapshot = await loadSettingsSnapshot();

        if (!isMounted) {
          return;
        }

        setSettings(snapshot.settings);
        setHasApiKey(snapshot.hasApiKey);
        setStartupError(
          snapshot.shortcutRegistered
            ? null
            : t(snapshot.settings.language, "shortcutUnavailable"),
        );
        if (!isSettingsWindow && !isOnboardingWindow && !snapshot.hasApiKey) {
          // First launch: onboarding lives in its own framed window instead of
          // the compact frameless helper.
          void showOnboardingWindow();
          void hideHelperWindow();
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStartupError(normalizeError(error).message);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    // The frameless helper window is transparent; only the helper view draws
    // its own rounded card, every other view needs the opaque background.
    document.body.dataset.view = view;
  }, [view]);

  useEffect(() => {
    const unlistenSettings = listen("fatfingers://open-settings", () => {
      if (!isOnboardingWindow) {
        setView("settings");
      }
    });
    const unlistenUpdatedSettings = listen<AppSettings>(
      "fatfingers://settings-updated",
      async (event) => {
        setSettings(event.payload);
        try {
          setHasApiKey(await hasSecret(SECRET_PROVIDER_API_KEY));
        } catch {
          // Keep the current secret state if the secure store is temporarily unavailable.
        }
      },
    );
    const unlistenFocus = listen("fatfingers://focus-input", async () => {
      // Events broadcast to every window; only the helper window reacts.
      if (isSettingsWindow || isOnboardingWindow) {
        return;
      }
      setView("helper");
      setHelperSessionId((sessionId) => sessionId + 1);
      try {
        const snapshot = await loadSettingsSnapshot();
        setSettings(snapshot.settings);
        setHasApiKey(snapshot.hasApiKey);
      } catch {
        // The helper can still open with the last loaded settings.
      }
    });

    return () => {
      void unlistenSettings.then((unlisten) => unlisten());
      void unlistenUpdatedSettings.then((unlisten) => unlisten());
      void unlistenFocus.then((unlisten) => unlisten());
    };
  }, []);

  async function runAction(
    inputText: string,
    action: WritingAction,
  ): Promise<CorrectTextResponse> {
    try {
      return await correctText({ action, inputText, customInstruction: null });
    } catch (error) {
      throw new Error(normalizeError(error).message);
    }
  }

  async function copyResult(text: string): Promise<void> {
    try {
      await copyToClipboard(text);
    } catch (error) {
      throw new Error(normalizeError(error).message);
    }
  }

  async function pasteResult(text: string): Promise<PasteBackOutcome> {
    try {
      return await pasteBack(text);
    } catch (error) {
      throw new Error(normalizeError(error).message);
    }
  }

  async function openSettings(): Promise<void> {
    try {
      await showSettingsWindow();
    } catch {
      setView("settings");
    }
  }

  if (!isReady) {
    return (
      <main className="loading-screen">
        <span className="loading-dot" />
        {t(settings.language, "loading")}
      </main>
    );
  }

  if (view === "onboarding") {
    return (
      <>
        {startupError ? <div className="startup-error">{startupError}</div> : null}
        <Onboarding
          hasApiKey={hasApiKey}
          onFinish={(savedSettings, nextHasApiKey) => {
            setSettings(savedSettings);
            setHasApiKey(nextHasApiKey);
            if (isOnboardingWindow) {
              // show_helper reloads the helper window's settings snapshot.
              void showHelperWindow();
              void closeOnboardingWindow();
              return;
            }
            setView("helper");
          }}
          settings={settings}
        />
      </>
    );
  }

  if (view === "settings") {
    return (
      <>
        {startupError ? <div className="startup-error">{startupError}</div> : null}
        <Settings
          hasApiKey={hasApiKey}
          onApiKeyChanged={setHasApiKey}
          onBack={() => {
            if (isSettingsWindow) {
              void hideSettingsWindow();
              return;
            }

            setView("helper");
          }}
          onDataCleared={() => {
            setSettings(FALLBACK_SETTINGS);
            setHasApiKey(false);
            void showOnboardingWindow();
            if (isSettingsWindow) {
              void hideSettingsWindow();
            }
          }}
          onSettingsSaved={setSettings}
          settings={settings}
        />
      </>
    );
  }

  if (view === "about") {
    return (
      <>
        {startupError ? <div className="startup-error">{startupError}</div> : null}
        <About onBack={() => setView("helper")} settings={settings} />
      </>
    );
  }

  return (
    <>
      {startupError ? <div className="startup-error">{startupError}</div> : null}
      <Helper
        onClose={() => void hideHelperWindow()}
        onCopy={copyResult}
        onOpenSettings={() => void openSettings()}
        onPaste={pasteResult}
        onRun={runAction}
        sessionId={helperSessionId}
        settings={settings}
      />
    </>
  );
}

export default App;
