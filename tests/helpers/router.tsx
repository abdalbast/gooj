import React from "react";
import type { PropsWithChildren } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";

type TestMemoryRouterProps = PropsWithChildren<Omit<MemoryRouterProps, "future">>;

export const TestMemoryRouter = ({
  children,
  ...props
}: TestMemoryRouterProps) => (
  <MemoryRouter
    future={{
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    }}
    {...props}
  >
    {children}
  </MemoryRouter>
);
