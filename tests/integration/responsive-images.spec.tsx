import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LargeHero from "@/components/content/LargeHero";
import ProductCard from "@/components/product/ProductCard";
import { TestMemoryRouter } from "../helpers/router";

describe("responsive image sources", () => {
  it("renders an avif source for the hero poster", () => {
    render(
      <TestMemoryRouter>
        <LargeHero />
      </TestMemoryRouter>,
    );

    const heroImage = screen.getByAltText("GOOJ curated gift boxes");
    const picture = heroImage.closest("picture");

    expect(picture?.querySelector('source[type="image/avif"]')).not.toBeNull();
  });

  it("renders an avif source for product cards when provided", () => {
    render(
      <TestMemoryRouter>
        <ProductCard
          product={{
            id: 1,
            name: "The Birthday Box",
            category: "Gift Boxes",
            price: "£65",
            image: "/pantheon.webp",
            imageAvif: "/pantheon.avif",
          }}
        />
      </TestMemoryRouter>,
    );

    const productImage = screen.getByAltText("The Birthday Box");
    const picture = productImage.closest("picture");

    expect(picture?.querySelector('source[type="image/avif"]')).not.toBeNull();
  });
});
