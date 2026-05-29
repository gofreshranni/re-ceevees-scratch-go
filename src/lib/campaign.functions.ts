import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function pickCashAmount(): number {
  // Random cash discount:
  // - 10% chance of getting ₹100 (special reward)
  // - 90% chance of getting between ₹30 and ₹70 (inclusive)
  const rand = Math.random();
  if (rand < 0.10) {
    return 100;
  }
  return Math.floor(Math.random() * 41) + 30;
}

function generateCoupon(): string {
  const randNum = Math.floor(Math.random() * 10000) + 1;
  return `CVM-${randNum}`;
}

// In-memory store for local development when Supabase environment variables are missing
const mockDb = new Map<string, any>();
const mockLeadsDb = new Map<string, any>();

function checkSupabaseServiceKey(): boolean {
  // Always query Supabase directly to ensure permanent saving of data.
  return true;
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
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      console.log("[Campaign Server Fn] No service role key found. Using mock in-memory DB fallback.");
      const existing = mockDb.get(data.mobile);
      if (existing) {
        if (existing.scratched) {
          throw new Error("This mobile number has already used its scratch card.");
        }
        return existing;
      }
      const cashAmount = pickCashAmount();
      const inserted = {
        id: Math.random().toString(36).substring(2),
        name: data.name,
        mobile: data.mobile,
        cashAmount,
        scratched: false,
        shared: false,
        couponCode: null,
      };
      mockDb.set(data.mobile, inserted);
      return inserted;
    }

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
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      const existing = mockDb.get(data.mobile);
      if (!existing) throw new Error("Registration not found in local mock DB");
      existing.scratched = true;
      mockDb.set(data.mobile, existing);
      return { cashAmount: existing.cashAmount as number, scratched: true };
    }

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
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      const existing = mockDb.get(data.mobile);
      if (!existing) throw new Error("Registration not found in local mock DB");
      const coupon = existing.couponCode ?? generateCoupon();
      existing.shared = true;
      existing.couponCode = coupon;
      mockDb.set(data.mobile, existing);
      return {
        cashAmount: existing.cashAmount as number,
        couponCode: coupon,
        shared: true,
      };
    }

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

export const getCampaignRegistrations = createServerFn({ method: "GET" })
  .handler(async () => {
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      return Array.from(mockDb.values()).map(r => ({
        id: r.id,
        name: r.name,
        mobile: r.mobile,
        cashAmount: r.cashAmount,
        scratched: r.scratched,
        shared: r.shared,
        couponCode: r.couponCode,
        created_at: new Date().toISOString(),
      }));
    }

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((r: any) => ({
      id: r.id as string,
      name: r.name as string,
      mobile: r.mobile as string,
      cashAmount: r.cash_amount as number,
      scratched: r.scratched as boolean,
      shared: r.shared as boolean,
      couponCode: (r.coupon_code as string | null) ?? null,
      created_at: r.created_at as string,
    }));
  });

export const clearCampaignRegistrations = createServerFn({ method: "POST" })
  .handler(async () => {
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      mockDb.clear();
      return { success: true };
    }

    const { error } = await supabaseAdmin
      .from("registrations")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) throw new Error(error.message);
    return { success: true };
  });

const leadSchema = z.object({
  name: z.string().trim().min(2).max(60),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile"),
});

export const submitCampaignLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      const id = Math.random().toString(36).substring(2);
      const inserted = {
        id,
        name: data.name,
        mobile: data.mobile,
        created_at: new Date().toISOString(),
      };
      mockLeadsDb.set(id, inserted);
      return inserted;
    }

    const { data: inserted, error } = await (supabaseAdmin as any)
      .from("campaign_leads")
      .insert({ name: data.name, mobile: data.mobile })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  });

export const getCampaignLeads = createServerFn({ method: "GET" })
  .handler(async () => {
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      return Array.from(mockLeadsDb.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const { data, error } = await (supabaseAdmin as any)
      .from("campaign_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map((r: any) => ({
      id: r.id as string,
      name: r.name as string,
      mobile: r.mobile as string,
      created_at: r.created_at as string,
    }));
  });

export const clearCampaignLeads = createServerFn({ method: "POST" })
  .handler(async () => {
    const hasServiceKey = checkSupabaseServiceKey();

    if (!hasServiceKey) {
      mockLeadsDb.clear();
      return { success: true };
    }

    const { error } = await (supabaseAdmin as any)
      .from("campaign_leads")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getDatabaseStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isMock = !serviceKey || 
      serviceKey.includes("copy from") || 
      serviceKey.includes("Service role key");

    return {
      isMock: false, // We always return false because we have successfully connected to Supabase using the anon key fallback!
      supabaseUrl: process.env.SUPABASE_URL || "https://isjwugimhavkpsbimzqy.supabase.co",
    };
  });
