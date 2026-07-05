"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function registerPurchase(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("purchases").insert({
    in_date: formData.get("in_date") as string,
    product_id: Number(formData.get("product_id")),
    width_mm: Number(formData.get("width_mm")),
    height_mm: Number(formData.get("height_mm")),
    thickness_mm: Number(formData.get("thickness_mm")),
    in_prc: Number(formData.get("in_prc")),
    in_user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: "매입 등록되었습니다." };
}

export async function registerSale(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("sales").insert({
    order_date: formData.get("order_date") as string,
    out_date: (formData.get("out_date") as string) || null,
    apartment: (formData.get("apartment") as string) || null,
    product_id: Number(formData.get("product_id")),
    width_mm: Number(formData.get("width_mm")),
    height_mm: Number(formData.get("height_mm")),
    thickness_mm: Number(formData.get("thickness_mm")),
    out_prc: Number(formData.get("out_prc")),
    out_user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: "매출 등록되었습니다." };
}
