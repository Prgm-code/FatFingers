import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Helper } from "./screens/Helper";
import { Onboarding } from "./screens/Onboarding";
import { Settings } from "./screens/Settings";
import { About } from "./screens/About";
import { FALLBACK_SETTINGS, SECRET_PROVIDER_API_KEY } from "./lib/settings";
import {
  copyToClipboard,
  correctText,
  getSettings,
  hasSecret,
  hideHelperWindow,
  normalizeError,
} from "./lib/tauri";
import type { AppSettings, View } from "./types/app";
import type { CorrectTextResponse, WritingAction } from "./types/llm";
import "./styles/globals.css";

function App() {
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  const [view, setView] = useState<View>("helper");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [loadedSettings, storedApiKey] = await Promise.all([
          getSettings(),
          hasSecret(SECRET_PROVIDER_API_KEY),
        ]);

        if (!isMounted) {
          return;
        }

        setSettings(loadedSettings);
        setHasApiKey(storedApiKey);
        setView(storedApiKey ? "helper" : "onboarding");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStartupError(normalizeError(error).message);
        setView("helper");
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
    const unlistenFocus = listen("fatfingers://focus-input", () => {
      setView((currentView) => (currentView === "settings" ? currentView : "helper"));
    });

    return () => {
      void unlistenSettings.then((unlisten) => unlisten());
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

  if (!isReady) {
    return (
      <main className="loading-screen">
        <span className="loading-dot" />
        Loading
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
        onBack={() => setView("helper")}
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
        onOpenSettings={() => setView("settings")}
        onRun={runAction}
        settings={settings}
      />
    </>
  );
}

export default App;
