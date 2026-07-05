"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SaleRow } from "../sales/sale-manager";

// 고정 카테고리 순서 팔레트 (dataviz 스킬 기준 8슬롯, CVD 검증된 세트)
const PALETTE = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#008300",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
  "#eb6834",
];
const OTHER_COLOR = "#898781";
const OTHER_LABEL = "기타";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

function saleAmount(row: SaleRow) {
  return row.out_qty * row.out_prc;
}

type TooltipEntry = {
  dataKey?: string;
  name?: string;
  value?: number | string;
  color?: string;
};

function ShareTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0));

  return (
    <div className="border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-bold text-slate-800">{label}</p>
      {sorted.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

export function ProductShareChart({ year, sales }: { year: string; sales: SaleRow[] }) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const { chartData, products } = useMemo(() => {
    const totalsByProduct = new Map<string, number>();
    for (const row of sales) {
      const name = row.products?.product_nm ?? row.product_id;
      totalsByProduct.set(name, (totalsByProduct.get(name) ?? 0) + saleAmount(row));
    }
    const rankedProducts = [...totalsByProduct.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    const topProducts = rankedProducts.slice(0, PALETTE.length);
    const hasOther = rankedProducts.length > PALETTE.length;
    const products = hasOther ? [...topProducts, OTHER_LABEL] : topProducts;

    const monthTotals: Record<number, Record<string, number>> = {};
    for (let m = 1; m <= 12; m++) monthTotals[m] = {};

    for (const row of sales) {
      const month = Number(row.out_date?.slice(5, 7));
      if (!month) continue;
      const name = row.products?.product_nm ?? row.product_id;
      const bucket = topProducts.includes(name) ? name : hasOther ? OTHER_LABEL : name;
      monthTotals[month][bucket] = (monthTotals[month][bucket] ?? 0) + saleAmount(row);
    }

    const chartData = MONTH_LABELS.map((label, idx) => {
      const m = idx + 1;
      const totals = monthTotals[m];
      const sum = Object.values(totals).reduce((a, b) => a + b, 0);
      const row: Record<string, number | string> = { month: label, monthNum: m };
      for (const p of products) {
        row[p] = sum > 0 ? Number((((totals[p] ?? 0) / sum) * 100).toFixed(1)) : 0;
      }
      return row;
    });

    return { chartData, products };
  }, [sales]);

  const selectedSales = useMemo(
    () =>
      selectedMonth
        ? sales.filter((row) => Number(row.out_date?.slice(5, 7)) === selectedMonth)
        : [],
    [sales, selectedMonth],
  );

  const salesSummary = useMemo(() => {
    const map = new Map<string, { qty: number; amount: number }>();
    for (const row of selectedSales) {
      const key = row.products?.product_nm ?? row.product_id;
      const cur = map.get(key) ?? { qty: 0, amount: 0 };
      cur.qty += row.out_qty;
      cur.amount += saleAmount(row);
      map.set(key, cur);
    }
    const list = [...map.entries()]
      .map(([product, v]) => ({ product, qty: v.qty, amount: v.amount }))
      .sort((a, b) => b.amount - a.amount);
    const totalQty = list.reduce((sum, r) => sum + r.qty, 0);
    const totalAmount = list.reduce((sum, r) => sum + r.amount, 0);
    return { list, totalQty, totalAmount };
  }, [selectedSales]);

  return (
    <div className="space-y-6">
      <section className="border border-slate-300 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          {products.map((p, i) => (
            <span key={p} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5"
                style={{ backgroundColor: p === OTHER_LABEL ? OTHER_COLOR : PALETTE[i] }}
              />
              {p}
            </span>
          ))}
          <span className="text-slate-400">막대를 클릭하면 해당 월 판매현황이 아래에 표시됩니다.</span>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e1e0d9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#898781" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#898781" }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<ShareTooltip />} />
            <Legend wrapperStyle={{ display: "none" }} />
            {products.map((p, i) => (
              <Bar
                key={p}
                dataKey={p}
                stackId="share"
                fill={p === OTHER_LABEL ? OTHER_COLOR : PALETTE[i]}
                cursor="pointer"
                onClick={(data) => setSelectedMonth((data.payload as { monthNum: number }).monthNum)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </section>

      {selectedMonth && (
        <section className="border border-slate-300 bg-white">
          <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            {year}년 {selectedMonth}월 판매현황
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                  <th className="border-r border-slate-200 p-2">제품</th>
                  <th className="border-r border-slate-200 p-2">수량(소계)</th>
                  <th className="p-2">금액(소계)</th>
                </tr>
              </thead>
              <tbody>
                {salesSummary.list.map((row) => (
                  <tr key={row.product} className="border-b border-slate-200">
                    <td className="border-r border-slate-200 p-2">{row.product}</td>
                    <td className="border-r border-slate-200 p-2">{row.qty}</td>
                    <td className="p-2">{row.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {salesSummary.list.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400">
                      판매 내역이 없습니다.
                    </td>
                  </tr>
                )}
                {salesSummary.list.length > 0 && (
                  <tr className="border-t-2 border-slate-400 bg-slate-50 font-bold">
                    <td className="border-r border-slate-200 p-2">합계</td>
                    <td className="border-r border-slate-200 p-2">{salesSummary.totalQty}</td>
                    <td className="p-2">{salesSummary.totalAmount.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
