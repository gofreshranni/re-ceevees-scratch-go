import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function pickCashAmount(): number {
  return Math.floor(Math.random() * 30) + 1;
}

function generateCoupon(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "CVM-";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile"),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
});

export const registerForCampaign = createServerFn({ method: "POST" })
  .inputValidator((input) => registerSchema.parse(input))
  .handler(async ({ data }) => {
    const email = data.email && data.email.length > 0 ? data.email : null;

    const { data: existing, error: selErr } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("mobile", data.mobile)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    if (existing) {
      if (existing.scratched) {
        throw new Error("This mobile number has already used its scratch card.");
      }
      return {
        id: existing.id as string,
        name: existing.name as string,
        mobile: existing.mobile as string,
        cashAmount: existing.cash_amount as number,
        scratched: existing.scratched as boolean,
        shared: existing.shared as boolean,
        couponCode: (existing.coupon_code as string | null) ?? null,
      };
    }

    const cashAmount = pickCashAmount();
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("registrations")
      .insert({ name: data.name, mobile: data.mobile, email, cash_amount: cashAmount })
      .select("*")
      .single();
    if (insErr) throw new Error(insErr.message);

    return {
      id: inserted.id as string,
      name: inserted.name as string,
      mobile: inserted.mobile as string,
      cashAmount: inserted.cash_amount as number,
      scratched: false,
      shared: false,
      couponCode: null,
    };
  });

const mobileSchema = z.object({ mobile: z.string().regex(/^[6-9]\d{9}$/) });

export const markScratched = createServerFn({ method: "POST" })
  .inputValidator((input) => mobileSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .update({ scratched: true })
      .eq("mobile", data.mobile)
      .select("cash_amount, scratched")
      .single();
    if (error) throw new Error(error.message);
    return { cashAmount: row.cash_amount as number, scratched: true };
  });

export const markShared = createServerFn({ method: "POST" })
  .inputValidator((input) => mobileSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("registrations")
      .select("coupon_code")
      .eq("mobile", data.mobile)
      .single();
    if (selErr) throw new Error(selErr.message);

    const coupon = (existing.coupon_code as string | null) ?? generateCoupon();

    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .update({ shared: true, coupon_code: coupon })
      .eq("mobile", data.mobile)
      .select("cash_amount, coupon_code, shared")
      .single();
    if (error) throw new Error(error.message);

    return {
      cashAmount: row.cash_amount as number,
      couponCode: row.coupon_code as string,
      shared: true,
    };
  });
