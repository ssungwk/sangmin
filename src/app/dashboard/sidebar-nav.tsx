"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "현황" },
  { href: "/dashboard/purchases", label: "매입등록" },
  { href: "/dashboard/sales", label: "매출등록" },
  { href: "/dashboard/products", label: "제품관리" },
];

const adminMenuItems = [{ href: "/dashboard/users", label: "사용자관리" }];

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...menuItems, ...adminMenuItems] : menuItems;

  return (
    <ul className="py-2 text-sm">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                active
                  ? "block border-l-4 border-blue-800 bg-blue-50 px-4 py-2.5 font-medium text-blue-900"
                  : "block border-l-4 border-transparent px-4 py-2.5 text-slate-600 hover:bg-slate-50"
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
