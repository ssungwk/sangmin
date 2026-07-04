"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">회원가입</h1>

        <input
          name="name"
          type="text"
          placeholder="이름"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="이메일"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호 (6자 이상)"
          required
          minLength={6}
          className="w-full rounded border px-3 py-2"
        />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && (
          <p className="text-sm text-green-600">{state.success}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "가입 중..." : "회원가입"}
        </button>

        <p className="text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
