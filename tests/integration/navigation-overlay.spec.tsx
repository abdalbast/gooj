import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartProvider } from "@/contexts/CartContext";
import { TestMemoryRouter } from "../helpers/router";

vi.mock("@/lib/versionSync", () => ({
  buildVersionedUrl: (assetPath: string) => assetPath,
}));

import Navigation from "@/components/header/Navigation";

const renderNavigation = () => {
  return render(
    <TestMemoryRouter>
      <CartProvider>
        <Navigation />
      </CartProvider>
    </TestMemoryRouter>,
  );
};

describe("navigation overlays", () => {
  it("restores focus to the search trigger after closing the search dialog", async () => {
    const user = userEvent.setup();

    renderNavigation();

    const searchButton = screen.getByRole("button", { name: "Search" });

    await user.click(searchButton);

    const searchDialog = await screen.findByRole("dialog", { name: "Search gift boxes" });
    const searchInput = screen.getByPlaceholderText("Search for gift boxes...");

    await waitFor(() => {
      expect(searchInput).toHaveFocus();
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(searchDialog).not.toBeInTheDocument();
      expect(searchButton).toHaveFocus();
    });
  });
});
