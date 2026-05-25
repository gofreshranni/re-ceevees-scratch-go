import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { BrandHeader } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import {
  generateCoupon,
  getExpiryDate,
  getSession,
  SHARE_MESSAGE,
  updateSession,
  whatsappShareUrl,
} from "@/lib/campaign";
import { toast } from "sonner";

export const Route = createFileRoute("/reward")({
  head: () => ({ meta: [{ title: "Your Reward · Ceevees Mart" }] }),
  component: RewardPage,
});

type DisplayReward = {
  emoji: string;
  title: string;
  subtitle: string;
  terms: string;
};

function RewardPage() {
  const navigate = useNavigate();
  const [reward, setReward] = useState<DisplayReward | null>(null);
  const [coupon, setCoupon] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.shared || !s.cashAmount) {
      navigate({ to: "/scratch" });
      return;
    }
    setReward({
      emoji: "💰",
      title: `₹${s.cashAmount} OFF`,
      subtitle: "Cash discount on your bill",
      terms: `Valid on minimum purchase of ₹${Math.max(100, s.cashAmount * 20)}`,
    });
    const code = s.couponCode ?? generateCoupon();
    if (!s.couponCode) updateSession({ couponCode: code });
    setCoupon(code);

    const t = setTimeout(() => {
      setRevealed(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ["#d62828", "#c9a24a", "#2d6a3f", "#f5d989", "#ffffff"] });
      setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 70, origin: { x: 0 } }), 300);
      setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 70, origin: { x: 1 } }), 500);
    }, 400);
    return () => clearTimeout(t);
  }, [navigate]);

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(coupon);
      toast.success("Coupon copied!");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  if (!reward) return null;

  const isMega = false;

  return (
    <div className="min-h-screen bg-accent/30">
      <BrandHeader />
      <div className="mx-auto max-w-md px-4 py-8">
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotateY: 180 }}
          animate={revealed ? { scale: 1, opacity: 1, rotateY: 0 } : {}}
          transition={{ type: "spring", duration: 0.9 }}
          className={`relative overflow-hidden rounded-3xl border-4 ${isMega ? "border-gold" : "border-primary"} shadow-pop`}
        >
          <div className={`relative ${isMega ? "bg-gradient-gold" : "bg-gradient-hero"} px-6 pb-6 pt-8 text-center text-primary-foreground`}>
            {isMega && (
              <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[10px] font-black uppercase tracking-widest text-background">
                ⭐ Grand Prize ⭐
              </span>
            )}
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">You Won</p>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="my-3 text-7xl"
            >
              {reward.emoji}
            </motion.div>
            <h1 className={`text-4xl font-black ${isMega ? "text-gold-foreground" : ""}`}>
              {reward.title}
            </h1>
            <p className={`mt-1 text-sm ${isMega ? "text-gold-foreground/80" : "opacity-90"}`}>
              {reward.subtitle}
            </p>
          </div>

          <div className="bg-card p-5">
            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary bg-primary/5 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Coupon Code</p>
              <p className="my-1 font-display text-3xl font-black tracking-wider text-primary">{coupon}</p>
              <button onClick={copyCoupon} className="text-xs font-semibold text-primary underline">
                Tap to copy
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Expires</p>
                <p className="font-bold">{getExpiryDate()}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Redeem at</p>
                <p className="font-bold">Ceevees Mart, Ranni</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-secondary/10 p-3 text-xs">
              <p className="font-bold text-secondary">📍 {reward.terms}</p>
              <p className="mt-1 text-muted-foreground">
                Show this code at the billing counter. One per family. Cannot be combined with other offers.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 space-y-3">
          <Button asChild variant="whatsapp" size="lg" className="w-full">
            <a href={whatsappShareUrl(`I just won ${reward.title} at Ceevees Mart! ${SHARE_MESSAGE}`)} target="_blank" rel="noopener">
              Share My Win on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/">← Back to Offers</Link>
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border-2 border-border bg-card p-5 text-center">
          <p className="text-sm font-bold">🚀 Want more chances?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Refer 3 friends → Extra Scratch Card · 5 → Double Chance · 10 → Mega Draw entry
          </p>
        </div>
      </div>
    </div>
  );
}
