"use client";

import { useActionState } from "react";
import { approveUser } from "@/lib/actions/users";
import { StatusMessage } from "../status-message";

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
      <StatusMessage state={state} className="text-xs" />
    </form>
  );
}
