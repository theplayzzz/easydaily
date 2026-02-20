import { useEffect } from "react";
import { Page } from "./types";
import { useStore } from "./stores/useStore";
import { Navbar } from "./components/layout/Navbar";
import { QuickActionsPage } from "./pages/QuickActionsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NoteEditorModal } from "./components/notes/NoteEditorModal";
import { ConfirmationModal } from "./components/common/ConfirmationModal";
import { AiResultModal } from "./components/common/AiResultModal";
import { TagEditorModal } from "./components/common/TagEditorModal";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { NotificationPopup } from "./components/notification/NotificationPopup";
import { logger } from "./utils/logger";

function CurrentPage() {
  const currentPage = useStore((s) => s.currentPage);

  switch (currentPage) {
    case Page.QuickActions:
      return <QuickActionsPage />;
    case Page.History:
      return <HistoryPage />;
    case Page.Settings:
      return <SettingsPage />;
    default:
      return <QuickActionsPage />;
  }
}

function App() {
  useEffect(() => {
    logger.info("App", "EasyDaily initialized");
  }, []);

  return (
    <main className="w-[400px] h-[500px] bg-bg-primary text-text-primary font-sans flex flex-col relative overflow-hidden rounded-lg">
      <div className="flex-1 overflow-hidden">
        <CurrentPage />
      </div>
      <Navbar />

      {/* Global modals */}
      <NoteEditorModal />
      <ConfirmationModal />
      <AiResultModal />
      <TagEditorModal />
      <OnboardingModal />

      {/* Notification */}
      <NotificationPopup />
    </main>
  );
}

export default App;
