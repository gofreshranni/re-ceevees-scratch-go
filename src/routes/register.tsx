import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrandHeader } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSession, getSession } from "@/lib/campaign";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register · Ceevees Mart Scratch & Win" },
      { name: "description", content: "Register with your mobile number to claim your free Back to School scratch card." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Please enter your name");
    if (!/^[6-9]\d{9}$/.test(mobile)) return toast.error("Enter a valid 10-digit mobile number");

    const existing = getSession();
    if (existing?.mobile === mobile && existing.scratched) {
      return toast.error("This mobile number has already used its scratch card.");
    }

    setSession({
      name: name.trim(),
      mobile,
      email: email.trim() || undefined,
      createdAt: Date.now(),
      referrals: 0,
    });
    toast.success("Loading your card…");
    setTimeout(() => navigate({ to: "/scratch" }), 400);
  };

  return (
    <div className="min-h-screen bg-accent/30">
      <BrandHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
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
            <Button type="submit" variant="hero" size="xl" className="w-full">Get My Scratch Card →</Button>
            <p className="text-center text-[11px] text-muted-foreground">By continuing you agree to the campaign terms.</p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
