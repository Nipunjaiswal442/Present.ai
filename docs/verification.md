# Website repair verification

Verified locally on 20 October 2026. Changes are in the workspace; no public deployment was performed.

## Checks that passed

- Backend: `cd servers/fastapi && .venv/bin/python -m pytest -q` — 820 passed, with four existing SQLite migration warnings.
- Frontend: `cd servers/nextjs && npm test` — 28 passed.
- Repository scripts: `npm test` — seven tests passed.
- Production frontend: `npm run build` — compiled, type checked, and generated routes successfully.
- Lint: no errors; 84 warnings remain in the repository.
- `git diff --check` — passed.

## Browser and file checks

- Generated three-slide presentations using local Ollama (`qwen2.5:3b-instruct`).
- Reopened an outline with its saved prompt, slide count, and content. Regeneration followed a new presentation ID.
- Renamed a deck and verified the saved title after reloading.
- Downloaded PPTX and PDF through the browser. The PPTX archive was valid with three slides and editable text; the PDF contained three readable pages.
- Checked the upload, template selection, outline, settings, and editor at phone widths. Settings and the install dialog fit at 320 pixels without horizontal page overflow. Mobile slide selection and presentation controls worked.
- Rejected a whitespace-only API key with an actionable message. Entered a manual model ID without requiring a successful model-list request. Automated tests cover normalization, saving, administrator permissions, and redacted runtime settings.
- Production manifest, service worker, offline page, Apple icon, and 192/512-pixel icons returned HTTP 200 with the expected types and headers. Service-worker tests verify that private decks, APIs, and keys are not cached.
- A regression test with the bundled Modern template forces an invalid layout selection to fall back to a chart; the final layout check replaces it when the outline has no numeric data. A final three-slide browser generation completed with non-chart layouts, and the first slide was visually checked. This covers the empty-chart failure found during PDF inspection.

## Limits and deployment requirements

- Real paid-provider keys were not supplied. Live OpenAI, Google, Anthropic, and other cloud-provider calls remain unverified; local Ollama generation was exercised.
- The small local model sometimes produces incomplete or expanded copy. Review generated content and use a more capable configured model for polished results. Layout checks and prompting reduce failures but do not guarantee factual accuracy or perfect design for every description.
- Image generation was disabled for the local test, so generated images were not verified. Icons can fall back to placeholders if their model cannot initialize in time.
- Physical iPhone Safari installation, keyboard behavior, downloads, and safe-area behavior still need a device check after HTTPS deployment. Viewport checks are not a substitute for that test.
- Install from Safari using Share → Add to Home Screen. The app includes an Install app button with these instructions. Generation, saving, and export require a connection to the backend; offline support provides a reconnect screen.
- The backend needs persistent storage, the presentation-export runtime, Node/Chromium, and a reachable Next.js renderer. See the deployment and iPhone sections in [README](../README.md).
