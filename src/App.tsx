import { Page, NotificationType } from "./types";
import { useStore } from "./stores/useStore";
import { useInitializeApp } from "./hooks/useInitializeApp";
import { useBackendEvents } from "./hooks/useBackendEvents";
import { Navbar } from "./components/layout/Navbar";
import { Titlebar } from "./components/layout/Titlebar";
import { QuickActionsPage } from "./pages/QuickActionsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NoteEditorModal } from "./components/notes/NoteEditorModal";
import { ConfirmationModal } from "./components/common/ConfirmationModal";
import { AiResultModal } from "./components/common/AiResultModal";
import { TagEditorModal } from "./components/common/TagEditorModal";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { NotificationWindow } from "./components/notification/NotificationWindow";

// Check if this is a notification popup window
const params = new URLSearchParams(window.location.search);
const notificationType = params.get("notification") as NotificationType | null;

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

function MainApp() {
  useInitializeApp();
  useBackendEvents();

  return (
    <main className="w-[400px] h-[500px] bg-bg-primary text-text-primary font-sans flex flex-col relative overflow-hidden rounded-lg">
      <Titlebar />
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
    </main>
  );
}

function App() {
  if (notificationType) {
    return <NotificationWindow type={notificationType} />;
  }

  return <MainApp />;
}

export default App;
