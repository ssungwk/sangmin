import { createClient } from "@/lib/supabase/server";
import { listProducts } from "@/lib/actions/products";
import { PurchaseManager, type PurchaseRow } from "./purchase-manager";

export default async function PurchasesPage() {
  const supabase = await createClient();

  const [{ data: purchases }, { products }] = await Promise.all([
    supabase
      .from("purchases")
      .select("*, products(product_nm)")
      .order("in_date", { ascending: false })
      .limit(50),
    listProducts(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        매입등록
      </h1>

      <PurchaseManager products={products} purchases={(purchases ?? []) as PurchaseRow[]} />
    </div>
  );
}
