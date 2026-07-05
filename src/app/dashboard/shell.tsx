"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { LogoutButton } from "./logout-button";

export function DashboardShell({
  userLabel,
  isAdmin,
  children,
}: {
  userLabel: string;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // 메뉴 클릭으로 경로가 바뀌면 모바일 메뉴를 자동으로 닫음 (렌더 중 상태 조정 패턴)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-800">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-900 bg-slate-800 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-sm border border-slate-600 px-2 py-1 text-base leading-none text-white md:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <span className="text-sm font-bold tracking-wide text-white">
            판매관리시스템
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-200">
          <span className="hidden sm:inline">{userLabel}</span>
          <LogoutButton className="rounded-sm border border-slate-500 px-2 py-1 text-slate-100 hover:bg-slate-700" />
        </div>
      </header>

      <div className="relative flex flex-1">
        {menuOpen && (
          <div
            className="fixed inset-0 top-14 z-10 bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <nav
          className={`fixed bottom-0 left-0 top-14 z-20 w-48 border-r border-slate-300 bg-white transition-transform duration-200 md:static md:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarNav isAdmin={isAdmin} />
        </nav>

        <main className="flex-1 overflow-x-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
