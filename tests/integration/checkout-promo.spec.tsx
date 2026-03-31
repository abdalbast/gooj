import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "@/contexts/CartContext";
import Checkout from "@/pages/Checkout";
import { maybeGetSupabaseClient } from "@/lib/supabase";
import { TestMemoryRouter } from "../helpers/router";

vi.mock("@/lib/supabase", () => ({
  maybeGetSupabaseClient: vi.fn(),
}));

const baseCartState = {
  appliedPromotion: null,
  items: [
    {
      hasPhoto: false,
      handwrittenNote: false,
      id: "1::printed::no-photo",
      message: "",
      productId: "1",
      quantity: 1,
    },
  ],
  shippingOption: "standard" as const,
};

const renderCheckout = () =>
  render(
    <TestMemoryRouter>
      <CartProvider initialState={baseCartState}>
        <Checkout />
      </CartProvider>
    </TestMemoryRouter>,
  );

describe("checkout promotion flow", () => {
  beforeEach(() => {
    vi.mocked(maybeGetSupabaseClient).mockReset();
  });

  it("applies a valid promotion and updates totals", async () => {
    const user = userEvent.setup();
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          code: "GOOJIT20",
          discount_label: "20%",
          expires_at: "2026-12-31",
          promo_type: "Percentage",
        },
      ],
      error: null,
    });

    vi.mocked(maybeGetSupabaseClient).mockReturnValue({
      rpc,
    } as never);

    renderCheckout();

    await user.click(screen.getByRole("button", { name: "Discount code" }));
    await user.type(screen.getByPlaceholderText("Enter discount code"), "goojit20");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(await screen.findByText("GOOJIT20")).toBeInTheDocument();
    expect(screen.getAllByText("-£13")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Complete Order • £52" })).toBeInTheDocument();
  });

  it("shows an error for an invalid promotion", async () => {
    const user = userEvent.setup();
    const rpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(maybeGetSupabaseClient).mockReturnValue({
      rpc,
    } as never);

    renderCheckout();

    await user.click(screen.getByRole("button", { name: "Discount code" }));
    await user.type(screen.getByPlaceholderText("Enter discount code"), "missing");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That code is not valid right now.");
  });

  it("treats expired promotions as invalid", async () => {
    const user = userEvent.setup();
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          code: "SPRING10",
          discount_label: "£10 off",
          expires_at: "2024-01-01",
          promo_type: "Fixed",
        },
      ],
      error: null,
    });

    vi.mocked(maybeGetSupabaseClient).mockReturnValue({
      rpc,
    } as never);

    renderCheckout();

    await user.click(screen.getByRole("button", { name: "Discount code" }));
    await user.type(screen.getByPlaceholderText("Enter discount code"), "SPRING10");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That code is not valid right now.");
  });
});
