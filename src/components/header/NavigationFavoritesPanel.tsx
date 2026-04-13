import type { RefObject } from "react";
import { X } from "lucide-react";

interface NavigationFavoritesPanelProps {
  favoritesCloseButtonRef: RefObject<HTMLButtonElement | null>;
  favoritesPanelId: string;
  favoritesTitleId: string;
  onClose: () => void;
}

export const NavigationFavoritesPanel = ({
  favoritesCloseButtonRef,
  favoritesPanelId,
  favoritesTitleId,
  onClose,
}: NavigationFavoritesPanelProps) => {
  return (
    <div className="fixed inset-0 z-50 h-screen overflow-hidden">
      <div
        className="absolute inset-0 h-full bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        aria-labelledby={favoritesTitleId}
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-full max-w-96 animate-slide-in-right flex-col border-l border-border bg-background pb-[var(--safe-area-bottom)] pt-[var(--safe-area-top)]"
        id={favoritesPanelId}
        role="dialog"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-light text-foreground" id={favoritesTitleId}>
            Your Favorites
          </h2>
          <button
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center text-foreground hover:text-muted-foreground transition-colors"
            onClick={onClose}
            ref={favoritesCloseButtonRef}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 touch-scroll">
          <p className="text-muted-foreground text-sm mb-6">
            You haven't added any favorites yet. Browse our gift boxes and click the heart icon to
            save ones you love.
          </p>
        </div>
      </div>
    </div>
  );
};
