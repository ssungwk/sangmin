"use client";

import { signOut } from "@/lib/actions/auth";

export function LogoutButton({ className }: { className: string }) {
  return (
    <form action={signOut}>
      <button
        onClick={(e) => {
          if (!confirm("로그아웃 하시겠습니까?")) e.preventDefault();
        }}
        className={className}
      >
        로그아웃
      </button>
    </form>
  );
}
