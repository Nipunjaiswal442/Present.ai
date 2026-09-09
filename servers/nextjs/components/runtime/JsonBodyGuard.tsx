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
    let request: Promise<Response>;
    try {
      const body = init?.body;
      const requestContentType =
        input instanceof Request ? input.headers.get("content-type") : null;
      if (typeof body === "string" && isJsonContentType(init?.headers, requestContentType)) {
        const escaped = escapeJsonSlashes(body);
        request = originalFetch(input, escaped !== body ? { ...init, body: escaped } : init);
      } else {
        request = originalFetch(input, init);
      }
    } catch {
      request = originalFetch(input, init);
    }
    return request.then((response) => {
      void redirectIfSessionLost(input, response);
      return response;
    });
  };
}

const LOGIN_ROUTE = "/start";

function requestPath(input: RequestInfo | URL): string {
  try {
    const raw = input instanceof Request ? input.url : String(input);
    return new URL(raw, window.location.origin).pathname;
  } catch {
    return "";
  }
}

/**
 * When the backend restarts with a fresh database (ephemeral hosting) or the
 * session expires, API calls start answering 428 "setup required" or 401.
 * Instead of leaving the user on a dead page, send them to the login screen.
 */
async function redirectIfSessionLost(input: RequestInfo | URL, response: Response): Promise<void> {
  if (response.status !== 401 && response.status !== 428) return;
  const path = requestPath(input);
  if (!path.startsWith("/api/") || path.startsWith("/api/v1/auth/")) return;
  if (window.location.pathname === LOGIN_ROUTE || window.location.pathname === "/") return;

  let detail = "";
  let setupRequired = false;
  try {
    const payload = (await response.clone().json()) as { detail?: unknown; setup_required?: unknown };
    detail = typeof payload?.detail === "string" ? payload.detail : "";
    setupRequired = payload?.setup_required === true;
  } catch {
    return;
  }

  if (response.status === 428 && !setupRequired) return;
  if (response.status === 401 && detail !== "Unauthorized") return;

  const w = window as unknown as Record<string, unknown>;
  if (w.__presentAiRedirecting) return;
  w.__presentAiRedirecting = true;
  const reason = setupRequired ? "setup" : "unauthorized";
  window.location.assign(`${LOGIN_ROUTE}?reason=${reason}`);
}

installJsonBodyGuard();

export default function JsonBodyGuard() {
  return null;
}
