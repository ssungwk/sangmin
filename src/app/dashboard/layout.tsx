import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
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
        .select("user_nm, admin_yn, approved_yn")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const isAdmin = profile?.admin_yn === "1";
  const isApproved = profile?.approved_yn === "1";
  const userLabel = `${profile?.user_nm ?? user?.email}${isAdmin ? " (관리자)" : ""} 님`;

  if (!isApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm border border-slate-300 bg-white p-6 text-center">
          <p className="mb-4 text-sm text-slate-700">
            관리자 승인 대기 중입니다. 승인되면 이메일로 안내드립니다.
          </p>
          <form action={signOut}>
            <button className="rounded-none border border-slate-400 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell userLabel={userLabel} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  );
}
