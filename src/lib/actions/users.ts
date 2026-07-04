"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendApprovalEmail } from "@/lib/email";

export type ManagedUser = {
  user_id: string;
  user_nm: string;
  admin_yn: string;
  approved_yn: string;
  email: string;
  created_at: string;
};

export async function listUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_users");

  if (error) return { users: [] as ManagedUser[], error: error.message };
  return { users: (data ?? []) as ManagedUser[], error: undefined };
}

export async function approveUser(_prevState: unknown, formData: FormData) {
  const userId = formData.get("user_id") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ approved_yn: "1" })
    .eq("user_id", userId);

  if (error) return { error: error.message };

  const emailResult = await sendApprovalEmail(email, name);

  revalidatePath("/dashboard/users");

  if (emailResult.error) {
    return { success: "승인 처리되었습니다.", warning: emailResult.error };
  }
  return { success: "승인 처리 및 알림 메일 발송 완료." };
}
