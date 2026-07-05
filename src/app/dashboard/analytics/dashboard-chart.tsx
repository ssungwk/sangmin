"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatSpec } from "@/lib/format";
import type { PurchaseRow } from "../purchases/purchase-manager";
import type { SaleRow } from "../sales/sale-manager";

const COLORS = {
  purchase: "#2a78d6",
  sale: "#1baf7a",
  margin: "#eb6834",
};

function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function DashboardChart({
  month,
  purchases,
  sales,
}: {
  month: string;
  purchases: PurchaseRow[];
  sales: SaleRow[];
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const total = daysInMonth(month);
    const rows = [];
    for (let d = 1; d <= total; d++) {
      const day = `${month}-${String(d).padStart(2, "0")}`;
      const dayPurchases = purchases.filter((p) => p.in_date === day);
      const daySales = sales.filter((s) => s.out_date === day);
      const 매입금액 = dayPurchases.reduce((sum, p) => sum + p.in_qty * p.in_prc, 0);
      const 매출금액 = daySales.reduce((sum, s) => sum + s.out_qty * s.out_prc, 0);
      const 마진율 = 매출금액 > 0 ? Number((((매출금액 - 매입금액) / 매출금액) * 100).toFixed(1)) : 0;
      rows.push({ day, dayNum: d, 매입금액, 매출금액, 마진율 });
    }
    return rows;
  }, [month, purchases, sales]);

  const selectedPurchases = useMemo(
    () => (selectedDay ? purchases.filter((p) => p.in_date === selectedDay) : []),
    [purchases, selectedDay],
  );
  const selectedSales = useMemo(
    () => (selectedDay ? sales.filter((s) => s.out_date === selectedDay) : []),
    [sales, selectedDay],
  );

  return (
    <div className="space-y-6">
      <section className="border border-slate-300 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: COLORS.purchase }} />
            매입금액
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: COLORS.sale }} />
            매출금액
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-0.5" style={{ backgroundColor: COLORS.margin }} />
            마진율(%)
          </span>
          <span className="text-slate-400">막대를 클릭하면 해당 일자 상세가 아래에 표시됩니다.</span>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e1e0d9" vertical={false} />
            <XAxis dataKey="dayNum" tick={{ fontSize: 12, fill: "#898781" }} />
            <YAxis
              yAxisId="amount"
              tick={{ fontSize: 12, fill: "#898781" }}
              tickFormatter={(v) => v.toLocaleString()}
            />
            <YAxis
              yAxisId="margin"
              orientation="right"
              tick={{ fontSize: 12, fill: "#898781" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              labelFormatter={(_, payload) => payload?.[0]?.payload?.day ?? ""}
              formatter={(value, name) =>
                name === "마진율"
                  ? [`${value}%`, name]
                  : [Number(value).toLocaleString(), name]
              }
            />
            <Legend wrapperStyle={{ display: "none" }} />
            <Bar
              yAxisId="amount"
              dataKey="매입금액"
              fill={COLORS.purchase}
              cursor="pointer"
              onClick={(data) => setSelectedDay((data.payload as { day: string }).day)}
            />
            <Bar
              yAxisId="amount"
              dataKey="매출금액"
              fill={COLORS.sale}
              cursor="pointer"
              onClick={(data) => setSelectedDay((data.payload as { day: string }).day)}
            />
            <Line
              yAxisId="margin"
              type="linear"
              dataKey="마진율"
              stroke={COLORS.margin}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      {selectedDay && (
        <>
          <section className="border border-slate-300 bg-white">
            <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              {selectedDay} 매입 정보
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                    <th className="border-r border-slate-200 p-2">제품</th>
                    <th className="border-r border-slate-200 p-2">규격</th>
                    <th className="border-r border-slate-200 p-2">개수</th>
                    <th className="p-2">단가</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPurchases.map((row) => (
                    <tr key={row.in_id} className="border-b border-slate-200">
                      <td className="border-r border-slate-200 p-2">
                        {row.products?.product_nm ?? "-"}
                      </td>
                      <td className="border-r border-slate-200 p-2">
                        {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                      </td>
                      <td className="border-r border-slate-200 p-2">{row.in_qty}</td>
                      <td className="p-2">{Number(row.in_prc).toLocaleString()}</td>
                    </tr>
                  ))}
                  {selectedPurchases.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        매입 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-slate-300 bg-white">
            <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              {selectedDay} 매출 정보
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                    <th className="border-r border-slate-200 p-2">현장</th>
                    <th className="border-r border-slate-200 p-2">제품</th>
                    <th className="border-r border-slate-200 p-2">규격</th>
                    <th className="border-r border-slate-200 p-2">개수</th>
                    <th className="p-2">단가</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSales.map((row) => (
                    <tr key={row.out_id} className="border-b border-slate-200">
                      <td className="border-r border-slate-200 p-2">{row.apartment ?? "-"}</td>
                      <td className="border-r border-slate-200 p-2">
                        {row.products?.product_nm ?? "-"}
                      </td>
                      <td className="border-r border-slate-200 p-2">
                        {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                      </td>
                      <td className="border-r border-slate-200 p-2">{row.out_qty}</td>
                      <td className="p-2">{Number(row.out_prc).toLocaleString()}</td>
                    </tr>
                  ))}
                  {selectedSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">
                        매출 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
