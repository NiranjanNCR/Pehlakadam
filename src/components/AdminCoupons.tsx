import { useState, useEffect, FormEvent } from "react";
import { Coupon } from "../types";
import { Tag, Plus, Trash2, CheckCircle, XCircle, Sparkles, RefreshCw } from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Coupon Form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/coupons", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error("[AdminCoupons] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsCreating(true);
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount),
          active: true
        })
      });

      if (res.ok) {
        setCode("");
        setDiscountValue(20);
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create coupon code.");
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCoupon = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon code: ${couponCode}?`)) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ active: !coupon.active })
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error toggling coupon status:", err);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-zinc-900 text-zinc-100 min-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
          <Tag className="h-3.5 w-3.5" />
          HOME PAGE PAY & ENROLL COUPON DISCOUNTS
        </div>
        <h2 className="text-2xl font-black text-white">Coupon & Discount Code Manager</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Create promotional discount codes (Percentage or Flat ₹ discount). When applied on enrollment forms, prices automatically reduce!
        </p>
      </div>

      {/* CREATE COUPON FORM */}
      <form onSubmit={handleCreateCoupon} className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Create New Discount Coupon Code
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Coupon Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. PEHLA50"
              required
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500 uppercase font-mono tracking-wider"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="fixed">Flat Fixed Amount Off (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
              {discountType === "percentage" ? "Discount Percentage (%)" : "Flat Discount Amount (₹)"}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Min Order Amount (₹)</label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isCreating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Promotional Coupon
        </button>
      </form>

      {/* ACTIVE COUPONS TABLE */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Active Promotional Coupons ({coupons.length})</h3>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-xs">Loading coupon list...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
            No coupon codes active yet. Create one using the form above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  coupon.active
                    ? "border-emerald-500/40 bg-zinc-950 shadow-lg"
                    : "border-zinc-800 bg-zinc-950/40 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-extrabold uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                      {coupon.code}
                    </span>

                    <button
                      onClick={() => handleToggleCoupon(coupon)}
                      className="text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {coupon.active ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Active</span>
                      ) : (
                        <span className="text-zinc-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Inactive</span>
                      )}
                    </button>
                  </div>

                  <p className="text-base font-bold text-white mb-1">
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT DISCOUNT`}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Min Cart: ₹{coupon.minOrderAmount || 0}
                  </p>
                </div>

                <div className="border-t border-zinc-800/80 pt-3 mt-4 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Created: {new Date(coupon.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
