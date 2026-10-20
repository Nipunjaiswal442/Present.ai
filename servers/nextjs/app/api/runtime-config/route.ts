import { NextResponse } from "next/server";
import { getFastApiBaseUrl } from "@/lib/fastapi-internal";
import { hasValidLLMConfig, normalizeLLMConfig } from "@/utils/storeHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const response = await fetch(`${getFastApiBaseUrl()}/api/v1/auth/runtime-config`, {
      headers: { cookie: request.headers.get("cookie") || "" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { detail: response.status === 401 ? "Unauthorized" : "Unable to load provider settings" },
        { status: response.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    const runtime = await response.json();
    const config = normalizeLLMConfig(runtime.config || {});
    return NextResponse.json({
      config,
      canChange: Boolean(runtime.canChange),
      configured: hasValidLLMConfig(config) &&
        (config.LLM !== "presenton" || config.PRESENTON_CONNECTED === true),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { detail: "Cannot reach the backend. Check the connection and try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
