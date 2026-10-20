"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { setCanChangeKeys, setLLMConfig } from "@/store/slices/userConfig";
import { normalizeLLMConfig } from "@/utils/storeHelpers";
import { getApiErrorMessage } from "@/utils/api";

export function ConfigurationInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const route = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(!route.startsWith("/pdf-maker"));
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (route.startsWith("/pdf-maker")) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    let cancelled = false;
    const settings = route === "/settings" || route.startsWith("/settings/");

    async function initialize() {
      setError(null);
      try {
        const response = await fetch("/api/runtime-config", {
          cache: "no-store", signal: controller.signal,
        });
        if (response.status === 401 || response.status === 428) {
          router.replace("/start?reason=unauthorized");
          return;
        }
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "Cannot reach the backend. Please try again."));
        const runtime = await response.json();
        let config = normalizeLLMConfig(runtime.config || {});
        // Only configuration screens need the editable, admin-only settings.
        if (runtime.canChange && (settings || route === "/start")) {
          const editable = await fetch("/api/user-config", {
            cache: "no-store", signal: controller.signal,
          });
          if (!editable.ok) throw new Error(await getApiErrorMessage(editable, "Unable to load provider settings."));
          config = normalizeLLMConfig(await editable.json());
        }
        if (cancelled) return;
        dispatch(setCanChangeKeys(Boolean(runtime.canChange)));
        dispatch(setLLMConfig(config));
        if (!runtime.configured && !settings && route !== "/start") {
          if (runtime.canChange) router.replace("/start");
          else setError("This workspace needs an AI provider. Ask the administrator to configure one in Settings.");
        } else if (runtime.configured && route === "/start") {
          router.replace("/upload");
        } else if (!runtime.configured && !runtime.canChange && route === "/start") {
          setError("This workspace needs an AI provider. Ask the administrator to configure one in Settings.");
        }
      } catch (cause) {
        if (!cancelled) setError(controller.signal.aborted
          ? "The connection timed out. Check your internet connection and try again."
          : cause instanceof Error ? cause.message : "Unable to load your workspace.");
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    }
    void initialize();
    return () => { cancelled = true; controller.abort(); window.clearTimeout(timeout); };
  }, [dispatch, route, router, retry]);

  if (loading) return (
    <main role="status" aria-busy="true" className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <div className="configuration-loader" aria-hidden="true" />
      <p className="font-syne text-lg">Preparing your workspace…</p>
    </main>
  );
  if (error) return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div role="alert" className="glass w-full max-w-md rounded-3xl p-7 text-center">
        <h1 className="text-xl font-semibold">Unable to open your workspace</h1>
        <p className="my-5 text-sm leading-6 text-black/65">{error}</p>
        <button className="pai-btn pai-btn-black" onClick={() => { setLoading(true); setRetry(value => value + 1); }}>Try again</button>
        <Link href="/settings" className="ml-4 text-sm underline">Settings</Link>
      </div>
    </main>
  );
  return children;
}
