import { createClient } from "@/lib/supabase/server";
import { formatSpec } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: purchases }, { data: sales }] = await Promise.all([
    supabase
      .from("purchases")
      .select("*, products(product_nm)")
      .order("in_date", { ascending: false })
      .limit(10),
    supabase
      .from("sales")
      .select("*, products(product_nm)")
      .order("order_date", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        현황
      </h1>

      <section className="border border-slate-300 bg-white">
        <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
          매입 현황
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">매입일자</th>
                <th className="border-r border-slate-200 p-2">제품</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="border-r border-slate-200 p-2">매입개수</th>
                <th className="border-r border-slate-200 p-2">매입단가</th>
                <th className="p-2">비고</th>
              </tr>
            </thead>
            <tbody>
              {(purchases ?? []).map((row) => (
                <tr key={row.in_id} className="border-b border-slate-200">
                  <td className="border-r border-slate-200 p-2">{row.in_date}</td>
                  <td className="border-r border-slate-200 p-2">
                    {row.products?.product_nm ?? "-"}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="border-r border-slate-200 p-2">{row.in_qty}</td>
                  <td className="border-r border-slate-200 p-2">
                    {Number(row.in_prc).toLocaleString()}
                  </td>
                  <td className="whitespace-pre-wrap p-2">{row.note ?? "-"}</td>
                </tr>
              ))}
              {(purchases ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">
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
          매출 현황
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">주문일자</th>
                <th className="border-r border-slate-200 p-2">배송일자</th>
                <th className="border-r border-slate-200 p-2">현장</th>
                <th className="border-r border-slate-200 p-2">제품</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="border-r border-slate-200 p-2">매출개수</th>
                <th className="border-r border-slate-200 p-2">매출단가</th>
                <th className="p-2">비고</th>
              </tr>
            </thead>
            <tbody>
              {(sales ?? []).map((row) => (
                <tr key={row.out_id} className="border-b border-slate-200">
                  <td className="border-r border-slate-200 p-2">{row.order_date}</td>
                  <td className="border-r border-slate-200 p-2">{row.out_date ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">{row.apartment ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">
                    {row.products?.product_nm ?? "-"}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="border-r border-slate-200 p-2">{row.out_qty}</td>
                  <td className="border-r border-slate-200 p-2">
                    {Number(row.out_prc).toLocaleString()}
                  </td>
                  <td className="whitespace-pre-wrap p-2">{row.note ?? "-"}</td>
                </tr>
              ))}
              {(sales ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-400">
                    매출 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
