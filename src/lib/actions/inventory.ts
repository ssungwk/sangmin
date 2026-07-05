"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidatePurchasePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/purchases");
}

function revalidateSalePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sales");
}

function parseThickness(formData: FormData) {
  const raw = formData.get("thickness_mm") as string;
  return raw ? Number(raw) : null;
}

function parseNote(formData: FormData) {
  return (formData.get("note") as string) || null;
}

export async function registerPurchase(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("purchases").insert({
    in_date: formData.get("in_date") as string,
    product_id: formData.get("product_id") as string,
    width_mm: Number(formData.get("width_mm")),
    height_mm: Number(formData.get("height_mm")),
    thickness_mm: parseThickness(formData),
    in_qty: Number(formData.get("in_qty")) || 1,
    in_prc: Number(formData.get("in_prc")),
    note: parseNote(formData),
    in_user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePurchasePaths();
  return { success: "매입 등록되었습니다." };
}

export async function updatePurchase(_prevState: unknown, formData: FormData) {
  const inId = Number(formData.get("in_id"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchases")
    .update({
      in_date: formData.get("in_date") as string,
      product_id: formData.get("product_id") as string,
      width_mm: Number(formData.get("width_mm")),
      height_mm: Number(formData.get("height_mm")),
      thickness_mm: parseThickness(formData),
      in_qty: Number(formData.get("in_qty")) || 1,
      in_prc: Number(formData.get("in_prc")),
      note: parseNote(formData),
    })
    .eq("in_id", inId);

  if (error) return { error: error.message };

  revalidatePurchasePaths();
  return { success: "매입 내역이 수정되었습니다." };
}

export async function deletePurchase(_prevState: unknown, formData: FormData) {
  const inId = Number(formData.get("in_id"));

  const supabase = await createClient();
  const { error } = await supabase.from("purchases").delete().eq("in_id", inId);

  if (error) return { error: error.message };

  revalidatePurchasePaths();
  return { success: "매입 내역이 삭제되었습니다." };
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
    product_id: formData.get("product_id") as string,
    width_mm: Number(formData.get("width_mm")),
    height_mm: Number(formData.get("height_mm")),
    thickness_mm: parseThickness(formData),
    out_qty: Number(formData.get("out_qty")) || 1,
    out_prc: Number(formData.get("out_prc")),
    note: parseNote(formData),
    out_user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidateSalePaths();
  return { success: "매출 등록되었습니다." };
}

export async function updateSale(_prevState: unknown, formData: FormData) {
  const outId = Number(formData.get("out_id"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("sales")
    .update({
      order_date: formData.get("order_date") as string,
      out_date: (formData.get("out_date") as string) || null,
      apartment: (formData.get("apartment") as string) || null,
      product_id: formData.get("product_id") as string,
      width_mm: Number(formData.get("width_mm")),
      height_mm: Number(formData.get("height_mm")),
      thickness_mm: parseThickness(formData),
      out_qty: Number(formData.get("out_qty")) || 1,
      out_prc: Number(formData.get("out_prc")),
      note: parseNote(formData),
    })
    .eq("out_id", outId);

  if (error) return { error: error.message };

  revalidateSalePaths();
  return { success: "매출 내역이 수정되었습니다." };
}

export async function deleteSale(_prevState: unknown, formData: FormData) {
  const outId = Number(formData.get("out_id"));

  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("out_id", outId);

  if (error) return { error: error.message };

  revalidateSalePaths();
  return { success: "매출 내역이 삭제되었습니다." };
}
