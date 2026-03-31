import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "@/App";
import { CartProvider } from "@/contexts/CartContext";

describe("cart flow", () => {
  it("shares cart state across product detail, bag, and checkout", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/product/1");

    render(
      <CartProvider>
        <App />
      </CartProvider>,
    );

    await screen.findByRole(
      "heading",
      { level: 1, name: "The Birthday Box" },
      { timeout: 3_000 },
    );

    await user.click(screen.getByRole("button", { name: "Add to Bag" }));
    await user.click(screen.getByRole("button", { name: "Shopping bag" }));

    expect(
      await screen.findByRole("heading", { name: "Bag" }, { timeout: 3_000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("The Birthday Box").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("link", { name: "Check Out" }));

    expect(
      await screen.findByRole("heading", { name: "Shipping Options" }, { timeout: 3_000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("The Birthday Box").length).toBeGreaterThan(0);
  });
});
