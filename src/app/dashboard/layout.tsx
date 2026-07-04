import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("user_nm, admin_yn")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const isAdmin = profile?.admin_yn === "1";
  const userLabel = `${profile?.user_nm ?? user?.email}${isAdmin ? " (관리자)" : ""} 님`;

  return (
    <DashboardShell userLabel={userLabel} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  );
}
