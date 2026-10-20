"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Download, Share, PlusSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
const InstallContext = createContext<{
  installed: boolean; ios: boolean; prompt: InstallPrompt | null;
  clearPrompt: () => void;
}>({ installed: false, ios: false, prompt: null, clearPrompt: () => {} });

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const syncInstalled = () => setInstalled(display.matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone) || Boolean(window.electron));
    const syncOnline = () => setOffline(!navigator.onLine);
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const didInstall = () => { setInstalled(true); setPrompt(null); };
    syncInstalled(); syncOnline();
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    display.addEventListener("change", syncInstalled);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", didInstall);
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator &&
        window.isSecureContext && !window.electron) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installation still works on iOS if offline support is unavailable.
      });
    }
    return () => {
      display.removeEventListener("change", syncInstalled);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", didInstall);
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
    };
  }, []);
  return <InstallContext.Provider value={{ installed, ios, prompt, clearPrompt: () => setPrompt(null) }}>
    {offline && <div role="status" className="fixed inset-x-3 top-[max(12px,env(safe-area-inset-top))] z-[100] mx-auto max-w-lg rounded-2xl bg-black px-4 py-3 text-center text-sm text-white shadow-lg">
      You’re offline. Reconnect to generate, save, or export a presentation.
    </div>}
    {children}
  </InstallContext.Provider>;
}

export function InstallAppButton({ className = "" }: { className?: string }) {
  const { installed, ios, prompt, clearPrompt } = useContext(InstallContext);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (installed) return null;
  async function install() {
    if (!prompt) { setOpen(true); return; }
    setBusy(true);
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { setOpen(true); }
    finally { clearPrompt(); setBusy(false); }
  }
  return <>
    <button type="button" onClick={install} disabled={busy} aria-label="Install app"
      className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-xs font-medium text-black/70 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${className}`}>
      <Download aria-hidden="true" className="h-4 w-4" /><span>Install app</span>
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-3xl p-6 sm:max-w-md">
        <div aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-black text-2xl font-bold text-white">P</div>
        <DialogTitle className="text-2xl">Present.ai, one tap away.</DialogTitle>
        <DialogDescription>Keep your presentation studio on your Home Screen. An internet connection is needed to create and export decks.</DialogDescription>
        {ios ? <ol className="space-y-4 py-2 text-sm leading-6">
          <li className="flex gap-3"><Share className="mt-1 h-5 w-5 shrink-0" /><span>Open this website in Safari and tap <strong>Share</strong>.</span></li>
          <li className="flex gap-3"><PlusSquare className="mt-1 h-5 w-5 shrink-0" /><span>Choose <strong>Add to Home Screen</strong>. Keep <strong>Open as Web App</strong> enabled if shown, then tap <strong>Add</strong>.</span></li>
        </ol> : <p className="py-2 text-sm leading-6">In your browser’s menu, choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>. On iPhone, open this site in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p>}
      </DialogContent>
    </Dialog>
  </>;
}
