import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { SidebarNav } from "./sidebar-nav";

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

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-800">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-900 bg-slate-800 px-4">
        <span className="text-sm font-bold tracking-wide text-white">
          판매관리시스템
        </span>
        <div className="flex items-center gap-3 text-xs text-slate-200">
          <span>
            {profile?.user_nm ?? user?.email}
            {profile?.admin_yn === "1" ? " (관리자)" : ""} 님
          </span>
          <form action={signOut}>
            <button className="rounded-sm border border-slate-500 px-2 py-1 text-slate-100 hover:bg-slate-700">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-48 shrink-0 border-r border-slate-300 bg-white">
          <SidebarNav isAdmin={profile?.admin_yn === "1"} />
        </nav>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
