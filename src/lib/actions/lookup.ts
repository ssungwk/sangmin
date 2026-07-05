"use server";

import { createClient } from "@/lib/supabase/server";

export type NearestPurchase = {
  in_date: string;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  in_prc: number;
};

export type NearestSale = {
  order_date: string;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  out_prc: number;
};

export async function findNearestSpec(
  productId: number,
  width: number,
  height: number,
  thickness: number,
) {
  const supabase = await createClient();

  const [{ data: purchase }, { data: sale }] = await Promise.all([
    supabase.rpc("nearest_purchase", { p_product_id: productId, w: width, h: height, t: thickness }),
    supabase.rpc("nearest_sale", { p_product_id: productId, w: width, h: height, t: thickness }),
  ]);

  return {
    purchase: purchase as NearestPurchase | null,
    sale: sale as NearestSale | null,
  };
}
