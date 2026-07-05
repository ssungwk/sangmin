"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Product = {
  product_id: string;
  product_nm: string;
};

export async function listProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("product_id, product_nm")
    .order("product_nm");

  if (error) return { products: [] as Product[], error: error.message };
  return { products: (data ?? []) as Product[], error: undefined };
}

export async function addProduct(_prevState: unknown, formData: FormData) {
  const productNm = (formData.get("product_nm") as string)?.trim();
  if (!productNm) return { error: "제품명을 입력해주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .insert({ product_id: productNm, product_nm: productNm });

  if (error) {
    if (error.code === "23505") return { error: "이미 등록된 제품명입니다." };
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/sales");
  return { success: "제품이 등록되었습니다." };
}
