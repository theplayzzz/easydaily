import { PenLine, Sparkles, Calendar, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "../components/layout/PageContainer";
import { Card } from "../components/common";
import { useStore } from "../stores/useStore";
import { Page } from "../types";
import { mockAiSummary } from "../stores/mockData";

const actions = [
  { icon: PenLine, labelKey: "quickActions.addNote", descKey: "quickActions.addNoteDesc", color: "#39FF14" },
  { icon: Sparkles, labelKey: "quickActions.aiSummary", descKey: "quickActions.aiSummaryDesc", color: "#BF40FF" },
  { icon: Calendar, labelKey: "quickActions.viewHistory", descKey: "quickActions.viewHistoryDesc", color: "#00D4FF" },
  { icon: Target, labelKey: "quickActions.dailyGoal", descKey: "quickActions.dailyGoalDesc", color: "#FFAA00" },
] as const;

export function QuickActionsPage() {
  const { t } = useTranslation();
  const openNoteEditor = useStore((s) => s.openNoteEditor);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const openAiResult = useStore((s) => s.openAiResult);
  const setAiResultState = useStore((s) => s.setAiResultState);

  const handleAction = (index: number) => {
    switch (index) {
      case 0:
        openNoteEditor();
        break;
      case 1:
        openAiResult();
        setTimeout(() => setAiResultState("success", mockAiSummary), 1500);
        break;
      case 2:
        setCurrentPage(Page.History);
        break;
      case 3:
        // Daily goal — placeholder
        break;
    }
  };

  return (
    <PageContainer className="pb-[68px] pt-3">
      <div className="flex flex-col gap-3 h-full">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.labelKey}
              hoverable
              onClick={() => handleAction(i)}
              className="flex items-center gap-3 px-4 flex-1"
            >
              <div
                className="p-2.5 rounded-lg shrink-0"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: action.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">
                  {t(action.labelKey)}
                </span>
                <span className="text-[11px] text-text-secondary leading-tight">
                  {t(action.descKey)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
