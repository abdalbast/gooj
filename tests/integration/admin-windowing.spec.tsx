import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminOrders from "@/pages/admin/AdminOrders";
import {
  listAdminCustomers,
  listAdminOrders,
} from "@/lib/supabaseData";

vi.mock("@/lib/supabaseData", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabaseData")>("@/lib/supabaseData");

  return {
    ...actual,
    listAdminCustomers: vi.fn(),
    listAdminOrders: vi.fn(),
  };
});

const buildOrders = (count: number) =>
  Array.from({ length: count }, (_value, index) => {
    const itemNumber = index + 1;
    const paddedNumber = itemNumber.toString().padStart(4, "0");

    return {
      createdAt: "2026-03-30T10:00:00.000Z",
      customerEmail: `customer${itemNumber}@example.com`,
      customerId: `customer-${itemNumber}`,
      customerName: `Customer ${itemNumber}`,
      id: `order-${itemNumber}`,
      items: `${(itemNumber % 4) + 1} item bundle`,
      orderDate: "2026-03-30",
      orderNumber: `ORD-${paddedNumber}`,
      personalised: itemNumber % 2 === 0,
      status: itemNumber % 3 === 0 ? "Delivered" : itemNumber % 2 === 0 ? "Shipped" : "Processing",
      total: `£${50 + itemNumber}`,
      totalPence: (50 + itemNumber) * 100,
      updatedAt: "2026-03-30T10:00:00.000Z",
    };
  });

const buildCustomers = (count: number) =>
  Array.from({ length: count }, (_value, index) => {
    const itemNumber = index + 1;

    return {
      createdAt: "2026-03-30T10:00:00.000Z",
      dateJoined: "2026-01-01",
      email: `customer${itemNumber}@example.com`,
      fullName: `Customer ${itemNumber}`,
      id: `customer-${itemNumber}`,
      lastOrderAt: itemNumber % 2 === 0 ? "2026-03-30" : null,
      ordersCount: (itemNumber % 5) + 1,
      totalSpent: `£${100 + itemNumber}`,
      totalSpentPence: (100 + itemNumber) * 100,
      updatedAt: "2026-03-30T10:00:00.000Z",
    };
  });

describe("admin windowing", () => {
  beforeEach(() => {
    vi.mocked(listAdminOrders).mockReset();
    vi.mocked(listAdminCustomers).mockReset();
  });

  it("renders only the visible slice of the orders list and reveals later rows on scroll", async () => {
    vi.mocked(listAdminOrders).mockResolvedValue(buildOrders(500));

    render(<AdminOrders />);

    const viewport = await screen.findByTestId("orders-viewport");

    expect(within(viewport).getByText("ORD-0001")).toBeInTheDocument();
    expect(within(viewport).queryByText("ORD-0200")).not.toBeInTheDocument();
    expect(within(viewport).getAllByText(/^ORD-\d{4}$/)).toHaveLength(11);

    Object.defineProperty(viewport, "scrollTop", {
      configurable: true,
      value: 88 * 190,
      writable: true,
    });
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(within(viewport).getByText("ORD-0191")).toBeInTheDocument();
    });
    expect(within(viewport).queryByText("ORD-0001")).not.toBeInTheDocument();
  });

  it("surfaces filtered customers and preserves the detail dialog flow", async () => {
    const customers = buildCustomers(500);
    const orders = buildOrders(80).map((order, index) => ({
      ...order,
      customerId: `customer-${(index % 10) + 445}`,
      customerName: `Customer ${(index % 10) + 445}`,
      customerEmail: `customer${(index % 10) + 445}@example.com`,
    }));

    vi.mocked(listAdminCustomers).mockResolvedValue(customers);
    vi.mocked(listAdminOrders).mockResolvedValue(orders);

    const user = userEvent.setup();

    render(<AdminCustomers />);

    const viewport = await screen.findByTestId("customers-viewport");

    expect(
      within(viewport).getByRole("button", { name: /Customer 1\b/i }),
    ).toBeInTheDocument();
    expect(
      within(viewport).queryByRole("button", { name: /Customer 450\b/i }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Search by name or email..."), "Customer 450");

    const matchingCustomer = await screen.findByRole("button", { name: /Customer 450\b/i });
    await user.click(matchingCustomer);

    expect(await screen.findByRole("dialog")).toHaveTextContent("Customer 450");
    expect(screen.getByText("Order History")).toBeInTheDocument();
  });
});
