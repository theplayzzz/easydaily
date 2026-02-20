import { PenLine, Tags, Sparkles, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "../common";
import { useStore } from "../../stores/useStore";
import { cn } from "../../utils/cn";

const steps = [
  { icon: null, titleKey: "onboarding.welcome", descKey: "onboarding.welcomeDesc" },
  { icon: PenLine, titleKey: "onboarding.step1", descKey: "onboarding.step1Desc" },
  { icon: Tags, titleKey: "onboarding.step2", descKey: "onboarding.step2Desc" },
  { icon: Sparkles, titleKey: "onboarding.step3", descKey: "onboarding.step3Desc" },
  { icon: Bell, titleKey: "onboarding.step4", descKey: "onboarding.step4Desc" },
];

export function OnboardingModal() {
  const { t } = useTranslation();
  const { open, step } = useStore((s) => s.modals.onboarding);
  const closeOnboarding = useStore((s) => s.closeOnboarding);
  const setOnboardingStep = useStore((s) => s.setOnboardingStep);

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      closeOnboarding();
    } else {
      setOnboardingStep(step + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setOnboardingStep(step - 1);
    }
  };

  return (
    <Modal open={open} onClose={closeOnboarding}>
      <div className="flex flex-col items-center text-center px-6 py-8">
        {current.icon && (
          <div className="p-4 rounded-2xl bg-accent-primary/10 mb-4">
            <current.icon className="h-10 w-10 text-accent-primary" />
          </div>
        )}
        {!current.icon && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-accent-primary">EasyDaily</h1>
          </div>
        )}
        <h2 className="text-lg font-bold text-text-primary mb-2">
          {t(current.titleKey)}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {t(current.descKey)}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === step
                ? "w-6 bg-accent-primary"
                : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3 border-t border-border">
        {!isFirst && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleBack}
          >
            {t("onboarding.back")}
          </Button>
        )}
        <Button
          size="sm"
          className={isFirst ? "w-full" : "flex-1"}
          onClick={handleNext}
        >
          {isLast ? t("onboarding.finish") : t("onboarding.next")}
        </Button>
      </div>
    </Modal>
  );
}
