import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitCampaignLead } from "@/lib/campaign.functions";
import { X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import appCss from "../styles.css?url";
import logoVaw from "@/assets/vaw-logo.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ceevees Mart — Back to School Scratch & Win" },
      { name: "description", content: "Scratch & Win exciting school gifts, free notebooks and instant discounts at Ceevees Mart, Ranni." },
      { name: "author", content: "Ceevees Mart" },
      { property: "og:title", content: "Ceevees Mart — Back to School Scratch & Win" },
      { property: "og:description", content: "Try your luck. Every scratch wins something at Ceevees Mart's Back to School campaign." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const submitLead = useServerFn(submitCampaignLead);
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadMobile, setLeadMobile] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(leadMobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setSubmittingLead(true);
    try {
      await submitLead({
        data: { name: leadName.trim(), mobile: leadMobile },
      });
      toast.success("Thank you! Our campaign strategists will contact you shortly.");
      setIsLeadModalOpen(false);
      setLeadName("");
      setLeadMobile("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        
        {/* Global Premium Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-zinc-400">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
            {/* Left: Developed by VAW Technologies */}
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <div className="flex items-center gap-2">
                <img src={logoVaw} alt="VAW Technologies" className="h-6 w-auto object-contain" />
              </div>
              <p className="text-[11px] font-medium tracking-wide text-zinc-500">
                Platform developed and designed by <span className="font-semibold text-zinc-300">VAW technologies</span>
              </p>
            </div>

            {/* Right: CTA Button */}
            <div className="flex flex-col items-center gap-1.5 sm:items-end">
              <button
                onClick={() => setIsLeadModalOpen(true)}
                className="group flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-white shadow-pop border border-zinc-700/50 transition-all hover:bg-zinc-700 active:translate-y-0.5 cursor-pointer"
              >
                Create your campaigns and events
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </button>
              <p className="text-[10px] text-zinc-600">Grow your business with interactive brand campaigns</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Breathtaking Modal Popup */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-pop text-zinc-100 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              >
                <X className="size-5" />
              </button>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Sparkles className="size-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">VAW Campaigns</span>
                  </div>
                  <h3 className="text-lg font-black text-white">Create Your Campaign</h3>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Partner with VAW Technologies to build custom, viral, interactive events for your brand.
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      Brand / Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ceevees Mart"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                      disabled={submittingLead}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      Contact Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={leadMobile}
                      onChange={(e) => setLeadMobile(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                      disabled={submittingLead}
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLeadModalOpen(false)}
                      className="flex-1 rounded-xl border border-zinc-800 bg-transparent py-2.5 text-xs font-bold text-zinc-400 transition-colors hover:bg-zinc-900"
                      disabled={submittingLead}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground py-2.5 text-xs font-bold shadow-pop hover:brightness-105 active:translate-y-0.5 transition-all disabled:opacity-50"
                      disabled={submittingLead}
                    >
                      {submittingLead ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="size-3.5" /> Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
