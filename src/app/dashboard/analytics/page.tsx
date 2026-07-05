import { createClient } from "@/lib/supabase/server";
import { DashboardChart } from "./dashboard-chart";
import { ProductShareChart } from "./product-share-chart";
import type { PurchaseRow } from "../purchases/purchase-manager";
import type { SaleRow } from "../sales/sale-manager";

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const end = new Date(y, m, 0).toISOString().slice(0, 10); // last day of month
  return { start, end };
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentYear() {
  return String(new Date().getFullYear());
}

const TABS = [
  { key: "daily", label: "일별마진율" },
  { key: "monthly", label: "월별제품비중율" },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; month?: string; year?: string }>;
}) {
  const { tab: tabParam, month: monthParam, year: yearParam } = await searchParams;
  const tab = tabParam === "monthly" ? "monthly" : "daily";
  const month = monthParam || currentMonth();
  const year = yearParam || currentYear();

  const supabase = await createClient();

  let dailyPurchases: PurchaseRow[] = [];
  let dailySales: SaleRow[] = [];
  let yearlySales: SaleRow[] = [];

  if (tab === "daily") {
    const { start, end } = monthRange(month);
    const [{ data: purchases }, { data: sales }] = await Promise.all([
      supabase
        .from("purchases")
        .select("*, products(product_nm)")
        .gte("in_date", start)
        .lte("in_date", end)
        .order("in_date"),
      supabase
        .from("sales")
        .select("*, products(product_nm)")
        .gte("out_date", start)
        .lte("out_date", end)
        .order("out_date"),
    ]);
    dailyPurchases = (purchases ?? []) as PurchaseRow[];
    dailySales = (sales ?? []) as SaleRow[];
  } else {
    const { data: sales } = await supabase
      .from("sales")
      .select("*, products(product_nm)")
      .gte("out_date", `${year}-01-01`)
      .lte("out_date", `${year}-12-31`)
      .order("out_date");
    yearlySales = (sales ?? []) as SaleRow[];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-2">
        <h1 className="text-lg font-bold text-slate-800">대시보드</h1>

        {tab === "daily" ? (
          <div className="flex items-center gap-2 text-sm">
            <a
              href={`?tab=daily&month=${shiftMonth(month, -1)}`}
              className="rounded-none border border-slate-300 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              ◀ 이전달
            </a>
            <span className="font-medium text-slate-700">{month}</span>
            <a
              href={`?tab=daily&month=${shiftMonth(month, 1)}`}
              className="rounded-none border border-slate-300 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              다음달 ▶
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <a
              href={`?tab=monthly&year=${Number(year) - 1}`}
              className="rounded-none border border-slate-300 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              ◀ 이전년도
            </a>
            <span className="font-medium text-slate-700">{year}년</span>
            <a
              href={`?tab=monthly&year=${Number(year) + 1}`}
              className="rounded-none border border-slate-300 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              다음년도 ▶
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-300">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={t.key === "daily" ? `?tab=daily&month=${month}` : `?tab=monthly&year=${year}`}
            className={
              tab === t.key
                ? "border-b-2 border-blue-800 bg-white px-4 py-2 text-sm font-bold text-blue-900"
                : "border-b-2 border-transparent px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
            }
          >
            {t.label}
          </a>
        ))}
      </div>

      {tab === "daily" ? (
        <DashboardChart month={month} purchases={dailyPurchases} sales={dailySales} />
      ) : (
        <ProductShareChart year={year} sales={yearlySales} />
      )}
    </div>
  );
}
