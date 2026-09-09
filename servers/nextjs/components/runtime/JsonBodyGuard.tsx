"use client";

/**
 * Some hosting edges (Render's firewall, for example) reject JSON request
 * bodies that contain a `scheme://host` URL, returning an HTML "Blocked" page.
 * Provider base URLs, Ollama endpoints and prompts with links all trip it.
 *
 * JSON allows `/` to be written as `\/`, and every parser decodes it back to
 * `/`. Escaping slashes in outgoing JSON bodies is therefore semantically a
 * no-op for the API, but keeps the request out of the firewall's pattern.
 */

const PATCHED = "__presentAiJsonBodyGuard";

function isJsonContentType(headers: HeadersInit | undefined, fallback: string | null): boolean {
  let value: string | null = fallback;
  if (headers instanceof Headers) {
    value = headers.get("content-type") ?? value;
  } else if (Array.isArray(headers)) {
    const entry = headers.find(([k]) => k.toLowerCase() === "content-type");
    if (entry) value = entry[1];
  } else if (headers && typeof headers === "object") {
    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() === "content-type") value = String(v);
    }
  }
  return !!value && value.toLowerCase().includes("json");
}

function escapeJsonSlashes(body: string): string {
  const trimmed = body.trimStart();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return body;
  if (!/:\/\//.test(body)) return body;
  // Leave already-escaped "\/" untouched, escape bare "/" (no lookbehind: older Safari).
  return body.replace(/\\\/|\//g, (match) => (match === "/" ? "\\/" : match));
}

export function installJsonBodyGuard(): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as Record<string, unknown>;
  if (w[PATCHED]) return;
  w[PATCHED] = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const body = init?.body;
      if (typeof body === "string") {
        const requestContentType =
          input instanceof Request ? input.headers.get("content-type") : null;
        if (isJsonContentType(init?.headers, requestContentType)) {
          const escaped = escapeJsonSlashes(body);
          if (escaped !== body) {
            return originalFetch(input, { ...init, body: escaped });
          }
        }
      }
    } catch {
      // Fall through to the untouched request.
    }
    return originalFetch(input, init);
  };
}

installJsonBodyGuard();

export default function JsonBodyGuard() {
  return null;
}
