import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useServerFn } from "@tanstack/react-start";
import { Lock, Download } from "lucide-react";
import logo from "@/assets/ceevees-logo.png";
import { Button } from "@/components/ui/button";
import { toJpeg } from "html-to-image";
import {
  generateCoupon,
  getExpiryDate,
  getSession,
  SHARE_MESSAGE,
  updateSession,
  whatsappShareUrl,
} from "@/lib/campaign";
import { markShared } from "@/lib/campaign.functions";
import { toast } from "sonner";
import rewardBanner1 from "@/assets/reward-banner-1.png";
import rewardBanner2 from "@/assets/reward-banner-2.png";
import rewardBanner3 from "@/assets/reward-banner-3.jpg";
import rewardBanner4 from "@/assets/reward-banner-4.jpg";

export const Route = createFileRoute("/reward")({
  head: () => ({
    meta: [
      { title: "Your Reward · Ceevees Mart" },
      { name: "description", content: "Claim your exciting scratch card discount or gift at Ceevees Mart, Ranni!" },
      { property: "og:title", content: "🎁 Your Reward · Ceevees Mart Scratch & Win!" },
      { property: "og:description", content: "Mega Back to School Offers! Scratch to win instant cash discounts, free notebooks & gifts!" },
      { property: "og:image", content: "/whatsapp-share.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "800" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "🎁 Your Reward · Ceevees Mart Scratch & Win!" },
      { name: "twitter:description", content: "Mega Back to School Offers! Scratch to win instant cash discounts, free notebooks & gifts!" },
      { name: "twitter:image", content: "/whatsapp-share.png" },
    ],
  }),
  component: RewardPage,
});

const OFFERS = [
  { src: rewardBanner1, alt: "Chapters Notebooks — Buy 3 Get 2 Offer", delay: 0.05, xDir: -45 },
  { src: rewardBanner2, alt: "Chapters Notebooks — Buy 2 Get 1 Offer", delay: 0.1, xDir: 45 },
  { src: rewardBanner3, alt: "Free Bag Cover or 3 Notebooks with every school bag", delay: 0.15, xDir: -45 },
  { src: rewardBanner4, alt: "Back to School Mega Sale Campaign Banner", delay: 0.2, xDir: 45 },
];

function RewardPage() {
  const navigate = useNavigate();
  const sharedFn = useServerFn(markShared);
  const [amount, setAmount] = useState<number | null>(null);
  const [mobile, setMobile] = useState("");
  const [coupon, setCoupon] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [sharing, setSharing] = useState(false);
  const sharedClickedRef = useRef(false);

  const couponRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!couponRef.current) return;
    setDownloading(true);
    toast.info("Preparing your coupon image...");
    try {
      const dataUrl = await toJpeg(couponRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      const link = document.createElement("a");
      link.download = `ceevees_mart_coupon_${coupon}.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success("Coupon saved! 📸");
    } catch (error) {
      console.error("Screenshot export error:", error);
      toast.error("Download failed. Please take a manual screenshot!");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const s = getSession();
    if (!s || !s.cashAmount) {
      navigate({ to: "/scratch" });
      return;
    }
    setAmount(s.cashAmount);
    setMobile(s.mobile);
    if (s.shared) {
      const code = s.couponCode ?? generateCoupon();
      if (!s.couponCode) updateSession({ couponCode: code });
      setCoupon(code);
      setUnlocked(true);
    }

    // Fire confetti if the user just arrived from scratching
    if (sessionStorage.getItem("just_scratched") === "true") {
      sessionStorage.removeItem("just_scratched");
      // Fire confetti with a tiny delay so the page mounts completely first
      setTimeout(() => {
        fireConfetti();
      }, 400);
    }
  }, [navigate]);

  const fireConfetti = () => {
    confetti({
      particleCount: 220,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#d62828", "#c9a24a", "#2d6a3f", "#f5d989", "#ffffff"],
    });
    setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0 } }), 250);
    setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 70, origin: { x: 1 } }), 450);
  };

  const doUnlock = async () => {
    if (unlocked) return;
    let code = generateCoupon();
    try {
      if (mobile) {
        const res = await sharedFn({ data: { mobile } });
        code = res.couponCode ?? code;
      }
    } catch {
      // continue with local coupon
    }
    updateSession({ shared: true, couponCode: code });
    setCoupon(code);
    setUnlocked(true);
    setSharing(false);
    fireConfetti();
    toast.success("Prize unlocked! 🎁");
  };

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && sharedClickedRef.current && !unlocked) {
        doUnlock();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, mobile]);

  const handleShare = () => {
    if (amount === null) return;
    sharedClickedRef.current = true;
    setSharing(true);
    const msg = `🎉 I just won ₹${amount} OFF at Ceevees Mart Back-to-School Scratch & Win! ${SHARE_MESSAGE}`;
    window.open(whatsappShareUrl(msg), "_blank");
    // Fallback: auto-unlock after a short delay even if visibilitychange doesn't fire
    setTimeout(() => {
      if (!unlocked) doUnlock();
    }, 2500);
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(coupon);
      toast.success("Coupon copied!");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  if (amount === null) return null;

  return (
    <div className="min-h-screen bg-accent/30">
      <div className="mx-auto max-w-md px-4 py-8 flex flex-col items-center">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex justify-center"
        >
          <div className="rounded-2xl bg-white p-2.5 shadow-pop border-2 border-gold/30">
            <img src={logo} alt="Ceevees Mart" className="h-12 md:h-14 w-auto object-contain" />
          </div>
        </motion.div>

        <div ref={couponRef} className="w-full relative overflow-hidden rounded-3xl border-4 border-primary shadow-pop bg-card">
          <div className="relative bg-gradient-hero px-6 pb-6 pt-8 text-center text-primary-foreground">
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">You Won</p>

            {/* Prize content (blurred when locked) */}
            <div className={!unlocked ? "pointer-events-none select-none blur-md" : ""}>
              <motion.div
                animate={unlocked ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.8 }}
                className="my-3 text-7xl"
              >
                💰
              </motion.div>
              <h1 className="text-4xl font-black">₹{amount} OFF</h1>
              <p className="mt-1 text-sm opacity-90">Cash discount on your bill</p>
            </div>

            {/* Lock overlay */}
            <AnimatePresence>
              {!unlocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-[2px]"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="flex size-20 items-center justify-center rounded-full border-4 border-white/80 bg-black/40 shadow-pop"
                  >
                    <Lock className="size-10 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <p className="mt-2 text-lg font-black uppercase tracking-wider">Prize Locked</p>
                  <p className="text-xs opacity-90">Share to WhatsApp Group to unlock</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {unlocked ? (
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
                <p className="font-bold text-secondary">
                  📍 Valid on minimum purchase of ₹1500
                </p>
                <p className="mt-1 text-muted-foreground">
                  Show this code at the billing counter. One per family. Cannot be combined with other offers.
                </p>
              </div>

              <p className="mt-4 text-center text-[11px] font-bold text-amber-600 bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/20">
                📸 Take a screenshot of the code you received, or click the download button below to avail the discount at our store!
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  size="default"
                  className="w-full font-bold shadow-pop"
                >
                  <Download className="size-4 mr-2" />
                  {downloading ? "Saving..." : "Download"}
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="w-full font-bold shadow-pop border-primary text-primary hover:bg-primary/5"
                >
                  <a
                    href="https://www.google.com/maps/dir//CeeVees+Mart,+Ittiyappara,+Aythala+Road,+Ranni,+Kerala+689673/@9.384905,76.7847914,17z/data=!4m17!1m7!3m6!1s0x3b0639f5baa1d013:0xd96cc19b70249355!2sCeeVees+Mart!8m2!3d9.3848997!4d76.7873663!16s%2Fg%2F11svb8lvgh!4m8!1m0!1m5!1m1!1s0x3b0639f5baa1d013:0xd96cc19b70249355!2m2!1d76.7873553!2d9.384897!3e2?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📍 Store Map
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-card p-5">
              <Button onClick={handleShare} disabled={sharing} variant="whatsapp" size="xl" className="w-full">
                <svg viewBox="0 0 24 24" fill="currentColor" className="!size-6">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zM6.6 20.13c1.676.995 3.276 1.591 5.444 1.592 5.448 0 9.886-4.434 9.888-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.927-.607z" />
                </svg>
                {sharing ? "Waiting for share…" : "Share to WhatsApp Group"}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Share with your group, then come back — your prize will be unlocked automatically.
              </p>
            </div>
          )}
        </div>

        {/* Animated Campaign Banners */}
        <div className="mt-8 w-full space-y-5">
          <div className="text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary">
              🔥 Don't Miss These Mega Deals!
            </h3>
            <p className="text-[10px] text-muted-foreground">Running in-store now at Ceevees Mart</p>
          </div>
          {OFFERS.map((offer) => (
            <motion.div
              key={offer.alt}
              initial={{ opacity: 0, x: offer.xDir, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: offer.delay, type: "spring", stiffness: 70 }}
              whileHover={{ scale: 1.02 }}
              className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-card"
            >
              <img src={offer.src} alt={offer.alt} className="block w-full h-auto" />
            </motion.div>
          ))}
        </div>

        {unlocked && (
          <div className="mt-6 space-y-3">
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/">← Back to Offers</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
