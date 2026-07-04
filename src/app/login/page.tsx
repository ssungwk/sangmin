"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm border border-slate-300 bg-white shadow-sm">
        <div className="border-b-4 border-blue-800 bg-slate-800 px-6 py-4">
          <h1 className="text-base font-bold tracking-wide text-white">
            판매관리시스템
          </h1>
        </div>

        <form action={formAction} className="space-y-3 p-6">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-slate-600">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-slate-600">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          {state?.error && (
            <p className="border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-none bg-blue-800 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "로그인 중..." : "로그인"}
          </button>

          <p className="border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
            계정이 없나요?{" "}
            <Link href="/signup" className="font-medium text-blue-800 underline underline-offset-2">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
