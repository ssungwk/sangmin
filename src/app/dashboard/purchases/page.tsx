import { createClient } from "@/lib/supabase/server";
import { formatSpec } from "@/lib/format";
import { PurchaseForm } from "../forms";

export default async function PurchasesPage() {
  const supabase = await createClient();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .order("in_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        매입등록
      </h1>

      <PurchaseForm />

      <section className="border border-slate-300 bg-white">
        <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
          매입 내역
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">매입일자</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="p-2">매입단가</th>
              </tr>
            </thead>
            <tbody>
              {(purchases ?? []).map((row) => (
                <tr key={row.in_id} className="border-b border-slate-200">
                  <td className="border-r border-slate-200 p-2">{row.in_date}</td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="p-2">{Number(row.in_prc).toLocaleString()}</td>
                </tr>
              ))}
              {(purchases ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400">
                    매입 내역이 없습니다.
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
