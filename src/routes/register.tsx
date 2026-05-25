import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import logo from "@/assets/ceevees-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSession } from "@/lib/campaign";
import { registerForCampaign } from "@/lib/campaign.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register · Ceevees Mart Scratch & Win" },
      { name: "description", content: "Register with your mobile number to claim your free Back to School scratch card." },
      { property: "og:title", content: "🎁 Register · Ceevees Mart Scratch & Win!" },
      { property: "og:description", content: "Mega Back to School Offers! Scratch to win instant cash discounts, free notebooks & gifts!" },
      { property: "og:image", content: "/whatsapp-share.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "800" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "🎁 Register · Ceevees Mart Scratch & Win!" },
      { name: "twitter:description", content: "Mega Back to School Offers! Scratch to win instant cash discounts, free notebooks & gifts!" },
      { name: "twitter:image", content: "/whatsapp-share.png" },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const register = useServerFn(registerForCampaign);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Please enter your name");
    if (!/^[6-9]\d{9}$/.test(mobile)) return toast.error("Enter a valid 10-digit mobile number");

    setSubmitting(true);
    try {
      const res = await register({
        data: { name: name.trim(), mobile, email: email.trim() },
      });
      setSession({
        name: res.name,
        mobile: res.mobile,
        email: email.trim() || undefined,
        cashAmount: res.cashAmount,
        couponCode: res.couponCode ?? undefined,
        scratched: res.scratched,
        shared: res.shared,
        createdAt: Date.now(),
        referrals: 0,
      });
      toast.success("Loading your card…");
      setTimeout(() => navigate({ to: "/scratch" }), 300);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent/30">
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8 md:py-12">
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
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-3xl border-2 border-border bg-card p-6 shadow-pop md:p-8"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-black">Claim Your Card 🎁</h1>
            <p className="mt-1 text-sm text-muted-foreground">Free, takes 30 seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anu Mathew" maxLength={50} required className="mt-1.5 h-12 text-base" />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="mt-1.5 flex items-center gap-2 rounded-md border border-input bg-background pl-3 has-[input:focus]:ring-1 has-[input:focus]:ring-ring">
                <span className="text-sm font-medium text-muted-foreground">+91</span>
                <Input id="mobile" inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" maxLength={10} required className="h-12 border-0 px-0 text-base focus-visible:ring-0" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={100} className="mt-1.5 h-12 text-base" />
            </div>
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={submitting}>{submitting ? "Just a moment…" : "Get My Scratch Card →"}</Button>
            <p className="text-center text-[11px] text-muted-foreground">By continuing you agree to the campaign terms.</p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
