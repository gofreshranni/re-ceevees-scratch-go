import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  Lock,
  Unlock,
  Search,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  RefreshCw,
  Award,
  Share2,
} from "lucide-react";
import ceeveesLogo from "@/assets/ceevees-logo.png";
import vawLogo from "@/assets/vaw-logo.png";
import { Button } from "@/components/ui/button";
import {
  getCampaignRegistrations,
  clearCampaignRegistrations,
  getCampaignLeads,
  clearCampaignLeads,
  getDatabaseStatus,
} from "@/lib/campaign.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal · Ceevees Mart" }] }),
  component: AdminPage,
});

interface Participant {
  id: string;
  name: string;
  mobile: string;
  cashAmount: number;
  scratched: boolean;
  shared: boolean;
  couponCode: string | null;
  created_at: string;
}

function AdminPage() {
  const getSubmissions = useServerFn(getCampaignRegistrations);
  const clearDb = useServerFn(clearCampaignRegistrations);
  const getLeads = useServerFn(getCampaignLeads);
  const clearLeads = useServerFn(clearCampaignLeads);
  const getDbStatus = useServerFn(getDatabaseStatus);

  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ isMock: boolean; supabaseUrl: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "scratched" | "unlocked">("all");

  const [activeTab, setActiveTab] = useState<"contestants" | "leads">("contestants");
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Check session storage on mount to retain login state
  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "VAWPLAY") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setErrorMsg("");
      toast.success("Welcome back, Administrator!");
      fetchData();
    } else {
      setErrorMsg("Incorrect passcode. Please try again.");
      toast.error("Invalid passcode");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setLoadingLeads(true);
    const [resSubmissions, resLeads, resStatus] = await Promise.allSettled([
      getSubmissions(),
      getLeads(),
      getDbStatus(),
    ]);
    if (resSubmissions.status === "fulfilled") {
      setParticipants(resSubmissions.value as Participant[]);
    } else {
      console.error("getCampaignRegistrations failed", resSubmissions.reason);
      toast.error(resSubmissions.reason?.message || "Failed to load registrations");
    }
    if (resLeads.status === "fulfilled") {
      setLeads(resLeads.value as any[]);
    } else {
      console.error("getCampaignLeads failed", resLeads.reason);
      toast.error(resLeads.reason?.message || "Failed to load leads");
    }
    if (resStatus.status === "fulfilled") {
      setDbStatus(resStatus.value);
    } else {
      console.error("getDatabaseStatus failed", resStatus.reason);
    }
    setLoading(false);
    setLoadingLeads(false);
  };

  const handleClearLeads = async () => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete ALL campaign creator leads!")) {
      return;
    }
    try {
      await clearLeads();
      setLeads([]);
      toast.success("Campaign creator leads cleared successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to clear leads");
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete ALL campaign participants and discount entries! This action CANNOT be undone.")) {
      return;
    }
    try {
      await clearDb();
      setParticipants([]);
      toast.success("Database cleared successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to clear database");
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      toast.error("No data available to export");
      return;
    }
    const headers = ["ID", "Name", "Mobile Number", "Discount Awarded (₹)", "Scratched", "Shared (Unlocked)", "Coupon Code", "Date Registered"];
    const rows = participants.map((p) => [
      p.id,
      p.name,
      p.mobile,
      p.cashAmount,
      p.scratched ? "YES" : "NO",
      p.shared ? "YES" : "NO",
      p.couponCode || "N/A",
      new Date(p.created_at).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ceevees_campaign_data_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  // Filter & search participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile.includes(searchQuery);

    if (filterType === "scratched") {
      return matchesSearch && p.scratched;
    }
    if (filterType === "unlocked") {
      return matchesSearch && p.shared;
    }
    return matchesSearch;
  });

  // Calculate analytics
  const totalSubmissions = participants.length;
  const scratchedCount = participants.filter((p) => p.scratched).length;
  const unlockedCount = participants.filter((p) => p.shared).length;
  const totalDiscountsGiven = participants.reduce((sum, p) => sum + p.cashAmount, 0);

  // Taken Coupon Digits
  const takenDigits = participants
    .map((p) => p.couponCode)
    .filter((c): c is string => !!c)
    .map((c) => parseInt(c.replace("CVM-", ""), 10))
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b);
  const uniqueTakenCount = new Set(takenDigits).size;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-accent/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl bg-card border-2 border-border shadow-pop overflow-hidden"
        >
          <div className="bg-gradient-hero p-6 text-center text-primary-foreground">
            <div className="flex justify-center mb-3">
              <img src={vawLogo} alt="VAW Technologies" className="h-10 w-auto object-contain brightness-0 invert" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider">Admin Portal</h2>
            <p className="text-xs opacity-80 mt-1">Ceevees Mart Campaign Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="passcode" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Enter Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm font-semibold tracking-widest focus:ring-2 focus:ring-primary outline-none"
                  autoFocus
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-500 text-center animate-bounce">
                ⚠️ {errorMsg}
              </p>
            )}

            <Button type="submit" size="xl" className="w-full">
              <Unlock className="size-4 mr-2" />
              Access Dashboard
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/20">
      {/* Top Admin Header */}
      <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-1.5 shadow-sm border border-border">
              <img src={ceeveesLogo} alt="Ceevees Mart" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                Back-To-School Console
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  ADMIN
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">Interactive campaigns management panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center justify-center p-2 rounded-xl bg-secondary/15 hover:bg-secondary/20 transition-all active:scale-95 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin text-primary" : "text-foreground"}`} />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem("admin_auth");
                setIsAuthenticated(false);
                toast.success("Logged out successfully");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Connection status warning banner */}
        {dbStatus?.isMock && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 p-5 shadow-sm space-y-3 text-left"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-sm font-black text-amber-800 uppercase tracking-wider">
                  Using Local In-Memory Database (Action Required)
                </h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Your production deployment is currently running on an <strong>In-Memory Mock Database</strong> fallback, which resets to empty whenever your serverless function spins down. This happens because the <strong>SUPABASE_SERVICE_ROLE_KEY</strong> in your Vercel Environment Variables is missing, empty, or set to the placeholder string.
                </p>
              </div>
            </div>
            <div className="text-xs text-amber-800 bg-amber-500/15 p-4 rounded-2xl border border-amber-500/20 font-medium space-y-2">
              <p className="font-bold">How to connect your Supabase database in Vercel:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your <strong>Lovable Cloud Settings &rarr; Backend</strong>.</li>
                <li>Copy the actual <strong>Service role key</strong> (it should be a long string starting with <code className="bg-amber-200/50 px-1 rounded">eyJhbGciOi...</code>).</li>
                <li>Go to your <strong>Vercel Dashboard &rarr; Settings &rarr; Environment Variables</strong>.</li>
                <li>Locate <strong>SUPABASE_SERVICE_ROLE_KEY</strong> and replace the placeholder text with your actual copied key.</li>
                <li>Also ensure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_PUBLISHABLE_KEY</strong> are populated with the actual URL and Publishable Key instead of "same as ..." placeholders.</li>
                <li>Re-deploy your project in Vercel to apply the changes.</li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3.5"
          >
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Registrations</p>
              <p className="text-2xl font-black mt-0.5">{totalSubmissions}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3.5"
          >
            <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Scratched Cards</p>
              <p className="text-2xl font-black mt-0.5">
                {scratchedCount}{" "}
                <span className="text-xs font-semibold text-muted-foreground">
                  ({totalSubmissions > 0 ? Math.round((scratchedCount / totalSubmissions) * 100) : 0}%)
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3.5"
          >
            <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
              <Share2 className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Unlocked Coupons</p>
              <p className="text-2xl font-black mt-0.5">
                {unlockedCount}{" "}
                <span className="text-xs font-semibold text-muted-foreground">
                  ({totalSubmissions > 0 ? Math.round((unlockedCount / totalSubmissions) * 100) : 0}%)
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3.5"
          >
            <div className="size-10 rounded-xl bg-gold/10 flex items-center justify-center text-amber-600 shrink-0">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Value Won</p>
              <p className="text-2xl font-black mt-0.5 text-primary">₹{totalDiscountsGiven}</p>
            </div>
          </motion.div>
        </div>

        {/* Coupon Allocation & Quota Meter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Taken Coupon Digits Badge Reel */}
          <div className="md:col-span-2 bg-card rounded-3xl p-5 border border-border shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                🎟️ Taken Coupon Digits
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exact random numerical coupon allocations generated so far
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-16 p-3 rounded-2xl bg-accent/10 border border-border/50 items-center justify-center max-h-48 overflow-y-auto">
              {takenDigits.length === 0 ? (
                <p className="text-xs font-semibold text-muted-foreground text-center">
                  No coupon codes generated yet.
                </p>
              ) : (
                takenDigits.map((digit, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary shadow-sm hover:scale-105 transition-all"
                  >
                    #{digit}
                  </span>
                ))
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              * Any digit from 10,000 to 20,000 can be randomly chosen for a coupon.
            </p>
          </div>

          {/* Allocation Quota Balance & Rules */}
          <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex flex-col gap-4 justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                📊 Allocation Balance
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                Available coupon pool status
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Taken</p>
                  <p className="text-xl font-black">{uniqueTakenCount} Codes</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Balance</p>
                  <p className="text-xl font-black text-emerald-600">{10001 - uniqueTakenCount} Left</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-accent border border-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(uniqueTakenCount / 10001) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>CVM-10000</span>
                <span>CVM-20000</span>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/15 p-2.5 border border-secondary/20">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider leading-relaxed">
                ⚖️ Rules & Range
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                Coupon codes are strictly formatted as <span className="font-bold text-foreground">CVM-[10,000 to 20,000]</span>, drawing pure numbers at random.
              </p>
            </div>
          </div>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="flex border-b border-border gap-6 pt-2">
          <button
            onClick={() => setActiveTab("contestants")}
            className={`pb-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "contestants"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Contest Participants ({participants.length})
          </button>
          
          <button
            onClick={() => setActiveTab("leads")}
            className={`pb-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "leads"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Campaign Creator Leads ({leads.length})
          </button>
        </div>

        {activeTab === "contestants" ? (
          <div className="space-y-6">
            {/* Database Control & Export Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full animate-ping ${dbStatus?.isMock ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                <p className="text-xs font-bold text-muted-foreground">
                  Connected Database: <span className="text-foreground">{dbStatus ? (dbStatus.isMock ? "Mock Database (Local)" : "Supabase Live DB") : "Checking..."}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs px-4 py-2.5 shadow-pop hover:brightness-105 active:translate-y-0.5"
                >
                  <Download className="size-4" />
                  Export to CSV
                </button>
                <button
                  onClick={handleClearDatabase}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 shadow-pop active:translate-y-0.5"
                >
                  <Trash2 className="size-4" />
                  Reset Database
                </button>
              </div>
            </div>

            {/* Participants Table Section */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              {/* Controls Bar */}
              <div className="p-5 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-accent/5">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search name or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-full md:w-auto">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`flex-1 md:flex-initial text-center px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      filterType === "all" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({participants.length})
                  </button>
                  <button
                    onClick={() => setFilterType("scratched")}
                    className={`flex-1 md:flex-initial text-center px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      filterType === "scratched" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Scratched ({participants.filter(p => p.scratched).length})
                  </button>
                  <button
                    onClick={() => setFilterType("unlocked")}
                    className={`flex-1 md:flex-initial text-center px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      filterType === "unlocked" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unlocked ({participants.filter(p => p.shared).length})
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="size-8 text-primary animate-spin" />
                    <p className="text-xs font-semibold text-muted-foreground">Loading submissions...</p>
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold text-foreground">No registrations found</p>
                    <p className="text-xs text-muted-foreground">Try clearing search filters or waiting for users to sign up.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-5">Name</th>
                        <th className="py-3 px-5">Mobile</th>
                        <th className="py-3 px-5">Prize Won</th>
                        <th className="py-3 px-5 text-center">Scratched</th>
                        <th className="py-3 px-5 text-center">Shared</th>
                        <th className="py-3 px-5">Coupon Code</th>
                        <th className="py-3 px-5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {filteredParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-accent/5 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-foreground">{p.name}</td>
                          <td className="py-3.5 px-5 font-semibold text-muted-foreground">{p.mobile}</td>
                          <td className="py-3.5 px-5 font-black text-primary">₹{p.cashAmount} OFF</td>
                          <td className="py-3.5 px-5 text-center">
                            {p.scratched ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                <CheckCircle className="size-3" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                <Clock className="size-3" /> No
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {p.shared ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                <CheckCircle className="size-3" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                <Clock className="size-3" /> No
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 font-mono font-bold tracking-wider text-muted-foreground">
                            {p.couponCode ? (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-primary">
                                {p.couponCode}
                              </span>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-muted-foreground text-[11px]">
                            {new Date(p.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer stats overview */}
              <div className="p-4 border-t border-border bg-accent/5 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <p>Showing {filteredParticipants.length} of {participants.length} entries</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    Designed & Powered by <img src={vawLogo} alt="VAW" className="h-3.5 w-auto object-contain ml-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Leads Control & Export */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500 animate-ping"></span>
                <p className="text-xs font-bold text-muted-foreground">
                  Active Leads: <span className="text-foreground">{leads.length} campaign creation request(s)</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (leads.length === 0) {
                      toast.error("No lead data available to export");
                      return;
                    }
                    const headers = ["Lead ID", "Brand / Contact Name", "Contact Mobile", "Date Submitted"];
                    const rows = leads.map((l) => [
                      l.id,
                      l.name,
                      l.mobile,
                      new Date(l.created_at).toLocaleString(),
                    ]);
                    const csvContent =
                      "data:text/csv;charset=utf-8," +
                      [headers.join(","), ...rows.map((e) => e.map(val => `"${val}"`).join(","))].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `vaw_campaign_leads_${new Date().toISOString().split("T")[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Leads CSV downloaded!");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs px-4 py-2.5 shadow-pop hover:brightness-105 active:translate-y-0.5"
                >
                  <Download className="size-4" />
                  Export Leads CSV
                </button>
                
                <button
                  onClick={handleClearLeads}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 shadow-pop active:translate-y-0.5"
                >
                  <Trash2 className="size-4" />
                  Reset Leads Data
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loadingLeads ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="size-8 text-primary animate-spin" />
                    <p className="text-xs font-semibold text-muted-foreground">Loading leads data...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold text-foreground">No creator leads found</p>
                    <p className="text-xs text-muted-foreground">Leads submitted via the global website footer will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 px-5">Brand / Contact Name</th>
                        <th className="py-3 px-5">Contact Mobile</th>
                        <th className="py-3 px-5">Type</th>
                        <th className="py-3 px-5">Submission Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-accent/5 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-foreground">{l.name}</td>
                          <td className="py-3.5 px-5 font-semibold text-muted-foreground">{l.mobile}</td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                              🚀 Campaign Inquiry
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-medium text-muted-foreground text-[11px]">
                            {new Date(l.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="p-4 border-t border-border bg-accent/5 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <p>Showing {leads.length} of {leads.length} entries</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    Powered by VAW Technologies
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
