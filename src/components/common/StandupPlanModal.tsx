import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Textarea } from "./Input";

interface StandupPlanModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (plan: string) => void;
}

export function StandupPlanModal({ open, onClose, onConfirm }: StandupPlanModalProps) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState("");

  const handleConfirm = () => {
    onConfirm(plan);
    setPlan("");
    onClose();
  };

  const handleClose = () => {
    setPlan("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={t("standup.title")}>
      <div className="px-4 py-4">
        <Textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder={t("standup.placeholder")}
          rows={5}
          autoFocus
        />
      </div>
      <div className="flex gap-2 px-4 py-3 border-t border-border">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleClose}
        >
          {t("standup.cancel")}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleConfirm}
          disabled={!plan.trim()}
        >
          {t("standup.generate")}
        </Button>
      </div>
    </Modal>
  );
}
