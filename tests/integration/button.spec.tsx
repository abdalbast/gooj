import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Checkout</Button>);

    expect(screen.getByRole("button", { name: "Checkout" })).toBeInTheDocument();
  });
});
