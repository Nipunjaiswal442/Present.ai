"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Wordmark from "@/components/pai/Wordmark";
import { getApiUrl } from "@/utils/api";
import { isAuthDisabled } from "@/utils/auth";
import { formatFastApiDetail, UNAUTHORIZED_DETAIL } from "@/utils/authErrors";
import {
  PRESENTON_SPLASH_MIN_DURATION_MS,
  PresentonSplashLoader,
} from "@/components/ui/presenton-splash-loader";
import { notify } from "@/components/ui/sonner";
import { sanitizeAnalyticsError } from "@/utils/analytics";
import { MixpanelEvent, trackEvent } from "@/utils/mixpanel";

type AuthStatus = {
  configured: boolean;
  authenticated: boolean;
  username: string | null;
  role?: "admin" | "user" | null;
};

const initialStatus: AuthStatus = {
  configured: false,
  authenticated: false,
  username: null,
  role: null,
};

export default function AuthGate() {
  const [status, setStatus] = useState<AuthStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMetSplashDuration, setHasMetSplashDuration] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isSetupMode = useMemo(() => !status.configured, [status.configured]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHasMetSplashDuration(true);
    }, PRESENTON_SPLASH_MIN_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isAuthDisabled()) {
      trackEvent(MixpanelEvent.Auth_Status_Checked, {
        configured: true,
        authenticated: true,
        auth_disabled: true,
      });
      setStatus({
        configured: true,
        authenticated: true,
        username: "electron",
        role: "admin",
      });
      setIsLoading(false);
      return;
    }

    void refreshStatus();
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isLoading ||
      !status.authenticated ||
      isRedirecting
    ) {
      return;
    }

    setIsRedirecting(true);
    window.location.replace("/start");
  }, [isLoading, isRedirecting, status.authenticated]);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "setup") {
      notify.warning(
        "Set up your login again",
        "The server restarted with an empty database, so the admin account and settings were reset. On Render, add a persistent disk at /app_data or set AUTH_USERNAME and AUTH_PASSWORD to keep them.",
        { id: "auth-setup-reset", duration: 12000 }
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("reason") === "unauthorized") {
      if (status.configured && !status.authenticated) {
        trackEvent(MixpanelEvent.Auth_Unauthorized_Redirect, {
          configured: true,
        });
        notify.error("Unauthorized", "Sign in to view this page.", {
          id: "auth-unauthorized-redirect",
          duration: 5000,
        });
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isLoading, status.authenticated, status.configured]);

  const refreshStatus = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/auth/status"), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not load login state");
      }

      const data = (await response.json()) as AuthStatus;
      trackEvent(MixpanelEvent.Auth_Status_Checked, {
        configured: Boolean(data.configured),
        authenticated: Boolean(data.authenticated),
        auth_disabled: false,
        role: data.role ?? null,
      });
      setStatus({
        configured: Boolean(data.configured),
        authenticated: Boolean(data.authenticated),
        username: data.username ?? null,
        role: data.role ?? null,
      });
    } catch (fetchError) {
      console.error(fetchError);
      trackEvent(MixpanelEvent.Auth_Status_Checked, {
        configured: false,
        authenticated: false,
        auth_disabled: false,
        error_message: sanitizeAnalyticsError(
          fetchError,
          "Could not load login state"
        ),
      });
      notify.error(
        "Could not load login",
        "We could not connect to the login service. Please refresh and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      isLoading ||
      isRedirecting ||
      status.authenticated ||
      !hasMetSplashDuration
    ) {
      return;
    }

    trackEvent(MixpanelEvent.Auth_Gate_Viewed, {
      flow: status.configured ? "sign_in" : "setup",
    });
  }, [
    hasMetSplashDuration,
    isLoading,
    isRedirecting,
    status.authenticated,
    status.configured,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedUsername = username.trim();
    if (cleanedUsername.length < 3) {
      trackEvent(MixpanelEvent.Auth_Validation_Failed, {
        flow: isSetupMode ? "setup" : "sign_in",
        reason: "username_too_short",
      });
      notify.warning(
        "Username too short",
        "Your username must be at least 3 characters."
      );
      return;
    }

    const minimumPasswordLength = isSetupMode ? 8 : 6;
    if (password.length < minimumPasswordLength) {
      trackEvent(MixpanelEvent.Auth_Validation_Failed, {
        flow: isSetupMode ? "setup" : "sign_in",
        reason: "password_too_short",
      });
      notify.warning(
        "Password too short",
        `Your password must be at least ${minimumPasswordLength} characters.`
      );
      return;
    }

    if (isSetupMode && password !== confirmPassword) {
      trackEvent(MixpanelEvent.Auth_Validation_Failed, {
        flow: "setup",
        reason: "passwords_do_not_match",
      });
      notify.warning(
        "Passwords do not match",
        "Make sure both password fields match before continuing."
      );
      return;
    }

    setIsSubmitting(true);
    trackEvent(
      isSetupMode
        ? MixpanelEvent.Auth_Setup_Started
        : MixpanelEvent.Auth_SignIn_Started,
      {
        username_length: cleanedUsername.length,
      }
    );

    try {
      const response = await fetch(
        getApiUrl(isSetupMode ? "/api/v1/auth/setup" : "/api/v1/auth/login"),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cleanedUsername,
            password,
          }),
        }
      );

      const payload = await response.json();
      if (!response.ok) {
        const detail = formatFastApiDetail(payload?.detail);
        trackEvent(
          isSetupMode
            ? MixpanelEvent.Auth_Setup_Failed
            : MixpanelEvent.Auth_SignIn_Failed,
          {
            status_code: response.status,
            error_message: sanitizeAnalyticsError(
              detail,
              isSetupMode ? "Could not create account" : "Sign-in failed"
            ),
          }
        );
        if (response.status === 401) {
          notify.error(
            "Sign-in failed",
            detail === UNAUTHORIZED_DETAIL
              ? "The username or password is incorrect. Please try again."
              : detail
          );
        } else {
          notify.error(
            isSetupMode ? "Could not create account" : "Sign-in failed",
            detail || "Something went wrong. Please try again."
          );
        }
        return;
      }

      if (isSetupMode) {
        trackEvent(MixpanelEvent.Auth_Setup_Completed, {
          username_length: cleanedUsername.length,
        });
        setStatus({
          configured: true,
          authenticated: false,
          username: (payload as AuthStatus).username ?? cleanedUsername,
          role: (payload as AuthStatus).role ?? "admin",
        });
        setPassword("");
        setConfirmPassword("");
        notify.success("Account created", "Sign in with your new username and password to continue.", {
          duration: 6000,
        });
        return;
      }

      setStatus({
        configured: Boolean((payload as AuthStatus).configured),
        authenticated: Boolean((payload as AuthStatus).authenticated),
        username: (payload as AuthStatus).username ?? cleanedUsername,
        role: (payload as AuthStatus).role ?? null,
      });
      trackEvent(MixpanelEvent.Auth_SignIn_Completed, {
        username_length: cleanedUsername.length,
        role: (payload as AuthStatus).role ?? null,
      });
      setPassword("");
      setConfirmPassword("");
      notify.success(
        "Signed in",
        "Welcome back. Loading your workspace."
      );
    } catch (submitError) {
      console.error(submitError);
      trackEvent(
        isSetupMode
          ? MixpanelEvent.Auth_Setup_Failed
          : MixpanelEvent.Auth_SignIn_Failed,
        {
          status_code: null,
          error_message: sanitizeAnalyticsError(
            submitError,
            isSetupMode ? "Could not create account" : "Login unavailable"
          ),
        }
      );
      notify.error(
        "Login unavailable",
        "The login service is unavailable right now. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    isLoading ||
    isRedirecting ||
    status.authenticated ||
    !hasMetSplashDuration
  ) {
    return <PresentonSplashLoader message="Preparing your workspace..." />;
  }

  return (
    <main className="pai-canvas relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="pai-orb left-[15%] top-[-10%] h-[520px] w-[520px] bg-black/[0.07]" />
        <div className="pai-orb right-[5%] bottom-[-10%] h-[420px] w-[420px] bg-black/[0.05]" style={{ animationDelay: "-9s" }} />
      </div>
      <section className="glass-strong pai-fall relative z-10 w-full max-w-md rounded-[28px] p-7 sm:p-9">
        <div className="pai-fall pai-delay-1">
          <Wordmark href="/" />
          <p className="pai-eyebrow mt-7">{isSetupMode ? "First-time setup" : "Secure instance"}</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-black">
            {isSetupMode ? "Create your admin login" : "Sign in to continue"}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-black/55">
            {isSetupMode
              ? "One-time setup for this deployment. You will use the same username and password on future visits."
              : "This deployment is protected. Enter your credentials to open the app."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pai-fall pai-delay-2 mt-7 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-[13px] font-medium text-black/70">
              Username
            </label>
            <input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value.replace(/\s/g, ""))
              }
              placeholder="Username"
              minLength={3}
              maxLength={128}
              pattern="\S+"
              title="Username cannot contain spaces"
              required
              spellCheck={false}
              className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white/80 px-4 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-4 focus:ring-black/[0.06]"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-[13px] font-medium text-black/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSetupMode ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                isSetupMode ? "At least 8 characters" : "Enter your password"
              }
              minLength={isSetupMode ? 8 : 6}
              maxLength={128}
              required
              className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white/80 px-4 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-4 focus:ring-black/[0.06]"
              disabled={isSubmitting}
            />
          </div>

          {isSetupMode ? (
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-black/70">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                minLength={8}
                maxLength={128}
                required
                className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white/80 px-4 text-[15px] text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-4 focus:ring-black/[0.06]"
                disabled={isSubmitting}
              />
            </div>
          ) : null}

          {!isSetupMode && status.configured ? (
            <p className="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-3 text-[12.5px] leading-relaxed text-black/55">
              Use the username and password provided by your administrator.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="pai-btn pai-btn-black h-12 w-full text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isSetupMode
                ? "Saving credentials…"
                : "Signing in…"
              : isSetupMode
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <p className="pai-fall pai-delay-3 mt-6 text-center text-[12.5px] text-black/45">
          <Link href="/" className="hover:text-black">Back to the landing page</Link>
        </p>
      </section>
    </main>
  );
}
