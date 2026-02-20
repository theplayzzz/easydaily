import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useStore } from "../../stores/useStore";

export function ConfirmationModal() {
  const { t } = useTranslation();
  const { open, title, message, onConfirm } = useStore((s) => s.modals.confirmation);
  const closeConfirmation = useStore((s) => s.closeConfirmation);

  const handleConfirm = () => {
    onConfirm?.();
    closeConfirmation();
  };

  return (
    <Modal open={open} onClose={closeConfirmation}>
      <div className="flex flex-col items-center text-center px-6 py-6">
        <div className="p-3 rounded-full bg-state-error/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-state-error" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex gap-2 w-full">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={closeConfirmation}
          >
            {t("confirmation.cancel")}
          </Button>
          <Button
            size="sm"
            className="flex-1 !bg-state-error hover:!bg-state-error/90"
            onClick={handleConfirm}
          >
            {t("confirmation.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
