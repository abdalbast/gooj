import { RefObject, useEffect, useRef } from "react";

let activeScrollLocks = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";

export const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked || typeof document === "undefined") {
      return;
    }

    if (activeScrollLocks === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const currentBodyPaddingRight = Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight || "0",
      );

      document.body.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${currentBodyPaddingRight + scrollbarWidth}px`;
      }
    }

    activeScrollLocks += 1;

    return () => {
      activeScrollLocks = Math.max(0, activeScrollLocks - 1);

      if (activeScrollLocks === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.paddingRight = previousBodyPaddingRight;
      }
    };
  }, [locked]);
};

export const useEscapeKey = (enabled: boolean, onEscape: () => void) => {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscapeRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
};

export const useFocusRestore = (active: boolean, fallbackRef?: RefObject<HTMLElement | null>) => {
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || typeof document === "undefined") {
      return;
    }

    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fallbackTarget = fallbackRef?.current ?? null;

    return () => {
      const target = fallbackTarget ?? lastFocusedRef.current;

      window.setTimeout(() => {
        target?.focus();
      }, 0);
    };
  }, [active, fallbackRef]);
};

export const useInitialFocus = (active: boolean, targetRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    if (!active) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      targetRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [active, targetRef]);
};
