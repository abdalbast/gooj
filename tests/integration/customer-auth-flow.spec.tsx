import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  deleteReminderMock,
  getAdminMembershipMock,
  hasSupabaseConfigMock,
  listRemindersMock,
  maybeGetSupabaseClientMock,
  saveReminderMock,
} = vi.hoisted(() => ({
  deleteReminderMock: vi.fn(),
  getAdminMembershipMock: vi.fn(),
  hasSupabaseConfigMock: vi.fn(),
  listRemindersMock: vi.fn(),
  maybeGetSupabaseClientMock: vi.fn(),
  saveReminderMock: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  hasSupabaseConfig: hasSupabaseConfigMock,
  maybeGetSupabaseClient: maybeGetSupabaseClientMock,
}));

vi.mock("@/lib/supabaseData", () => ({
  deleteReminder: deleteReminderMock,
  getAdminMembership: getAdminMembershipMock,
  getSupabaseErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
  listReminders: listRemindersMock,
  saveReminder: saveReminderMock,
}));

vi.mock("@/components/header/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/footer/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("@/components/reminders/ReminderFormCard", () => ({
  ReminderFormCard: ({ isAdding }: { isAdding: boolean }) => (
    <div>{isAdding ? "Reminder form open" : "Reminder form closed"}</div>
  ),
}));

vi.mock("@/components/reminders/ReminderList", () => ({
  ReminderList: ({ reminders }: { reminders: Array<{ id: string }> }) => (
    <div>{reminders.length === 0 ? "No reminders yet" : `${reminders.length} reminders`}</div>
  ),
}));

import { AuthProvider } from "@/contexts/AuthContext";
import DateReminders from "@/pages/DateReminders";
import { TestMemoryRouter } from "../helpers/router";

type AuthListener = (event: string, session: Session | null) => void;

const createSession = (email: string): Session =>
  ({
    access_token: `access-token:${email}`,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    refresh_token: `refresh-token:${email}`,
    token_type: "bearer",
    user: {
      app_metadata: {},
      aud: "authenticated",
      created_at: "2026-03-31T00:00:00.000Z",
      email,
      id: `user-${email}`,
      role: "authenticated",
      user_metadata: {},
    },
  }) as Session;

class FakeSupabaseClient {
  currentSession: Session | null = null;
  listeners: AuthListener[] = [];

  auth = {
    getSession: vi.fn(async () => ({
      data: {
        session: this.currentSession,
      },
    })),
    mfa: {
      getAuthenticatorAssuranceLevel: vi.fn(async () => ({
        data: {
          currentLevel: "aal1" as const,
        },
        error: null,
      })),
    },
    onAuthStateChange: vi.fn((listener: AuthListener) => {
      this.listeners.push(listener);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners = this.listeners.filter((registeredListener) => registeredListener !== listener);
            },
          },
        },
      };
    }),
    resetPasswordForEmail: vi.fn(async () => ({
      data: {},
      error: null,
    })),
    signInWithOAuth: vi.fn(async () => ({
      data: {
        provider: "google",
      },
      error: null,
    })),
    signInWithOtp: vi.fn(async () => ({
      data: {},
      error: null,
    })),
    signInWithPassword: vi.fn(async ({ email }: { email: string; password: string }) => {
      this.currentSession = createSession(email);
      this.emit("SIGNED_IN", this.currentSession);

      return {
        data: {
          session: this.currentSession,
          user: this.currentSession.user,
        },
        error: null,
      };
    }),
    signOut: vi.fn(async () => {
      this.currentSession = null;
      this.emit("SIGNED_OUT", null);

      return {
        error: null,
      };
    }),
    signUp: vi.fn(async ({ email }: { email: string; password: string }) => {
      this.currentSession = createSession(email);
      this.emit("SIGNED_IN", this.currentSession);

      return {
        data: {
          session: this.currentSession,
          user: this.currentSession.user,
        },
        error: null,
      };
    }),
    updateUser: vi.fn(async () => ({
      data: {
        user: this.currentSession?.user ?? createSession("recovery@example.com").user,
      },
      error: null,
    })),
  };

  emit(event: string, session: Session | null) {
    this.listeners.forEach((listener) => listener(event, session));
  }
}

describe("customer auth flow", () => {
  let client: FakeSupabaseClient;

  const renderPage = (path = "/reminders") => {
    window.history.pushState({}, "", path);

    render(
      <TestMemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <DateReminders />
        </AuthProvider>
      </TestMemoryRouter>,
    );
  };

  beforeEach(() => {
    client = new FakeSupabaseClient();
    hasSupabaseConfigMock.mockReturnValue(true);
    maybeGetSupabaseClientMock.mockImplementation(() => client);
    getAdminMembershipMock.mockResolvedValue(null);
    listRemindersMock.mockResolvedValue([]);
    saveReminderMock.mockResolvedValue(undefined);
    deleteReminderMock.mockResolvedValue(undefined);
    window.history.pushState({}, "", "/");
  });

  it("supports signing up, signing out, and signing back in from the reminders route", async () => {
    const user = userEvent.setup();

    renderPage("/reminders?intent=add-date");

    await screen.findByRole("heading", { name: "Welcome back" });

    await user.click(screen.getByRole("button", { name: "Create account" }));
    await screen.findByRole("heading", { name: "Create your account" });

    await user.type(screen.getByLabelText("Email"), "collector@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create my account" }));

    expect(client.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "collector@example.com",
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining("/reminders?intent=add-date"),
        }),
        password: "password123",
      }),
    );

    await screen.findByRole("button", { name: "Sign out" });
    expect(await screen.findByText("collector@example.com")).toBeInTheDocument();
    expect(await screen.findByText("Reminder form open")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await screen.findByRole("heading", { name: "Welcome back" });

    await user.type(screen.getByLabelText("Email"), "collector@example.com");
    await user.type(screen.getByLabelText("Password"), "password123{Enter}");

    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "collector@example.com",
      password: "password123",
    });

    await screen.findByRole("button", { name: "Sign out" });
    expect(await screen.findByText("collector@example.com")).toBeInTheDocument();
  });

  it("starts the Google OAuth flow with a redirect back to reminders", async () => {
    const user = userEvent.setup();

    renderPage("/reminders?intent=add-date");
    await screen.findByRole("heading", { name: "Welcome back" });

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
      options: {
        redirectTo: expect.stringContaining("/reminders?intent=add-date"),
      },
      provider: "google",
    });
  });

  it("sends password reset emails from the forgot-password view", async () => {
    const user = userEvent.setup();

    renderPage("/reminders");
    await screen.findByRole("heading", { name: "Welcome back" });

    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await screen.findByRole("heading", { name: "Reset your password" });

    await user.type(screen.getByLabelText("Email"), "collector@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "collector@example.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/reminders"),
      }),
    );

    expect(await screen.findByText("Password reset sent")).toBeInTheDocument();
  });

  it("lets recovery users set a new password and continue into reminders", async () => {
    const user = userEvent.setup();
    client.currentSession = createSession("recovery@example.com");

    renderPage("/reminders#type=recovery");
    await screen.findByRole("heading", { name: "Choose a new password" });

    await user.type(screen.getByLabelText("New password"), "new-password123");
    await user.type(screen.getByLabelText("Confirm password"), "new-password123");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(client.auth.updateUser).toHaveBeenCalledWith({
      password: "new-password123",
    });

    await screen.findByRole("button", { name: "Sign out" });
    expect(window.location.hash).toBe("");
    expect(await screen.findByText("recovery@example.com")).toBeInTheDocument();
  });
});
