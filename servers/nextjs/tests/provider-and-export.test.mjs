import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

let api;
let directory;
test.before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "presentai-provider-export-"));
  const entry = path.join(directory, "entry.ts");
  const output = path.join(directory, "bundle.mjs");
  await writeFile(entry, [
    `export { normalizeLLMConfig, getLLMConfigValidationError, handleSaveLLMConfig } from ${JSON.stringify(path.resolve("utils/storeHelpers.ts"))};`,
    `export { requestPresentationExport } from ${JSON.stringify(path.resolve("utils/presentationExport.ts"))};`,
  ].join("\n"));
  await build({ entryPoints: [entry], outfile: output, bundle: true, platform: "node", format: "esm", tsconfig: path.resolve("tsconfig.json"), logLevel: "silent" });
  api = await import(pathToFileURL(output).href);
});
test.after(async () => { await rm(directory, { recursive: true, force: true }); });

const config = { LLM: "openai", OPENAI_MODEL: "test-model", OPENAI_API_KEY: "  test-key\n", DISABLE_IMAGE_GENERATION: true };

test("provider keys are trimmed and blank keys are rejected", () => {
  assert.equal(api.normalizeLLMConfig(config).OPENAI_API_KEY, "test-key");
  assert.equal(api.getLLMConfigValidationError(config), null);
  assert.match(api.getLLMConfigValidationError({ ...config, OPENAI_API_KEY: " \n " }), /API key is required/);
});

test("saving settings sends normalized JSON and preserves useful backend errors", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/user-config");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(JSON.parse(options.body).OPENAI_API_KEY, "test-key");
    return Response.json({ detail: "Only the administrator can change provider settings." }, { status: 403 });
  });
  await assert.rejects(api.handleSaveLLMConfig(config), /Only the administrator/);
});

test("browser export uses the backend and a browser-safe download URL", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.match(url, /\/api\/v1\/ppt\/presentation\/deck-123\/export$/);
    assert.equal(options.credentials, "include");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { export_as: "pptx" });
    return Response.json({ path: "/persistent-data/exports/users/42/deck.pptx", download_url: "/app_data/exports/users/42/deck.pptx" });
  });
  assert.match(await api.requestPresentationExport("deck-123", "pptx"), /\/app_data\/exports\/users\/42\/deck.pptx$/);
});

test("export errors and missing download links are actionable", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json({ detail: "Presentation not found" }, { status: 404 }));
  await assert.rejects(api.requestPresentationExport("missing", "pdf"), /Presentation not found/);
  fetchMock.mock.mockImplementation(async () => Response.json({}));
  await assert.rejects(api.requestPresentationExport("missing", "pdf"), /without a download link/);
});
