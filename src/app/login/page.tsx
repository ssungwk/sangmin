"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">로그인</h1>

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
          placeholder="비밀번호"
          required
          minLength={6}
          className="w-full rounded border px-3 py-2"
        />

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-sm text-gray-500">
          계정이 없나요?{" "}
          <Link href="/signup" className="underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
