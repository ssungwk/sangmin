import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { NewProductForm, StockInForm, StockOutForm } from "./forms";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: recentOut }] = await Promise.all([
    supabase.from("products").select("*").order("name"),
    supabase
      .from("stock_out_with_margin")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const productList = products ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">재고 관리 대시보드</h1>
        <form action={signOut}>
          <button className="text-sm text-gray-500 underline">로그아웃</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <NewProductForm />
        <StockInForm products={productList} />
        <StockOutForm products={productList} />
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">상품 현황</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-2">상품명</th>
                <th className="p-2">SKU</th>
                <th className="p-2">매입가</th>
                <th className="p-2">판매가</th>
                <th className="p-2">재고수량</th>
                <th className="p-2">마진율</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((p) => {
                const margin =
                  p.sale_price > 0
                    ? (((p.sale_price - p.purchase_price) / p.sale_price) * 100).toFixed(1)
                    : "-";
                return (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.sku ?? "-"}</td>
                    <td className="p-2">{p.purchase_price.toLocaleString()}</td>
                    <td className="p-2">{p.sale_price.toLocaleString()}</td>
                    <td className="p-2">{p.stock_quantity}</td>
                    <td className="p-2">{margin === "-" ? "-" : `${margin}%`}</td>
                  </tr>
                );
              })}
              {productList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">최근 출고 내역</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-2">일시</th>
                <th className="p-2">상품명</th>
                <th className="p-2">수량</th>
                <th className="p-2">판매단가</th>
                <th className="p-2">마진율</th>
              </tr>
            </thead>
            <tbody>
              {(recentOut ?? []).map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">
                    {new Date(row.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="p-2">{row.product_name}</td>
                  <td className="p-2">{row.quantity}</td>
                  <td className="p-2">{row.sale_price.toLocaleString()}</td>
                  <td className="p-2">
                    {row.margin_rate_percent === null
                      ? "-"
                      : `${row.margin_rate_percent}%`}
                  </td>
                </tr>
              ))}
              {(recentOut ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">
                    출고 내역이 없습니다.
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
