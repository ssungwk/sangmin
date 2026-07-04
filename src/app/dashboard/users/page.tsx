import { createClient } from "@/lib/supabase/server";
import { listUsers } from "@/lib/actions/users";
import { ApproveButton } from "./approve-button";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("admin_yn").eq("user_id", user.id).single()
    : { data: null };

  if (profile?.admin_yn !== "1") {
    return (
      <div className="border border-slate-300 bg-white p-6 text-sm text-slate-600">
        관리자만 접근할 수 있는 페이지입니다.
      </div>
    );
  }

  const { users, error } = await listUsers();

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-slate-700 pb-2 text-lg font-bold text-slate-800">
        사용자관리
      </h1>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <section className="border border-slate-300 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">이름</th>
                <th className="border-r border-slate-200 p-2">이메일</th>
                <th className="border-r border-slate-200 p-2">가입일</th>
                <th className="border-r border-slate-200 p-2">관리자</th>
                <th className="border-r border-slate-200 p-2">승인상태</th>
                <th className="p-2">처리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b border-slate-200">
                  <td className="border-r border-slate-200 p-2">{u.user_nm}</td>
                  <td className="border-r border-slate-200 p-2">{u.email}</td>
                  <td className="border-r border-slate-200 p-2">
                    {new Date(u.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {u.admin_yn === "1" ? "관리자" : "-"}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {u.approved_yn === "1" ? (
                      <span className="text-blue-700">승인됨</span>
                    ) : (
                      <span className="text-amber-700">대기중</span>
                    )}
                  </td>
                  <td className="p-2">
                    {u.approved_yn === "1" ? (
                      "-"
                    ) : (
                      <ApproveButton userId={u.user_id} email={u.email} name={u.user_nm} />
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">
                    사용자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
