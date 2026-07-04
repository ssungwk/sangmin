"use client";

import { useActionState } from "react";
import { approveUser } from "@/lib/actions/users";

export function ApproveButton({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(approveUser, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="name" value={name} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-blue-800 px-3 py-1 text-xs font-medium text-white hover:bg-blue-900 disabled:opacity-50"
      >
        {pending ? "처리 중..." : "승인"}
      </button>
      {state?.success && <span className="text-xs text-blue-700">{state.success}</span>}
      {state?.warning && <span className="text-xs text-amber-700">{state.warning}</span>}
      {state?.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
