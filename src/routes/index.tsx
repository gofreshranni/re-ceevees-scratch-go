import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import logo from "@/assets/ceevees-logo.png";
import { Button } from "@/components/ui/button";
import offerChaptersCombo from "@/assets/offer-chapters-combo.jpg";
import offerFreeBagcover from "@/assets/offer-free-bagcover.jpg";
import offerBuy30Get20 from "@/assets/offer-buy30-get20.png";
import offerSchoolSale from "@/assets/offer-school-sale.jpg";
import bagCollection1 from "@/assets/bag-collection-1.png";
import bagCollection2 from "@/assets/bag-collection-2.png";
import bagCollection3 from "@/assets/bag-collection-3.jpg";
import bagCollection4 from "@/assets/bag-collection-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ceevees Mart — Back to School Scratch & Win" },
      { name: "description", content: "Scratch & Win exciting school gifts, free notebooks, discounts and mega prizes at Ceevees Mart's Back to School campaign." },
      { property: "og:title", content: "Ceevees Mart — Back to School Scratch & Win" },
      { property: "og:description", content: "Try your luck. Win free notebooks, school bags and instant discounts at Ceevees Mart, Ranni." },
    ],
  }),
  component: LandingPage,
});

const OFFER_BANNERS = [
  { src: offerChaptersCombo, alt: "Chapters Notebooks — Buy 3 Get 2 & Buy 2 Get 1 Offers" },
  { src: offerFreeBagcover, alt: "Free Bag Cover or 3 Notebooks with every school bag" },
  { src: offerBuy30Get20, alt: "Buy 30 Get 20 Free on Chapters Notebooks" },
  { src: offerSchoolSale, alt: "Back to School Mega Sale Campaign Banner" },
];

const BAG_COLLECTIONS = [
  { src: bagCollection1, alt: "Exclusive School Bag Collections — Frozen, Spider-Man, Batman & more" },
  { src: bagCollection2, alt: "Premium School Bag Collections — Wild Army, Quest, Safari" },
  { src: bagCollection3, alt: "New Exclusive School Bag Arrivals — Wild Army Spotlight Collections" },
  { src: bagCollection4, alt: "New Premium School Bag Arrivals — Built For Big Dreams Series" },
];

const CATEGORIES = [
  { emoji: "🎒", name: "School Bags" },
  { emoji: "🧃", name: "Water Bottles" },
  { emoji: "🍱", name: "Lunch Boxes" },
  { emoji: "📐", name: "Geometry Boxes" },
  { emoji: "📚", name: "Notebooks" },
  { emoji: "✏️", name: "Stationery" },
  { emoji: "👟", name: "School Shoes" },
  { emoji: "👕", name: "Uniform Accessories" },
];

function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.45_0.18_250)] via-[oklch(0.38_0.20_255)] to-[oklch(0.28_0.18_260)]">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1.5px, transparent 2px), radial-gradient(circle at 80% 70%, white 1px, transparent 1.5px), radial-gradient(circle at 50% 50%, white 1px, transparent 1.5px)",
            backgroundSize: "60px 60px, 90px 90px, 120px 120px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-12 text-center text-primary-foreground md:py-20">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-auto mb-8 flex justify-center"
          >
            <div className="rounded-3xl bg-white p-3 shadow-pop border-2 border-gold/30 hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Ceevees Mart" className="h-16 md:h-20 w-auto object-contain" />
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="mx-auto mb-4 inline-block rounded-full bg-gold px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-foreground shadow-card"
          >
            🎒 Mega Campaign · May 14 – June 30
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black uppercase leading-[1.05] md:text-7xl md:leading-[1.05]"
            style={{ textShadow: "0 4px 0 rgba(0,0,0,0.2)" }}
          >
            Back to{" "}
            <span className="inline-block bg-gradient-gold bg-clip-text px-2 text-transparent">
              School
            </span>
            <br />
            Scratch & Win
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-5 max-w-md text-base opacity-95 md:text-lg"
          >
            Free notebooks, school bag gifts, instant discounts and mega prizes — every scratch wins!
          </motion.p>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mt-8"
          >
            <Button asChild variant="gold" size="xl" className="animate-wiggle">
              <Link to="/register">🎁 Get My Scratch Card</Link>
            </Button>
            <p className="mt-3 text-xs opacity-80">Free · 1 card per mobile number</p>
          </motion.div>

        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black md:text-4xl">🔥 BACK TO SCHOOL MEGA DEALS</h2>
          <p className="mt-2 text-muted-foreground">Real offers running in-store at Ceevees Mart, Ranni</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 items-start">
          {OFFER_BANNERS.map((b, i) => (
            <motion.div
              key={b.alt}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-card"
            >
              <img src={b.src} alt={b.alt} loading="lazy" className="block h-auto w-full" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.22_0.05_150)] via-[oklch(0.18_0.04_160)] to-[oklch(0.15_0.03_150)] py-12 md:py-16">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #f5d989 1px, transparent 2px), radial-gradient(circle at 80% 70%, #f5d989 1px, transparent 2px)", backgroundSize: "80px 80px, 120px 120px" }}
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-black uppercase tracking-widest text-gold-foreground shadow-card">
              ✨ New Arrivals
            </span>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
              Exclusive <span className="bg-gradient-gold bg-clip-text text-transparent">School Bag</span> Collections
            </h2>
            <p className="mt-2 text-sm text-white/80 md:text-base">Style. Comfort. Durability. Everything for every student.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
            {BAG_COLLECTIONS.map((b, i) => (
              <motion.div
                key={b.alt}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-3xl border-2 border-gold/40 shadow-pop"
              >
                <img src={b.src} alt={b.alt} loading="lazy" className="block h-auto w-full" />
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="gold" size="xl">
              <Link to="/register">🎁 Scratch & Win on Bag Purchase</Link>
            </Button>
          </div>
        </div>
      </section>


      <section className="bg-accent/40 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black md:text-4xl">Everything for School</h2>
            <p className="mt-2 text-muted-foreground">Shop the full range in-store</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <motion.div
                key={c.name}
                whileHover={{ scale: 1.05, rotate: -1 }}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-5 text-center shadow-card"
              >
                <span className="text-4xl">{c.emoji}</span>
                <span className="text-sm font-semibold">{c.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h2 className="mb-10 text-center text-3xl font-black md:text-4xl">How Scratch & Win Works</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { n: "1", t: "Register", d: "Quick mobile OTP" },
            { n: "2", t: "Scratch", d: "Reveal your card" },
            { n: "3", t: "Share", d: "Send to WhatsApp friends" },
            { n: "4", t: "Redeem", d: "Visit store with code" },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border-2 border-border bg-card p-6 text-center shadow-card"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-xl font-black text-gold-foreground shadow-card">
                {s.n}
              </div>
              <h3 className="text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="hero" size="xl">
            <Link to="/register">Start Now — It's Free 🎉</Link>
          </Button>
        </div>
      </section>

      <section className="bg-gradient-to-br from-secondary to-[oklch(0.4_0.12_150)] py-12 text-secondary-foreground md:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-black md:text-4xl">🚀 Share & Win More</h2>
          <p className="mt-2 opacity-90">The more you share, the more you win</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { n: "3", t: "Friends", r: "Extra Scratch Card 🎟" },
              { n: "5", t: "Friends", r: "Double Chance Card 🎰" },
              { n: "10", t: "Friends", r: "Mega School Kit Draw 🏆" },
            ].map((x) => (
              <div key={x.n} className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-5xl font-black">{x.n}</div>
                <div className="text-sm uppercase tracking-widest opacity-80">{x.t}</div>
                <div className="mt-3 font-semibold">{x.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-foreground py-8 text-center text-sm text-background/80">
        <p className="font-bold">Ceevees Mart · C V Mathew & Co. Since 1975</p>
        <p className="mt-1 opacity-70">Ranni · Visit us before 30 June 2026</p>
      </footer>
    </div>
  );
}
