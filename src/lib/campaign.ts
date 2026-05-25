// Mock state store for the Scratch & Win campaign (frontend only).
// Production would back this with Lovable Cloud.

export type Reward = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  terms: string;
  rarity: "common" | "rare" | "mega";
};

export const REWARDS: Reward[] = [
  { id: "notebook1", emoji: "📚", title: "1 Free Notebook", subtitle: "Chapters Ruled Notebook", terms: "Valid on purchases above ₹200", rarity: "common" },
  { id: "notebook2", emoji: "📚", title: "2 Free Notebooks", subtitle: "Chapters 152-page", terms: "Valid on purchases above ₹300", rarity: "common" },
  { id: "penset", emoji: "✏️", title: "Free Pen Set", subtitle: "Hauser XO Pack", terms: "Valid on purchases above ₹250", rarity: "common" },
  { id: "bagcover", emoji: "🎒", title: "Free Bag Cover", subtitle: "With any school bag purchase", terms: "Valid on school bag purchase", rarity: "common" },
  { id: "off50", emoji: "💰", title: "₹50 OFF", subtitle: "On school shopping", terms: "Valid on purchases above ₹500", rarity: "common" },
  { id: "off100", emoji: "💰", title: "₹100 OFF", subtitle: "On school shopping", terms: "Valid on purchases above ₹1000", rarity: "common" },
  { id: "bottle", emoji: "🧃", title: "Water Bottle Discount", subtitle: "20% off any bottle", terms: "Valid in-store only", rarity: "common" },
  { id: "lunchbox", emoji: "🍱", title: "Lunch Box Discount", subtitle: "15% off any lunch box", terms: "Valid in-store only", rarity: "common" },
  { id: "gift", emoji: "🎁", title: "Special Gift at Billing", subtitle: "Surprise gift on billing", terms: "Valid on purchases above ₹750", rarity: "common" },
  { id: "bag499", emoji: "🎒", title: "School Bag Worth ₹499", subtitle: "Grand Prize!", terms: "One per family. Verify at counter.", rarity: "mega" },
  { id: "kit999", emoji: "🏆", title: "School Kit Worth ₹999", subtitle: "Mega Combo Prize", terms: "One per family. Verify at counter.", rarity: "mega" },
  { id: "voucher500", emoji: "💎", title: "₹500 Shopping Voucher", subtitle: "Use on anything in store", terms: "Valid on purchases above ₹1500", rarity: "rare" },
];

const STORAGE_KEY = "ceevees_scratch_session";

export type Session = {
  name: string;
  mobile: string;
  email?: string;
  rewardId?: string;
  cashAmount?: number;
  couponCode?: string;
  scratched?: boolean;
  shared?: boolean;
  referrals?: number;
  createdAt: number;
};

export function pickCashAmount(): number {
  // Random cash discount between ₹1 and ₹30
  return Math.floor(Math.random() * 30) + 1;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function updateSession(patch: Partial<Session>) {
  const cur = getSession();
  if (!cur) return null;
  const next = { ...cur, ...patch };
  setSession(next);
  return next;
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

// Weighted pick — mega rare, rare uncommon, common most likely.
export function pickReward(): Reward {
  const weights: Record<Reward["rarity"], number> = { common: 85, rare: 12, mega: 3 };
  const pool: Reward[] = [];
  for (const r of REWARDS) {
    const w = weights[r.rarity];
    for (let i = 0; i < w; i++) pool.push(r);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateCoupon(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "CVM-";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function getExpiryDate(): string {
  return "30 June 2026";
}

export const SHARE_MESSAGE = `🎒 I just got a Scratch & Win card from Ceevees Mart's Back-to-School Offer!

Win free notebooks, school bag gifts, discounts and more 🎁

Try your luck now 👇
${typeof window !== "undefined" ? window.location.origin : "https://ceevees.app"}`;

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
