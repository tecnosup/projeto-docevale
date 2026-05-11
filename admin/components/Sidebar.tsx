"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Users,
  Building2,
  TrendingUp,
  Shield,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/cardapio", label: "Cardápio", icon: BookOpen },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/consignado", label: "Consignado", icon: Building2 },
  { href: "/financeiro", label: "Financeiro", icon: TrendingUp },
  { href: "/auditoria", label: "Auditoria", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col">
      <div className="px-5 py-5 border-b border-neutral-800">
        <span className="text-amber-400 font-semibold text-lg">Doce Vale</span>
        <p className="text-neutral-500 text-xs mt-0.5">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-amber-500/10 text-amber-400 font-medium"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
