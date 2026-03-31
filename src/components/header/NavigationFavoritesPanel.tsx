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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm h-screen transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        aria-labelledby={favoritesTitleId}
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-full max-w-96 bg-background border-l border-border animate-slide-in-right flex flex-col"
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

        <div className="p-6">
          <p className="text-muted-foreground text-sm mb-6">
            You haven't added any favorites yet. Browse our gift boxes and click the heart icon to
            save ones you love.
          </p>
        </div>
      </div>
    </div>
  );
};
