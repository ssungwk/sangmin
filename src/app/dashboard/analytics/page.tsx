import { createClient } from "@/lib/supabase/server";
import { DashboardChart } from "./dashboard-chart";

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

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const month = monthParam || currentMonth();
  const { start, end } = monthRange(month);

  const supabase = await createClient();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-2">
        <h1 className="text-lg font-bold text-slate-800">대시보드</h1>
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`?month=${shiftMonth(month, -1)}`}
            className="rounded-none border border-slate-300 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
          >
            ◀ 이전달
          </a>
          <span className="font-medium text-slate-700">{month}</span>
          <a
            href={`?month=${shiftMonth(month, 1)}`}
            className="rounded-none border border-slate-300 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
          >
            다음달 ▶
          </a>
        </div>
      </div>

      <DashboardChart
        month={month}
        purchases={purchases ?? []}
        sales={sales ?? []}
      />
    </div>
  );
}
