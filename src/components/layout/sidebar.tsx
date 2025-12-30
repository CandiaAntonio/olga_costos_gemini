"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Gem,
  Palette,
  Settings,
  Package,
  DollarSign,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mercado", href: "/market", icon: TrendingUp },
  { name: "Gemas", href: "/inventario/piedras", icon: Gem },
  { name: "Piezas", href: "/piezas", icon: Package },
  { name: "Esmaltes", href: "/inventario/esmaltes", icon: Palette },
  { name: "Costos Fijos", href: "/costos-fijos", icon: DollarSign },
  { name: "Ventas", href: "/ventas", icon: CalendarDays },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        {/* Logo y Marca */}
        <div className="flex h-24 shrink-0 items-center justify-center border-b border-gray-100">
          <div className="text-center">
            <h1
              className="text-2xl tracking-[0.3em] text-black uppercase"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              Lebedeva
            </h1>
            <p
              className="text-[10px] tracking-[0.4em] text-gray-500 uppercase mt-1"
              style={{ fontFamily: "Comfortaa, sans-serif" }}
            >
              Jewelry
            </p>
          </div>
        </div>

        {/* Subtítulo del sistema */}
        <div className="text-center py-2">
          <p className="text-xs tracking-widest text-gray-400 uppercase">
            Sistema de Costeo
          </p>
          <div className="lebedeva-divider mt-3" />
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-none px-3 py-2.5 text-sm transition-all duration-200",
                          isActive
                            ? "bg-black text-white"
                            : "text-gray-600 hover:bg-gray-50 hover:text-black"
                        )}
                        style={{ fontFamily: "Comfortaa, sans-serif" }}
                      >
                        <item.icon
                          strokeWidth={1.5}
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-black"
                          )}
                          aria-hidden="true"
                        />
                        <span className="tracking-wide">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Footer del sidebar */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[10px] text-center text-gray-400 tracking-wider">
            © 2024 Lebedeva Jewelry
          </p>
        </div>
      </div>
    </div>
  );
}
