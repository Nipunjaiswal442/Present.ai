import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Layers,
  MousePointerClick,
  Sparkles,
  Cpu,
  Globe,
  Users,
  Code2,
  Play,
} from "lucide-react";
import Reveal from "./Reveal";
import Wordmark from "./Wordmark";

const GITHUB_URL = "https://github.com/Nipunjaiswal442/Present.ai";
const VERCEL_URL =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNipunjaiswal442%2FPresent.ai&root-directory=servers%2Fnextjs&project-name=present-ai&repository-name=present-ai";

const PROVIDERS = [
  "OpenAI",
  "Gemini",
  "Anthropic",
  "Ollama",
  "LM Studio",
  "Azure OpenAI",
  "Amazon Bedrock",
  "Vertex AI",
  "OpenRouter",
  "Fireworks",
  "Together AI",
  "DeepSeek",
  "Cerebras",
  "LiteLLM",
];

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Models", href: "#models" },
  { label: "Deploy", href: "#deploy" },
];

const STEPS = [
  {
    n: "01",
    title: "Describe it, or drop a file.",
    body: "Type a sentence about the talk, or upload a PDF, Word, Excel or image. Choose slide count, language and tone in one line of controls.",
  },
  {
    n: "02",
    title: "Review the outline. Pick a look.",
    body: "Present.ai drafts a structured outline you can reorder or rewrite. Then choose from built-in templates, or your own PowerPoint design.",
  },
  {
    n: "03",
    title: "Edit, present, export.",
    body: "Drag, retype and restyle every slide in the editor. Present full screen, or export a fully editable PPTX and a PDF.",
  },
];

const FEATURES = [
  {
    icon: Layers,
    title: "Templates and custom designs",
    body: "Start from built-in decks or import your own PPTX layout. Every slide stays on-brand.",
  },
  {
    icon: MousePointerClick,
    title: "Drag-and-edit editor",
    body: "Move, resize and rewrite anything. Charts, images and text are all live objects.",
  },
  {
    icon: Code2,
    title: "Presentation API",
    body: "Generate decks from your own apps with a single authenticated HTTP call.",
  },
  {
    icon: Globe,
    title: "Web-grounded content",
    body: "Optional web search keeps facts, numbers and references current.",
  },
  {
    icon: Users,
    title: "Multi-user, self-hosted",
    body: "Admin and user roles, sessions and API keys. Your data never leaves your server.",
  },
  {
    icon: Sparkles,
    title: "Smart mode",
    body: "Stream a finished deck straight from a prompt, or borrow a community design as a reference.",
  },
];

function SlideTile({ variant, delay }: { variant: number; delay: string }) {
  const dark = variant % 2 === 1;
  return (
    <div
      className={`pai-fall ${delay} aspect-[16/10] w-full overflow-hidden rounded-2xl border ${
        dark ? "border-white/10 bg-[#0d0d0f]" : "border-black/[0.06] bg-white"
      } p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)]`}
    >
      <div className={`h-2 w-1/2 rounded-full ${dark ? "bg-white" : "bg-black"}`} />
      <div className="mt-3 space-y-1.5">
        <div className={`h-1.5 w-11/12 rounded-full ${dark ? "bg-white/25" : "bg-black/10"}`} />
        <div className={`h-1.5 w-9/12 rounded-full ${dark ? "bg-white/25" : "bg-black/10"}`} />
        <div className={`h-1.5 w-10/12 rounded-full ${dark ? "bg-white/25" : "bg-black/10"}`} />
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        {[40, 70, 55, 90, 65].map((h, i) => (
          <div
            key={i}
            className={`w-full rounded-sm ${dark ? "bg-white/80" : "bg-black/80"}`}
            style={{ height: `${h * 0.42}px`, opacity: 0.35 + i * 0.13 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="pai-canvas relative min-h-dvh overflow-x-hidden text-[#111]">
      {/* ambient light */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
        <div className="pai-orb left-[10%] top-[-10%] h-[520px] w-[520px] bg-black/[0.07]" />
        <div className="pai-orb right-[5%] top-[10%] h-[420px] w-[420px] bg-black/[0.05]" style={{ animationDelay: "-9s" }} />
      </div>

      {/* Nav */}
      <header className="pai-fall fixed inset-x-0 top-4 z-50 px-4">
        <nav className="glass-strong mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-5 pr-2">
          <Wordmark href="/" />
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-[13.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.05] hover:text-black"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-black/65 transition-colors hover:bg-black/[0.05] hover:text-black"
              >
                GitHub <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
          <Link href="/start" className="pai-btn pai-btn-black h-10 px-4 text-[13.5px]">
            Open app
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-40 text-center sm:pt-44">
        <p className="pai-fall pai-delay-1 pai-eyebrow">Open source · Self-hosted · Your models</p>
        <h1 className="pai-fall pai-delay-2 pai-display mx-auto mt-6 max-w-4xl text-[44px] sm:text-[68px] lg:text-[88px]">
          Presentations that
          <br />
          <span className="pai-text-gradient-dark">write themselves.</span>
        </h1>
        <p className="pai-fall pai-delay-3 mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-black/60 sm:text-[20px]">
          Present.ai turns a prompt or a document into a finished, fully editable deck.
          Runs on your machine, with the AI model you choose. No subscription, no lock-in.
        </p>
        <div className="pai-fall pai-delay-4 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/start" className="pai-btn pai-btn-black h-12 px-6 text-[15px]">
            Start creating <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="pai-btn pai-btn-ghost h-12 px-6 text-[15px]"
          >
            View on GitHub
          </a>
        </div>

        {/* Composer preview */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="glass-strong pai-fall pai-delay-5 rounded-[28px] p-3 sm:p-4">
            <div className="rounded-[20px] border border-black/[0.06] bg-white/80 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,1)] sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {["10 slides", "Auto language", "Professional tone", "Standard mode"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-black/[0.08] bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-black/70"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-[17px] leading-relaxed text-black/85 sm:text-[20px]">
                Create a 10-slide investor update for a climate-tech startup. Cover traction, unit
                economics, the roadmap for the next two quarters and the ask.
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-black" />
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-black/50">
                  <FileText className="h-4 w-4" />
                  <span>Attach PDF, DOCX, XLSX or images</span>
                </div>
                <span className="pai-btn pai-btn-black h-10 px-4 text-[13.5px]">
                  Generate <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <SlideTile variant={1} delay="pai-delay-5" />
            <SlideTile variant={0} delay="pai-delay-6" />
            <SlideTile variant={1} delay="pai-delay-7" />
            <SlideTile variant={0} delay="pai-delay-8" />
          </div>
        </div>
      </section>

      {/* Providers marquee */}
      <section id="models" className="relative py-10">
        <Reveal className="mx-auto max-w-6xl px-6 text-center">
          <p className="pai-eyebrow">Bring your own model</p>
        </Reveal>
        <Reveal delay={120} className="relative mt-6 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#f5f5f7] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#f5f5f7] to-transparent" />
          <div className="pai-marquee flex w-max gap-3 px-3">
            {[...PROVIDERS, ...PROVIDERS].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="glass-pill whitespace-nowrap px-5 py-2.5 text-[14px] font-medium text-black/75"
              >
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Bento tiles */}
      <section id="features" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Prompt to deck */}
          <Reveal className="group relative min-h-[460px] overflow-hidden rounded-[32px] border border-black/[0.06] bg-white">
            <div className="px-8 pt-12 text-center sm:px-12">
              <h2 className="pai-display text-[38px] sm:text-[46px]">Prompt to deck.</h2>
              <p className="mx-auto mt-3 max-w-md text-[17px] text-black/60">
                One sentence in. A structured outline out, then every slide, written and laid out.
              </p>
            </div>
            <div className="mx-auto mt-10 w-[78%] max-w-md">
              <div className="glass rounded-2xl p-5">
                {["Traction and revenue", "Unit economics", "Roadmap: next two quarters", "The ask"].map(
                  (line, i) => (
                    <div key={line} className="flex items-center gap-3 py-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-[11px] font-semibold text-white">
                        {i + 1}
                      </span>
                      <span className="text-[14px] font-medium text-black/80">{line}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </Reveal>

          {/* Documents to slides (dark) */}
          <Reveal delay={100} className="pai-canvas-dark relative min-h-[460px] overflow-hidden rounded-[32px] border border-white/10">
            <div className="px-8 pt-12 text-center sm:px-12">
              <h2 className="pai-display text-[38px] text-white sm:text-[46px]">Documents to slides.</h2>
              <p className="mx-auto mt-3 max-w-md text-[17px] text-white/60">
                Drop a report, a spreadsheet or a scan. Present.ai reads it and builds the story.
              </p>
            </div>
            <div className="mx-auto mt-10 flex w-[82%] max-w-md items-end justify-center gap-4">
              {["PDF", "DOCX", "XLSX", "PNG"].map((ext, i) => (
                <div
                  key={ext}
                  className="glass-dark flex h-28 w-24 flex-col items-center justify-end rounded-2xl pb-3"
                  style={{ transform: `translateY(${(i % 2) * 10}px)` }}
                >
                  <FileText className="mb-2 h-6 w-6 text-white/80" />
                  <span className="text-[12px] font-semibold tracking-wide text-white/80">{ext}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Your models (dark) */}
          <Reveal delay={150} className="pai-canvas-dark relative min-h-[460px] overflow-hidden rounded-[32px] border border-white/10">
            <div className="px-8 pt-12 text-center sm:px-12">
              <h2 className="pai-display text-[38px] text-white sm:text-[46px]">Your models. Your keys.</h2>
              <p className="mx-auto mt-3 max-w-md text-[17px] text-white/60">
                Cloud or local. Switch providers in Settings without touching your decks.
              </p>
            </div>
            <div className="mx-auto mt-10 grid w-[82%] max-w-md grid-cols-2 gap-3">
              {["OpenAI", "Gemini", "Anthropic", "Ollama", "Azure", "Bedrock"].map((p) => (
                <div key={p} className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3">
                  <Cpu className="h-4 w-4 text-white/70" />
                  <span className="text-[14px] font-medium text-white/90">{p}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Export */}
          <Reveal delay={200} className="relative min-h-[460px] overflow-hidden rounded-[32px] border border-black/[0.06] bg-white">
            <div className="px-8 pt-12 text-center sm:px-12">
              <h2 className="pai-display text-[38px] sm:text-[46px]">Editable, everywhere.</h2>
              <p className="mx-auto mt-3 max-w-md text-[17px] text-black/60">
                Export a real PPTX you can keep editing in PowerPoint or Keynote, plus a crisp PDF.
              </p>
            </div>
            <div className="mx-auto mt-10 flex w-[82%] max-w-md items-center justify-center gap-4">
              {[
                { ext: ".PPTX", dark: true },
                { ext: ".PDF", dark: false },
              ].map(({ ext, dark }) => (
                <div
                  key={ext}
                  className={`flex h-32 w-40 flex-col items-center justify-center rounded-3xl border ${
                    dark ? "border-black bg-black text-white" : "glass text-black"
                  }`}
                >
                  <span className="pai-display text-[26px]">{ext}</span>
                  <span className={`mt-1 text-[12px] ${dark ? "text-white/60" : "text-black/50"}`}>
                    fully editable
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl px-6 py-20">
        <Reveal className="text-center">
          <p className="pai-eyebrow">How it works</p>
          <h2 className="pai-display mt-4 text-[40px] sm:text-[56px]">Three steps. No tension.</h2>
        </Reveal>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="pai-drop-line absolute left-[27px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-black/40 via-black/20 to-transparent md:left-1/2"
          />
          <ol className="space-y-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} as="li" delay={i * 120} className="relative md:grid md:grid-cols-2 md:gap-12">
                <div className={`md:contents`}>
                  <div
                    className={`flex items-start gap-5 md:block ${
                      i % 2 === 0 ? "md:col-start-1 md:text-right" : "md:col-start-2"
                    }`}
                  >
                    <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-black text-[13px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,.6)] md:hidden">
                      {step.n}
                    </span>
                    <div className="glass glass-hover w-full rounded-3xl p-6 sm:p-8">
                      <span className="pai-eyebrow">{step.n}</span>
                      <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[15.5px] leading-relaxed text-black/60">{step.body}</p>
                    </div>
                  </div>
                </div>
                <span className="absolute left-1/2 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-[#f5f5f7] bg-black md:block" />
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal className="text-center">
          <p className="pai-eyebrow">Everything included</p>
          <h2 className="pai-display mt-4 text-[36px] sm:text-[48px]">Built for real work.</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80} className="glass glass-hover rounded-3xl p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.02em]">{f.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-black/60">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Deploy */}
      <section id="deploy" className="px-4 pb-6 pt-10 sm:px-6">
        <Reveal className="pai-canvas-dark mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/10 px-6 py-16 text-center sm:px-12 sm:py-24">
          <p className="pai-eyebrow text-white/50">Deploy</p>
          <h2 className="pai-display pai-text-gradient mt-4 text-[40px] sm:text-[64px]">Run it anywhere.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] text-white/60">
            One Docker command for the full stack. Or push the interface to Vercel and point it at
            your backend.
          </p>
          <div className="glass-dark mx-auto mt-10 max-w-3xl rounded-2xl p-1 text-left">
            <pre className="overflow-x-auto rounded-xl bg-black/50 px-5 py-4 font-mono text-[13px] leading-relaxed text-white/85">
              <code>{`docker run -it --name present-ai -p 5001:80 \\
  -v "./app_data:/app_data" ghcr.io/presenton/presenton:latest`}</code>
            </pre>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={VERCEL_URL} target="_blank" rel="noreferrer" className="pai-btn pai-btn-white h-12 px-6">
              <Play className="h-4 w-4" /> Deploy to Vercel
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="pai-btn pai-btn-ghost-light h-12 px-6">
              Read the docs on GitHub <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 text-[13px] text-black/50 sm:flex-row">
        <Wordmark href="/" size="sm" />
        <p>
          Built on{" "}
          <a href="https://github.com/presenton/presenton" className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Presenton
          </a>{" "}
          · Apache 2.0 · Your data stays on your server.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/start" className="hover:text-black">Open app</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-black">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
