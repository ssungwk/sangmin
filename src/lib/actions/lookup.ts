"use server";

import { createClient } from "@/lib/supabase/server";

export type NearestPurchase = {
  in_date: string;
  width_mm: number;
  height_mm: number;
  thickness_mm: number | null;
  in_prc: number;
};

export type NearestSale = {
  order_date: string;
  out_date: string | null;
  width_mm: number;
  height_mm: number;
  thickness_mm: number | null;
  out_prc: number;
};

export async function findNearestSpec(
  productId: string,
  width: number,
  height: number,
  thickness: number | null,
) {
  const supabase = await createClient();

  const [purchaseRes, saleRes] = await Promise.all([
    supabase.rpc("nearest_purchases", { p_product_id: productId, w: width, h: height, t: thickness }),
    supabase.rpc("nearest_sales", { p_product_id: productId, w: width, h: height, t: thickness }),
  ]);

  if (purchaseRes.error) console.error("nearest_purchases error:", purchaseRes.error);
  if (saleRes.error) console.error("nearest_sales error:", saleRes.error);

  return {
    purchases: (purchaseRes.data as NearestPurchase[] | null) ?? [],
    sales: (saleRes.data as NearestSale[] | null) ?? [],
    error: purchaseRes.error?.message ?? saleRes.error?.message ?? null,
  };
}
