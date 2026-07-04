import { createClient } from "@/lib/supabase/server";
import { formatSpec } from "@/lib/format";
import { SaleForm } from "../forms";

export default async function SalesPage() {
  const supabase = await createClient();

  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .order("order_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        매출등록
      </h1>

      <SaleForm />

      <section className="border border-slate-300 bg-white">
        <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
          매출 내역
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">주문일자</th>
                <th className="border-r border-slate-200 p-2">배송일자</th>
                <th className="border-r border-slate-200 p-2">현장</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="p-2">매출단가</th>
              </tr>
            </thead>
            <tbody>
              {(sales ?? []).map((row) => (
                <tr key={row.out_id} className="border-b border-slate-200">
                  <td className="border-r border-slate-200 p-2">{row.order_date}</td>
                  <td className="border-r border-slate-200 p-2">{row.out_date ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">{row.apartment ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="p-2">{Number(row.out_prc).toLocaleString()}</td>
                </tr>
              ))}
              {(sales ?? []).length === 0 && (
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
    </div>
  );
}
