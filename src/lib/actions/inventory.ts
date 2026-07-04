"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addProduct(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").insert({
    name: formData.get("name") as string,
    sku: (formData.get("sku") as string) || null,
    purchase_price: Number(formData.get("purchase_price")),
    sale_price: Number(formData.get("sale_price")),
    stock_quantity: 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: "상품이 등록되었습니다." };
}

export async function stockIn(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("stock_in").insert({
    product_id: formData.get("product_id") as string,
    quantity: Number(formData.get("quantity")),
    purchase_price: Number(formData.get("purchase_price")),
    note: (formData.get("note") as string) || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: "입고 처리되었습니다." };
}

export async function stockOut(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("stock_out").insert({
    product_id: formData.get("product_id") as string,
    quantity: Number(formData.get("quantity")),
    sale_price: Number(formData.get("sale_price")),
    note: (formData.get("note") as string) || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: "출고 처리되었습니다." };
}
