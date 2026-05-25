import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useServerFn } from "@tanstack/react-start";
import logo from "@/assets/ceevees-logo.png";
import { ScratchCard } from "@/components/ScratchCard";
import { Button } from "@/components/ui/button";
import { getSession, updateSession } from "@/lib/campaign";
import { markScratched } from "@/lib/campaign.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/scratch")({
  head: () => ({
    meta: [
      { title: "Scratch Your Card · Ceevees Mart" },
      { name: "description", content: "Scratch your card online to reveal your exciting gift or instant discount at Ceevees Mart, Ranni." },
      { property: "og:title", content: "🎁 Scratch Your Card · Ceevees Mart Scratch & Win!" },
      { property: "og:description", content: "Mega Back to School Offers! Scratch to win instant cash discounts, free notebooks & gifts!" },
      { property: "og:image", content: "/whatsapp-share.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "800" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "🎁 Scratch Your Card · Ceevees Mart Scratch & Win!" },
      { name: "twitter:description", content: "Mega Back to School Offers! Scratch to win instant cash discounts, free notebooks & gifts!" },
      { name: "twitter:image", content: "/whatsapp-share.png" },
    ],
  }),
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
    if (s.scratched) {
      // If already scratched, bypass the scratch card and go directly to rewards
      navigate({ to: "/reward" });
    }
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
    sessionStorage.setItem("just_scratched", "true");
    fireConfetti();
    setShowPopup(true);
    
    // Auto-redirect to the reward page after 2.5 seconds
    setTimeout(() => {
      navigate({ to: "/reward" });
    }, 2500);

    try {
      if (mobile) await scratchFn({ data: { mobile } });
    } catch {
      // non-fatal; UX continues
    }
  };

  return (
    <div className="min-h-screen bg-accent/30">
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8 md:py-12 text-center">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex justify-center"
        >
          <div className="rounded-2xl bg-white p-2.5 shadow-pop border-2 border-gold/30">
            <img src={logo} alt="Ceevees Mart" className="h-12 md:h-14 w-auto object-contain" />
          </div>
        </motion.div>

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
        {showPopup && (
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
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border-4 border-gold bg-card shadow-pop animate-pulse-subtle"
            >
              <div className="bg-gradient-hero px-6 pb-8 pt-10 text-center text-primary-foreground">
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, -10, 10, -10, 10, 0] 
                  }}
                  transition={{ 
                    duration: 1.6,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="text-8xl filter drop-shadow-md mb-2"
                >
                  🎉
                </motion.div>
                <h2 className="mt-4 text-3xl font-black uppercase tracking-tight">Congratulations!</h2>
                <p className="mt-2 text-base font-medium opacity-90">You won a special Back-to-School gift!</p>
                
                <div className="my-6 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center size-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-dashed border-gold opacity-80"
                    />
                    <motion.span
                      animate={{ scale: [0.9, 1.1, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl"
                    >
                      🎁
                    </motion.span>
                  </div>
                  <p className="mt-4 text-xs font-bold tracking-wider uppercase text-gold animate-pulse">
                    Preparing your reward...
                  </p>
                </div>
                
                <p className="text-xs opacity-80 max-w-[240px] mx-auto">
                  Taking you to the reward page to claim and unlock your coupon!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
