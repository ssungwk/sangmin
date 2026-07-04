import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { PurchaseForm, SaleForm } from "./forms";

function formatSpec(width: number, height: number, thickness: number) {
  return `${width}*${height}*${thickness}T`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: purchases }, { data: sales }] = await Promise.all([
    supabase
      .from("purchases")
      .select("*")
      .order("in_date", { ascending: false })
      .limit(20),
    supabase
      .from("sales")
      .select("*")
      .order("order_date", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">매입/매출 관리</h1>
        <form action={signOut}>
          <button className="text-sm text-gray-500 underline">로그아웃</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PurchaseForm />
        <SaleForm />
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">최근 매입 내역</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-2">매입일자</th>
                <th className="p-2">규격</th>
                <th className="p-2">매입단가</th>
              </tr>
            </thead>
            <tbody>
              {(purchases ?? []).map((row) => (
                <tr key={row.in_id} className="border-b">
                  <td className="p-2">{row.in_date}</td>
                  <td className="p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="p-2">{Number(row.in_prc).toLocaleString()}</td>
                </tr>
              ))}
              {(purchases ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-400">
                    매입 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">최근 매출 내역</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-2">주문일자</th>
                <th className="p-2">배송일자</th>
                <th className="p-2">현장</th>
                <th className="p-2">규격</th>
                <th className="p-2">매출단가</th>
              </tr>
            </thead>
            <tbody>
              {(sales ?? []).map((row) => (
                <tr key={row.out_id} className="border-b">
                  <td className="p-2">{row.order_date}</td>
                  <td className="p-2">{row.out_date ?? "-"}</td>
                  <td className="p-2">{row.apartment ?? "-"}</td>
                  <td className="p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="p-2">{Number(row.out_prc).toLocaleString()}</td>
                </tr>
              ))}
              {(sales ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">
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
