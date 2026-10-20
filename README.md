<p align="center">
  <img src="https://img.shields.io/badge/Present.ai-000000?style=for-the-badge&logoColor=white" alt="Present.ai" height="40" />
</p>

<h1 align="center">Present.ai</h1>

<p align="center">
  <strong>Presentations that write themselves. Designed by you.</strong><br />
  Open-source AI presentation generator with a liquid-glass, black-and-white interface.<br />
  Turn a prompt or a document into a finished, fully editable deck, on your own server, with the AI model you choose.
</p>

<p align="center">
  <a href="https://github.com/Nipunjaiswal442/Present.ai/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-black?style=flat" alt="Apache 2.0" /></a>
  <a href="https://github.com/Nipunjaiswal442/Present.ai/stargazers"><img src="https://img.shields.io/github/stars/Nipunjaiswal442/Present.ai?style=flat&color=black" alt="Stars" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python%203.11-black?style=flat&logo=fastapi&logoColor=white" alt="FastAPI" />
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNipunjaiswal442%2FPresent.ai&root-directory=servers%2Fnextjs&project-name=present-ai&repository-name=present-ai&env=NEXT_PUBLIC_FAST_API&envDescription=URL%20of%20your%20hosted%20Present.ai%20backend"><img src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel" alt="Deploy to Vercel" /></a>
</p>

<p align="center">
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-deploy-to-vercel">Deploy to Vercel</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-configuration">Configuration</a> ·
  <a href="#-api">API</a> ·
  <a href="#-development">Development</a>
</p>

---

## ✨ What is Present.ai?

Present.ai is a self-hosted alternative to Gamma, Beautiful.ai, Canva Presentations and similar tools. It is built on the open-source [Presenton](https://github.com/presenton/presenton) engine and adds a minimalist, Apple-inspired interface: monochrome palette, frosted "liquid glass" surfaces, and top-down motion on every page.

- **Prompt to deck.** One sentence in. A structured outline out, then every slide written and laid out.
- **Documents to slides.** Drop a PDF, Word, Excel, CSV, image or plain text file. The content becomes the story.
- **Your models, your keys.** OpenAI, Gemini, Anthropic, Ollama, LM Studio, Azure OpenAI, Amazon Bedrock, Vertex AI, OpenRouter, Fireworks, Together AI, DeepSeek, Cerebras, LiteLLM, or any OpenAI-compatible endpoint.
- **Editable, everywhere.** Export a real `.pptx` you can keep editing in PowerPoint or Keynote, plus a crisp PDF.
- **No SaaS lock-in.** Runs in Docker on your machine or server. Your data never leaves it.

## 🖤 The interface

| Surface | What you get |
| --- | --- |
| Landing page (`/`) | Black-and-white liquid-glass hero, bento feature tiles, three-step walkthrough, provider marquee, deploy section. Every block settles in from the top as you scroll. |
| Setup and sign-in (`/start`) | Frosted glass login card. First run creates the admin account, later runs sign you in. |
| Dashboard | Glass side rail with one-tap **New**, Templates and Community, plus Settings and Help. |
| New presentation (`/upload`) | One large prompt box, attachments, and compact controls for slide count, language, tone and mode. |
| Outline, editor, present | The full Presenton editing flow, restyled to the monochrome design system. |

Design system lives in [`servers/nextjs/app/globals.css`](servers/nextjs/app/globals.css) (`.glass`, `.glass-dark`, `.pai-btn-*`, `.pai-fall`, `.pai-reveal`) and shared pieces in [`servers/nextjs/components/pai/`](servers/nextjs/components/pai/).

## 🚀 Quick start

The fastest way to run the **full stack** (interface + AI backend) is Docker.

**Linux / macOS**

```bash
docker run -it --name present-ai -p 5001:80 -v "./app_data:/app_data" ghcr.io/presenton/presenton:latest
```

**Windows (PowerShell)**

```powershell
docker run -it --name present-ai -p 5001:80 -v "${PWD}\app_data:/app_data" ghcr.io/presenton/presenton:latest
```

Open **http://localhost:5001**. The first visit asks you to create the admin login, then walks you through choosing a text model and an image provider. Add your API key in the app or pass it as an environment variable (see [Configuration](#-configuration)).

> The Docker image above is the upstream Presenton engine. To build an image from **this** repository (with the Present.ai interface) run `docker compose up production` from the repo root, or `docker build -t present-ai .`.

**Build and run from this repo with Docker Compose**

```bash
docker compose up production
```

Set `PRESENTON_HTTP_HOST_PORT=8080` before the command to use a different port.

## ▲ Deploy to Vercel

The Next.js interface (landing page + app UI) deploys to Vercel as-is. The FastAPI backend (LLM calls, document parsing, PPTX export, database) needs a long-running server, so host it with Docker on any VPS, Railway, Render, Fly.io or similar and point the Vercel deployment at it.

1. Click **Deploy** below (or import the repo in Vercel).
2. Set **Root Directory** to `servers/nextjs` (the button pre-fills this). This step is required: with the root directory left at `/`, Vercel finds `servers/fastapi/pyproject.toml`, tries to build the Python backend, and fails with `No interpreter found for Python 3.11`.
3. Add the environment variable `NEXT_PUBLIC_FAST_API` = the public URL of your backend, for example `https://present-ai-i9ze.onrender.com` for a Render deployment of this repo.
4. Deploy. The landing page works immediately; the app pages talk to your backend.

> Already running the Docker image on Render, Railway or a VPS? That deployment serves the landing page **and** the app by itself. Vercel is optional and only puts the interface on Vercel's CDN.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNipunjaiswal442%2FPresent.ai&root-directory=servers%2Fnextjs&project-name=present-ai&repository-name=present-ai&env=NEXT_PUBLIC_FAST_API&envDescription=URL%20of%20your%20hosted%20Present.ai%20backend)

Frontend environment variables (also listed in [`servers/nextjs/.env.example`](servers/nextjs/.env.example)):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FAST_API` | Public URL of the FastAPI backend. Leave empty when nginx serves both on one origin (Docker). |
| `FAST_API_INTERNAL_URL` | Optional server-side override used by Next.js rewrites (private network URL). |
| `DISABLE_AUTH` | `true` skips the login gate. Only for single-user or desktop-style deployments. |

To run the backend for a Vercel frontend, start the Docker image and expose port `80` (or the FastAPI port `8000`) behind HTTPS. Set `CORS`-friendly hosting: the interface calls the backend through Next.js rewrites, so the browser only ever talks to your Vercel domain.

Provider settings are saved in the backend database. The frontend does not need a shared `userConfig.json` file or copies of your provider API keys. Keep the backend database and `APP_DATA_DIRECTORY` on persistent storage.

PPTX/PDF exports run on the backend. Use the complete Docker deployment, which includes the Next.js slide renderer, Node.js, Chromium, and the export package. For a manual installation, run `npm run sync:presentation-export` at the repository root and set the backend's `NEXT_PUBLIC_URL` to the reachable Next.js renderer (for example, `http://127.0.0.1:3000` locally). A FastAPI-only server without the renderer and export dependencies cannot export decks. Reverse proxies must allow long generation/export requests and forward event streams without buffering; the bundled nginx configuration does this. External hosts may impose their own request-duration limits.

## Use on iPhone

Open the deployed HTTPS website in Safari, sign in, and tap **Install app** for instructions. Use **Share → Add to Home Screen**, leave **Open as Web App** enabled when shown, then tap **Add**. The Home Screen icon opens Present.ai as a standalone app. On supported desktop/Android browsers, **Install app** opens the browser's installation prompt.

In **Settings → Text generation**, select a provider, paste its API key, choose a model (or enter the model ID manually), and save. Configure an image provider or turn off image generation. Then use **New**, describe your presentation, choose a template, review the outline, and generate the slides. **Export** downloads PowerPoint or PDF.

Generation, editing, and export need a network connection to the server. The installed app shows an offline screen when disconnected; it does not cache private presentations or API keys. Installation requires a deployed HTTPS address or localhost, and should be checked on the actual iPhone after deployment.

## 🎛 Features

- **Two generation modes.** *Standard* drafts an outline you review before slides are written. *Smart* streams a finished deck straight from the prompt, optionally using a community design as reference.
- **Templates and custom designs.** Built-in decks for pitch, report, executive update, education and more. Import your own `.pptx` layout and generate on-brand slides.
- **Drag-and-edit editor.** Move, resize and rewrite anything. Charts, images and text are live objects. Regenerate a single slide, or ask the assistant to change it.
- **Web-grounded content.** Optional web search (native provider search, SearXNG, Tavily or Exa) keeps facts and numbers current.
- **Image generation.** Pexels, Pixabay, DALL·E 3, GPT Image, Gemini image models, ComfyUI, Open WebUI, or any OpenAI-compatible images endpoint.
- **Multi-user and self-hosted.** Admin and user roles, private workspaces, sessions and API keys.
- **Presentation API.** Generate decks from your own applications with a single authenticated HTTP call.
- **Exports.** Fully editable PPTX and PDF.
- **Desktop app.** Electron builds for macOS, Windows and Linux live under [`electron/`](electron/).

## ⚙️ Configuration

All backend settings are environment variables. Put them in a `.env` file next to `docker-compose.yml`, or pass them with `-e` to `docker run`. The most common ones:

| Variable | Values / example | Notes |
| --- | --- | --- |
| `LLM` | `openai`, `google`, `anthropic`, `ollama`, `lmstudio`, `azure`, `bedrock`, `vertex`, `openrouter`, `fireworks`, `together`, `deepseek`, `cerebras`, `litellm`, `custom`, `codex` | Text model provider. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | `sk-…`, `gpt-4.1` | When `LLM=openai`. |
| `GOOGLE_API_KEY`, `GOOGLE_MODEL` | `models/gemini-2.0-flash` | When `LLM=google`. |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | `claude-…` | When `LLM=anthropic`. |
| `OLLAMA_URL`, `OLLAMA_MODEL` | `http://host.docker.internal:11434`, `llama3.2:3b` | When `LLM=ollama`. |
| `CUSTOM_LLM_URL`, `CUSTOM_LLM_API_KEY`, `CUSTOM_MODEL` | any OpenAI-compatible endpoint | When `LLM=custom`. |
| `IMAGE_PROVIDER` | `pexels`, `pixabay`, `dall-e-3`, `gpt-image-1.5`, `gemini_flash`, `nanobanana_pro`, `comfyui`, `open_webui`, `openai_compatible` | Plus the matching key, e.g. `PEXELS_API_KEY`. |
| `DISABLE_IMAGE_GENERATION` | `true` / `false` | Skip images entirely. |
| `WEB_GROUNDING`, `WEB_SEARCH_PROVIDER` | `true`, `auto` / `searxng` / `tavily` / `exa` | Web search defaults. |
| `CAN_CHANGE_KEYS` | `true` / `false` | `false` hides and locks provider settings in the UI. |
| `AUTH_USERNAME`, `AUTH_PASSWORD` | `admin`, `change-this-password` | Create the primary admin on first boot (unattended deployments). |
| `DATABASE_URL` | SQLAlchemy URL | Defaults to SQLite under `app_data`. |
| `DISABLE_ANONYMOUS_TRACKING` | `true` | Turn off anonymous telemetry. |

Example with OpenAI and locked keys:

```bash
docker run -it --name present-ai -p 5001:80 \
  -e LLM="openai" -e OPENAI_API_KEY="sk-…" \
  -e IMAGE_PROVIDER="dall-e-3" -e CAN_CHANGE_KEYS="false" \
  -v "./app_data:/app_data" ghcr.io/presenton/presenton:latest
```

The complete list (Bedrock, Vertex, Azure, OpenRouter routing, reasoning profiles, Mem0 memory, LiteParse, MCP auth, Presenton Cloud) is in [`docs/UPSTREAM_README.md`](docs/UPSTREAM_README.md#%EF%B8%8F-deployment-configurations) and [`docs/amazon-bedrock.md`](docs/amazon-bedrock.md).

## 🔌 API

Every `/api/v1/` route except the public auth endpoints requires an API key. An administrator creates one under **Admin → API keys** and sends it as a bearer token.

```bash
curl -X POST http://localhost:5001/api/v1/ppt/presentation/generate \
  -H "Authorization: Bearer sk-presenton-YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Quarterly investor update for a climate-tech startup",
    "n_slides": 10,
    "language": "English",
    "template": "general",
    "export_as": "pptx"
  }'
```

The response contains the presentation id, a viewer URL and a download path for the exported file. Request and response schemas, plus streaming and outline endpoints, are documented in [`docs/UPSTREAM_README.md`](docs/UPSTREAM_README.md#-generate-presentation-via-api).

## 🧱 Architecture

```
Present.ai
├── servers/nextjs      Next.js 16 app: landing page, dashboard, editor, export runtime (deploys to Vercel)
├── servers/fastapi     FastAPI backend: LLM orchestration, parsing, images, PPTX/PDF export, auth, database
├── electron            Desktop wrapper for macOS / Windows / Linux
├── templates           Built-in slide templates
├── scripts             Template converters, export-runtime sync, package checks
├── docker-compose.yml  production / development / GPU services
└── Dockerfile          Single image that runs nginx + Next.js + FastAPI
```

Requests from the browser go to Next.js. Paths under `/api/v1`, `/api/v2`, `/app_data` and `/static` are rewritten to the FastAPI service defined by `NEXT_PUBLIC_FAST_API` (or nginx when running in Docker).

## 🛠 Development

**Prerequisites:** Node.js 20+, npm, Python 3.11, [uv](https://docs.astral.sh/uv/), and Docker (optional).

Frontend only (landing page and UI, backend proxied to `http://127.0.0.1:8000`):

```bash
cd servers/nextjs
npm ci
npm run dev
```

Backend:

```bash
cd servers/fastapi
uv sync
uv run python server.py --port 8000
```

Full stack with hot reload in Docker:

```bash
docker compose up development
```

Checks:

```bash
cd servers/nextjs && npm run lint && npx tsc --noEmit && npm run build
```

```bash
npm test
```

CI runs the same checks in [`.github/workflows/test-all.yml`](.github/workflows/test-all.yml).

## 🗺 Roadmap

- Dark-mode toggle for the interface (the design tokens already support it)
- Keyboard-first command palette for the editor
- One-click backend deploy templates for Railway, Render and Fly.io
- More monochrome slide templates

## 🙏 Credits and license

Present.ai is a design-focused fork of **[Presenton](https://github.com/presenton/presenton)** by the Presenton team, released under the Apache License 2.0. The AI engine, editor, exporters and API are theirs; the landing page, monochrome design system and interface restyle are new in this repository.

Licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for third-party attributions.
