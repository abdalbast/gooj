import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { addListenerMock, getLaunchUrlMock, removeListenerMock } = vi.hoisted(() => ({
  addListenerMock: vi.fn(async () => ({
    remove: removeListenerMock,
  })),
  getLaunchUrlMock: vi.fn(async () => undefined),
  removeListenerMock: vi.fn(async () => undefined),
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: addListenerMock,
    getLaunchUrl: getLaunchUrlMock,
  },
}));

import App from "@/App";
import {
  RouteErrorBoundary,
  RouteLoadingFallback,
} from "@/components/app/AppShellFallbacks";
import { CartProvider } from "@/contexts/CartContext";

const setNavigatorOnline = (isOnline: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => isOnline,
  });
};

afterEach(() => {
  setNavigatorOnline(true);
  window.history.pushState({}, "", "/");
});

describe("app shell fallbacks", () => {
  it("renders an accessible route loading fallback", () => {
    render(<RouteLoadingFallback />);

    expect(screen.getByRole("status", { name: "Loading GOOJ" })).toBeInTheDocument();
    expect(screen.getByText("Preparing your gift boxes")).toBeInTheDocument();
  });

  it("renders offline fallback when offline and recovers on online", async () => {
    setNavigatorOnline(false);
    window.history.pushState({}, "", "/product/1");

    render(
      <CartProvider>
        <App />
      </CartProvider>,
    );

    expect(screen.getByRole("heading", { name: "You are offline" })).toBeInTheDocument();

    setNavigatorOnline(true);
    window.dispatchEvent(new Event("online"));

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "You are offline" })).not.toBeInTheDocument();
    });
  });

  it("renders an error boundary retry path", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let shouldThrow = true;

    const FlakyRoute = () => {
      if (shouldThrow) {
        throw new Error("Route failed");
      }

      return <h1>Recovered route</h1>;
    };

    render(
      <RouteErrorBoundary>
        <FlakyRoute />
      </RouteErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByRole("heading", { name: "Recovered route" })).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
