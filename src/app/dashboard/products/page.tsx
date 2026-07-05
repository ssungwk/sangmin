import { listProducts } from "@/lib/actions/products";
import { ProductForm } from "./product-form";
import { ProductRow } from "./product-row";

export default async function ProductsPage() {
  const { products, error } = await listProducts();

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        제품관리
      </h1>

      <ProductForm />

      {error && <p className="text-sm text-red-700">{error}</p>}

      <section className="border border-slate-300 bg-white">
        <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
          제품 목록
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">제품ID</th>
                <th className="border-r border-slate-200 p-2">제품명 / 정렬순서</th>
                <th className="p-2">삭제</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <ProductRow key={p.product_id} product={p} />
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400">
                    등록된 제품이 없습니다.
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
