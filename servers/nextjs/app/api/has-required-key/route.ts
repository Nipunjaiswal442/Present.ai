import { NextResponse } from "next/server";
import { GET as getRuntimeConfig } from "../runtime-config/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const response = await getRuntimeConfig(request);
  if (!response.ok) return response;
  const runtime = await response.json();
  return NextResponse.json(
    { hasKey: Boolean(runtime.config?.OPENAI_API_KEY) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
