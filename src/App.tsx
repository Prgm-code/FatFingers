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
  hasSecret,
  hideHelperWindow,
  hideSettingsWindow,
  normalizeError,
  showSettingsWindow,
} from "./lib/tauri";
import type { AppSettings, View } from "./types/app";
import type { CorrectTextResponse, WritingAction } from "./types/llm";
import "./styles/globals.css";

async function loadSettingsSnapshot(): Promise<{
  settings: AppSettings;
  hasApiKey: boolean;
}> {
  const [settings, hasApiKey] = await Promise.all([
    getSettings(),
    hasSecret(SECRET_PROVIDER_API_KEY),
  ]);

  return { settings, hasApiKey };
}

function App() {
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  const requestedView = new URLSearchParams(window.location.search).get("view");
  const isSettingsWindow = requestedView === "settings";
  const [view, setView] = useState<View>(isSettingsWindow ? "settings" : "helper");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

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
        setView(isSettingsWindow ? "settings" : snapshot.hasApiKey ? "helper" : "onboarding");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStartupError(normalizeError(error).message);
        setView(isSettingsWindow ? "settings" : "helper");
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
    const unlistenSettings = listen("fatfingers://open-settings", () => {
      setView("settings");
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
      setView((currentView) => (currentView === "settings" ? currentView : "helper"));
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
      <Onboarding
        hasApiKey={hasApiKey}
        onFinish={(savedSettings, nextHasApiKey) => {
          setSettings(savedSettings);
          setHasApiKey(nextHasApiKey);
          setView("helper");
        }}
        settings={settings}
      />
    );
  }

  if (view === "settings") {
    return (
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
          setView("onboarding");
        }}
        onSettingsSaved={setSettings}
        settings={settings}
      />
    );
  }

  if (view === "about") {
    return <About onBack={() => setView("helper")} settings={settings} />;
  }

  return (
    <>
      {startupError ? <div className="startup-error">{startupError}</div> : null}
      <Helper
        onClose={() => void hideHelperWindow()}
        onCopy={copyResult}
        onOpenSettings={() => void openSettings()}
        onRun={runAction}
        settings={settings}
      />
    </>
  );
}

export default App;
