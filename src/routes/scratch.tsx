import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useServerFn } from "@tanstack/react-start";
import { BrandHeader } from "@/components/BrandHeader";
import { ScratchCard } from "@/components/ScratchCard";
import { Button } from "@/components/ui/button";
import { getSession, updateSession } from "@/lib/campaign";
import { markScratched } from "@/lib/campaign.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/scratch")({
  head: () => ({ meta: [{ title: "Scratch Your Card · Ceevees Mart" }] }),
  component: Scratch,
});

function Scratch() {
  const navigate = useNavigate();
  const scratchFn = useServerFn(markScratched);
  
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.mobile) {
      navigate({ to: "/register" });
      return;
    }
    setName(s.name);
    setMobile(s.mobile);
    setAmount(s.cashAmount ?? null);
    if (s.scratched) setShowPopup(true);
  }, [navigate]);

  const fireConfetti = () => {
    confetti({
      particleCount: 260,
      spread: 100,
      origin: { y: 0.5 },
      zIndex: 1000,
      colors: ["#d62828", "#c9a24a", "#2d6a3f", "#f5d989", "#ffffff"],
    });
    setTimeout(() => confetti({ particleCount: 140, angle: 60, spread: 70, origin: { x: 0 }, zIndex: 1000 }), 250);
    setTimeout(() => confetti({ particleCount: 140, angle: 120, spread: 70, origin: { x: 1 }, zIndex: 1000 }), 450);
  };

  const handleComplete = async () => {
    updateSession({ scratched: true });
    fireConfetti();
    setTimeout(() => setShowPopup(true), 400);
    try {
      if (mobile) await scratchFn({ data: { mobile } });
    } catch {
      // non-fatal; UX continues
    }
  };

  const handleContinue = () => {
    navigate({ to: "/reward" });
  };

  return (
    <div className="min-h-screen bg-accent/30">
      <BrandHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10 text-center">
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-black md:text-4xl"
        >
          Good luck, {name.split(" ")[0] || "friend"}! 🍀
        </motion.h1>
        <p className="mt-2 text-muted-foreground">
          Scratch a little — we'll reveal the rest!
        </p>

        <div className="my-8">
          <ScratchCard width={300} height={300} onComplete={handleComplete}>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center gap-3 text-white"
            >
              <span className="text-6xl">🎁</span>
              <span className="text-sm font-black uppercase tracking-widest opacity-90">You won</span>
              <span className="font-display text-5xl font-black leading-none">₹{amount ?? "--"}</span>
              <span className="text-xl font-black uppercase">OFF</span>
            </motion.div>
          </ScratchCard>
        </div>

        <p className="text-sm text-muted-foreground">
          👆 Use your finger or mouse to scratch the foil
        </p>
      </div>

      <AnimatePresence>
        {showPopup && amount !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border-4 border-gold bg-card shadow-pop"
            >
              <div className="bg-gradient-hero px-6 pb-6 pt-8 text-center text-primary-foreground">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="text-7xl"
                >
                  🎉
                </motion.div>
                <h2 className="mt-3 text-3xl font-black uppercase">Congratulations!</h2>
                <p className="mt-1 text-sm opacity-90">You won a prize!</p>
                <div className="my-5 inline-block rounded-2xl bg-gradient-gold px-6 py-3 text-gold-foreground shadow-card">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Cash Discount</p>
                  <p className="font-display text-5xl font-black">₹{amount} OFF</p>
                </div>
                <p className="text-xs opacity-90">
                  🔒 Your prize is locked — unlock it on the next step
                </p>
              </div>

              <div className="space-y-3 p-5">
                <Button onClick={handleContinue} variant="hero" size="xl" className="w-full">
                  Continue to Claim →
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  One quick share unlocks your reward
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
