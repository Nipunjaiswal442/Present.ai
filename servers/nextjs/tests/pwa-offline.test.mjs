import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
function worker(fetch) {
  const events = new Map();
  const cached = [];
  const deleted = [];
  const offline = new Response("Offline");
  vm.runInNewContext(source, {
    self: { location: { origin: "https://present.test" }, clients: { claim: async () => {} }, addEventListener: (type, fn) => events.set(type, fn) },
    URL, Response, fetch,
    caches: { open: async () => ({ add: async (url) => cached.push(url) }), match: async () => offline,
      keys: async () => ["other-app", "presentai-offline-v0", "presentai-offline-v1"], delete: async (key) => deleted.push(key) },
  });
  return { events, cached, deleted, offline };
}

test("service worker only precaches the public offline page and preserves other caches", async () => {
  const state = worker();
  let work;
  state.events.get("install")({ waitUntil: (promise) => { work = promise; } });
  await work;
  assert.deepEqual(state.cached, ["/offline.html"]);
  state.events.get("activate")({ waitUntil: (promise) => { work = promise; } });
  await work;
  assert.deepEqual(state.deleted, ["presentai-offline-v0"]);
});

test("API requests, private downloads, and mutations bypass the service worker", () => {
  const state = worker(() => { throw new Error("Must not intercept"); });
  for (const [path, method, mode] of [["/api/user-config", "GET", "navigate"], ["/app_data/exports/deck.pptx", "GET", "navigate"], ["/api/v1/ppt/presentation/create", "POST", "cors"], ["/_next/static/app.js", "GET", "no-cors"]]) {
    state.events.get("fetch")({ request: { url: `https://present.test${path}`, method, mode }, respondWith: () => assert.fail("Private request intercepted") });
  }
});

test("failed page navigation shows the offline screen without caching the page", async () => {
  const state = worker(async () => { throw new TypeError("Network unavailable"); });
  let response;
  state.events.get("fetch")({ request: { url: "https://present.test/dashboard", method: "GET", mode: "navigate" }, respondWith: (value) => { response = value; } });
  assert.equal(await response, state.offline);
  assert.deepEqual(state.cached, []);
});
