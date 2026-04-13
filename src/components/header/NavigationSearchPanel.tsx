import type { RefObject } from "react";
import { popularSearches } from "./navigationData";

interface NavigationSearchPanelProps {
  searchDialogId: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchTitleId: string;
}

export const NavigationSearchPanel = ({
  searchDialogId,
  searchInputRef,
  searchTitleId,
}: NavigationSearchPanelProps) => {
  return (
    <div
      aria-labelledby={searchTitleId}
      aria-modal="true"
      className="absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-4rem-var(--safe-area-top)-var(--safe-area-bottom))] animate-in fade-in overflow-y-auto border-b border-black/5 bg-white/95 shadow-sm backdrop-blur-2xl slide-in-from-top-2 touch-scroll duration-300"
      id={searchDialogId}
      role="dialog"
    >
      <div className="px-6 pb-[calc(2rem+var(--safe-area-bottom))] pt-8 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="sr-only" id={searchTitleId}>
            Search gift boxes
          </h2>
          <div className="relative mb-10 transform transition-all duration-300 delay-75 translate-y-0 opacity-100 starting:-translate-y-4 starting:opacity-0">
            <div className="flex items-center border-b border-gray-200 pb-3">
              <svg
                className="w-6 h-6 text-gray-400 mr-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                className="min-h-11 flex-1 bg-transparent text-xl font-light text-gray-900 outline-none placeholder:text-gray-400 sm:text-2xl"
                placeholder="Search for gift boxes..."
                ref={searchInputRef}
                type="text"
              />
            </div>
          </div>

          <div className="transform transition-all duration-300 delay-150 translate-y-0 opacity-100 starting:translate-y-4 starting:opacity-0">
            <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <button
                  className="min-h-11 text-gray-800 bg-gray-100 hover:bg-gray-200 text-[15px] font-medium py-2.5 px-5 rounded-full transition-colors duration-200"
                  key={search}
                  type="button"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
