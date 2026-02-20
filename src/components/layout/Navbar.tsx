import { Zap, Clock, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Page } from "../../types";
import { useStore } from "../../stores/useStore";
import { cn } from "../../utils/cn";

const navItems = [
  { page: Page.QuickActions, icon: Zap, labelKey: "nav.quickActions" },
  { page: Page.History, icon: Clock, labelKey: "nav.history" },
  { page: Page.Settings, icon: Settings, labelKey: "nav.settings" },
] as const;

export function Navbar() {
  const { t } = useTranslation();
  const currentPage = useStore((s) => s.currentPage);
  const setCurrentPage = useStore((s) => s.setCurrentPage);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-bg-secondary border-t border-border">
      <div className="flex items-center justify-around h-full max-w-[400px] mx-auto">
        {navItems.map(({ page, icon: Icon, labelKey }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                active
                  ? "text-accent-primary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
