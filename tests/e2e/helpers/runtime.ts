import { expect, type Page } from "@playwright/test";

const IGNORED_CONSOLE_ERROR_PATTERNS = [
  /favicon/i,
];

export interface RuntimeErrorTracker {
  consoleErrors: string[];
  pageErrors: string[];
}

export const trackRuntimeErrors = (page: Page): RuntimeErrorTracker => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();

    if (IGNORED_CONSOLE_ERROR_PATTERNS.some((pattern) => pattern.test(text))) {
      return;
    }

    consoleErrors.push(text);
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  return {
    consoleErrors,
    pageErrors,
  };
};

export const expectNoRuntimeErrors = (tracker: RuntimeErrorTracker) => {
  expect(tracker.pageErrors, `Unexpected page errors: ${tracker.pageErrors.join("\n")}`).toEqual([]);
  expect(
    tracker.consoleErrors,
    `Unexpected console errors: ${tracker.consoleErrors.join("\n")}`,
  ).toEqual([]);
};
