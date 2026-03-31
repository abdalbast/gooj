import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import GiftPersonalisation from "@/components/product/GiftPersonalisation";
import { CartProvider } from "@/contexts/CartContext";
import { TestMemoryRouter } from "../helpers/router";

describe("lazy ui boundaries", () => {
  it("loads the crop dialog only after a photo is selected", async () => {
    const user = userEvent.setup();

    render(
      <GiftPersonalisation
        photo={null}
        photoPreview={null}
        message=""
        handwrittenNote={false}
        onPhotoChange={() => undefined}
        onMessageChange={() => undefined}
        onHandwrittenNoteChange={() => undefined}
      />,
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();

    await user.upload(
      fileInput!,
      new File(["gift"], "gift-box.jpg", {
        type: "image/jpeg",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Frame the photo exactly how it should appear",
      }),
    ).toBeInTheDocument();
  });

  it("loads the store map inside the showroom page", async () => {
    const { default: StoreLocator } = await import("@/pages/about/StoreLocator");

    render(
      <TestMemoryRouter>
        <CartProvider>
          <StoreLocator />
        </CartProvider>
      </TestMemoryRouter>,
    );

    expect(await screen.findByTitle("Store map")).toBeInTheDocument();
  });
});
