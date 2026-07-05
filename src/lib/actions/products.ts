"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Product = {
  product_id: string;
  product_nm: string;
  sort_no: number;
};

function revalidateProductPaths() {
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/purchases");
  revalidatePath("/dashboard/sales");
}

export async function listProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("product_id, product_nm, sort_no")
    .order("sort_no")
    .order("product_nm");

  if (error) return { products: [] as Product[], error: error.message };
  return { products: (data ?? []) as Product[], error: undefined };
}

export async function addProduct(_prevState: unknown, formData: FormData) {
  const productNm = (formData.get("product_nm") as string)?.trim();
  if (!productNm) return { error: "제품명을 입력해주세요." };

  const supabase = await createClient();

  const { data: maxRow } = await supabase
    .from("products")
    .select("sort_no")
    .order("sort_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortNo = (maxRow?.sort_no ?? 0) + 1;

  const { error } = await supabase
    .from("products")
    .insert({ product_id: productNm, product_nm: productNm, sort_no: nextSortNo });

  if (error) {
    if (error.code === "23505") return { error: "이미 등록된 제품명입니다." };
    return { error: error.message };
  }

  revalidateProductPaths();
  return { success: "제품이 등록되었습니다." };
}

export async function updateProduct(_prevState: unknown, formData: FormData) {
  const productId = formData.get("product_id") as string;
  const productNm = (formData.get("product_nm") as string)?.trim();
  const sortNo = Number(formData.get("sort_no"));

  if (!productNm) return { error: "제품명을 입력해주세요." };
  if (Number.isNaN(sortNo)) return { error: "정렬순서는 숫자여야 합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ product_nm: productNm, sort_no: sortNo })
    .eq("product_id", productId);

  if (error) return { error: error.message };

  revalidateProductPaths();
  return { success: "수정되었습니다." };
}

export async function deleteProduct(_prevState: unknown, formData: FormData) {
  const productId = formData.get("product_id") as string;

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("product_id", productId);

  if (error) {
    if (error.code === "23503") {
      return { error: "매입/매출 내역이 있는 제품은 삭제할 수 없습니다." };
    }
    return { error: error.message };
  }

  revalidateProductPaths();
  return { success: "삭제되었습니다." };
}
