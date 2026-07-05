import { createClient } from "@/lib/supabase/server";
import { listProducts } from "@/lib/actions/products";
import { SaleManager, type SaleRow } from "./sale-manager";

export default async function SalesPage() {
  const supabase = await createClient();

  const [{ data: sales }, { products }] = await Promise.all([
    supabase
      .from("sales")
      .select("*, products(product_nm)")
      .order("order_date", { ascending: false })
      .limit(50),
    listProducts(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        매출등록
      </h1>

      <SaleManager products={products} sales={(sales ?? []) as SaleRow[]} />
    </div>
  );
}
