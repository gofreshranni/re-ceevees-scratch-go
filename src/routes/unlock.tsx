import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/ceevees-logo.png";
import { Button } from "@/components/ui/button";
import { getSession, SHARE_MESSAGE, updateSession, whatsappShareUrl } from "@/lib/campaign";
import { toast } from "sonner";

export const Route = createFileRoute("/unlock")({
  head: () => ({ meta: [{ title: "Unlock Your Reward · Ceevees Mart" }] }),
  component: Unlock,
});

function Unlock() {
  const navigate = useNavigate();
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.scratched) {
      navigate({ to: "/scratch" });
      return;
    }
    if (s.shared) setHasShared(true);
  }, [navigate]);

  const handleShare = () => {
    window.open(whatsappShareUrl(SHARE_MESSAGE), "_blank");
    setTimeout(() => {
      updateSession({ shared: true });
      setHasShared(true);
      toast.success("Reward unlocked! 🎉");
    }, 800);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_MESSAGE);
      toast.success("Message copied!");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="min-h-screen bg-accent/30">
      <div className="mx-auto max-w-md px-4 py-8 md:py-12 text-center flex flex-col items-center">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex justify-center"
        >
          <div className="rounded-2xl bg-white p-2.5 shadow-pop border-2 border-gold/30">
            <img src={logo} alt="Ceevees Mart" className="h-12 md:h-14 w-auto object-contain" />
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
          className="mb-6 inline-block text-7xl"
        >
          🔒
        </motion.div>

        <h1 className="text-3xl font-black md:text-4xl">One Step Away!</h1>
        <p className="mt-3 text-muted-foreground">
          Share this offer with your friends on WhatsApp to unlock your reward.
        </p>

        <div className="my-6 rounded-2xl border-2 border-dashed border-border bg-card p-4 text-left text-sm">
          <p className="whitespace-pre-line text-muted-foreground">{SHARE_MESSAGE}</p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleShare} variant="whatsapp" size="xl" className="w-full">
            <svg viewBox="0 0 24 24" fill="currentColor" className="!size-6"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zM6.6 20.13c1.676.995 3.276 1.591 5.444 1.592 5.448 0 9.886-4.434 9.888-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.927-.607z"/></svg>
            Share on WhatsApp
          </Button>
          <Button onClick={handleCopy} variant="outline" size="lg" className="w-full">
            📋 Copy message
          </Button>
        </div>

        {hasShared && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-8"
          >
            <Button onClick={() => navigate({ to: "/reward" })} variant="gold" size="xl" className="w-full animate-wiggle">
              🎁 Reveal My Reward
            </Button>
          </motion.div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Tip: Share to a WhatsApp group for the fastest unlock.
        </p>
      </div>
    </div>
  );
}
