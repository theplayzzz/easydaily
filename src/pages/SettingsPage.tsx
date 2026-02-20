import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import { Card, Select, Toggle, Button, TagChip } from "../components/common";
import { Input } from "../components/common";
import { useConfig } from "../hooks/useConfig";
import { useTags } from "../hooks/useTags";
import { useStore } from "../stores/useStore";

const cycleOptions = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
  { value: "120", label: "120 min" },
];

const providerOptions = [
  { value: "openai", label: "OpenAI" },
  { value: "grok", label: "Grok" },
];

const languageOptions = [
  { value: "pt-BR", label: "Portugus (BR)" },
  { value: "en-US", label: "English (US)" },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const { config, updateConfig } = useConfig();
  const { tags } = useTags();
  const openTagEditor = useStore((s) => s.openTagEditor);
  const openConfirmation = useStore((s) => s.openConfirmation);
  const removeTag = useStore((s) => s.removeTag);
  const openOnboarding = useStore((s) => s.openOnboarding);

  return (
    <PageContainer title={t("settings.title")}>
      <div className="space-y-4 pt-2">
        {/* Notification Cycle */}
        <Card>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("settings.cycle")}
            </h3>
            <p className="text-xs text-text-secondary">{t("settings.cycleDesc")}</p>
            <Select
              options={cycleOptions}
              value={String(config.cycleInterval)}
              onChange={(e) => updateConfig({ cycleInterval: Number(e.target.value) })}
            />
          </div>
        </Card>

        {/* AI */}
        <Card>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("settings.ai")}
            </h3>
            <div className="space-y-2">
              <label className="text-xs text-text-secondary">{t("settings.aiProvider")}</label>
              <Select
                options={providerOptions}
                value={config.activeProvider}
                onChange={(e) =>
                  updateConfig({ activeProvider: e.target.value as "openai" | "grok" })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-secondary">{t("settings.aiApiKey")}</label>
              <Input
                type="password"
                placeholder={t("settings.aiApiKeyPlaceholder")}
                value={
                  config.activeProvider === "openai"
                    ? config.apiKeys.openai
                    : config.apiKeys.grok
                }
                onChange={(e) =>
                  updateConfig({
                    apiKeys: {
                      ...config.apiKeys,
                      [config.activeProvider]: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </Card>

        {/* Tags */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {t("settings.tags")}
                </h3>
                <p className="text-xs text-text-secondary">{t("settings.tagsDesc")}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openTagEditor()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between py-1"
                >
                  <TagChip name={tag.name} color={tag.color} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openTagEditor(tag.id)}
                      className="p-1 rounded text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {!tag.isDefault && (
                      <button
                        onClick={() =>
                          openConfirmation(
                            t("confirmation.deleteTag"),
                            t("confirmation.deleteTagMsg"),
                            () => removeTag(tag.id),
                          )
                        }
                        className="p-1 rounded text-text-secondary hover:text-state-error transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sound */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {t("settings.sound")}
              </h3>
              <p className="text-xs text-text-secondary">{t("settings.soundDesc")}</p>
            </div>
            <Toggle
              checked={config.sound.enabled}
              onChange={(enabled) => updateConfig({ sound: { enabled } })}
            />
          </div>
        </Card>

        {/* Language */}
        <Card>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("settings.language")}
            </h3>
            <p className="text-xs text-text-secondary">{t("settings.languageDesc")}</p>
            <Select
              options={languageOptions}
              value={config.language}
              onChange={(e) =>
                updateConfig({ language: e.target.value as "pt-BR" | "en-US" })
              }
            />
          </div>
        </Card>

        {/* Tutorial */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {t("settings.tutorial")}
              </h3>
              <p className="text-xs text-text-secondary">{t("settings.tutorialDesc")}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={openOnboarding}>
              {t("settings.restartTutorial")}
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
