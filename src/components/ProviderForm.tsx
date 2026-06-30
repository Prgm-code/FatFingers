import {
  CUSTOM_MODEL_VALUE,
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_OPTIONS,
  OPENAI_RESPONSES_URL,
  PROVIDERS,
} from "../lib/settings";
import { t } from "../lib/i18n";
import type { AppSettings } from "../types/app";

type ProviderFormProps = {
  settings: AppSettings;
  apiKeyDraft: string;
  customHeadersDraft: string;
  hasApiKey: boolean;
  isTesting: boolean;
  onApiKeyDraftChange: (value: string) => void;
  onCustomHeadersDraftChange: (value: string) => void;
  onSettingsChange: (settings: AppSettings) => void;
  onSaveApiKey: () => void;
  onClearApiKey: () => void;
  onSaveCustomHeaders: () => void;
  onTestConnection: () => void;
};

export function ProviderForm({
  settings,
  apiKeyDraft,
  customHeadersDraft,
  hasApiKey,
  isTesting,
  onApiKeyDraftChange,
  onCustomHeadersDraftChange,
  onSettingsChange,
  onSaveApiKey,
  onClearApiKey,
  onSaveCustomHeaders,
  onTestConnection,
}: ProviderFormProps) {
  const isOpenAiProvider = settings.provider === "openai";
  const language = settings.language;
  const knownOpenAiModel = OPENAI_MODEL_OPTIONS.some(
    (option) => option.value === settings.model,
  );
  const openAiModelValue = knownOpenAiModel ? settings.model : CUSTOM_MODEL_VALUE;
  const baseUrlValue = isOpenAiProvider ? OPENAI_RESPONSES_URL : (settings.baseUrl ?? "");

  function changeProvider(provider: AppSettings["provider"]) {
    onSettingsChange({
      ...settings,
      provider,
      baseUrl: provider === "openai" ? null : settings.baseUrl,
      model:
        provider === "openai" &&
        (settings.model.trim().length === 0 || settings.model === "gpt-4.1-mini")
          ? DEFAULT_OPENAI_MODEL
          : settings.model,
    });
  }

  function changeOpenAiModel(value: string) {
    onSettingsChange({
      ...settings,
      model: value === CUSTOM_MODEL_VALUE ? "" : value,
    });
  }

  return (
    <div className="settings-grid">
      <label>
        {t(language, "providerType")}
        <select
          onChange={(event) =>
            changeProvider(event.currentTarget.value as AppSettings["provider"])
          }
          value={settings.provider}
        >
          {PROVIDERS.map((provider) => (
            <option key={provider.value} value={provider.value}>
              {provider.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        {t(language, "baseUrl")}
        <input
          aria-readonly={isOpenAiProvider}
          onChange={(event) =>
            !isOpenAiProvider &&
            onSettingsChange({ ...settings, baseUrl: event.currentTarget.value })
          }
          readOnly={isOpenAiProvider}
          placeholder={
            settings.provider === "custom_http"
              ? "http://localhost:8080/generate"
              : "https://api.example.com/v1"
          }
          value={baseUrlValue}
        />
      </label>

      {isOpenAiProvider ? (
        <>
          <label>
            {t(language, "model")}
            <select
              onChange={(event) => changeOpenAiModel(event.currentTarget.value)}
              value={openAiModelValue}
            >
              {OPENAI_MODEL_OPTIONS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
              <option value={CUSTOM_MODEL_VALUE}>{t(language, "customModel")}</option>
            </select>
          </label>

          {openAiModelValue === CUSTOM_MODEL_VALUE ? (
            <label>
              {t(language, "customModelId")}
              <input
                onChange={(event) =>
                  onSettingsChange({ ...settings, model: event.currentTarget.value })
                }
                placeholder={DEFAULT_OPENAI_MODEL}
                value={settings.model}
              />
            </label>
          ) : null}
        </>
      ) : (
        <label>
          {t(language, "model")}
          <input
            onChange={(event) =>
              onSettingsChange({ ...settings, model: event.currentTarget.value })
            }
            value={settings.model}
          />
        </label>
      )}

      <label>
        {t(language, "apiKey")}
        <input
          autoComplete="off"
          onChange={(event) => onApiKeyDraftChange(event.currentTarget.value)}
          placeholder={hasApiKey ? t(language, "savedKeyExists") : t(language, "pasteKey")}
          type="password"
          value={apiKeyDraft}
        />
      </label>

      <label>
        {t(language, "customHeadersJson")}
        <textarea
          onChange={(event) => onCustomHeadersDraftChange(event.currentTarget.value)}
          placeholder='{"X-Provider":"value"}'
          rows={3}
          value={customHeadersDraft}
        />
      </label>

      <div className="button-row form-actions">
        <button disabled={apiKeyDraft.trim().length === 0} onClick={onSaveApiKey} type="button">
          {t(language, "saveApiKey")}
        </button>
        <button disabled={!hasApiKey} onClick={onClearApiKey} type="button">
          {t(language, "clearApiKey")}
        </button>
        <button
          disabled={customHeadersDraft.trim().length === 0}
          onClick={onSaveCustomHeaders}
          type="button"
        >
          {t(language, "saveHeaders")}
        </button>
        <button disabled={isTesting} onClick={onTestConnection} type="button">
          {isTesting ? t(language, "testing") : t(language, "testConnection")}
        </button>
      </div>
    </div>
  );
}
