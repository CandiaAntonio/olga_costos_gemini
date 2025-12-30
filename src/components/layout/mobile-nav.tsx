'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Gem,
  Palette,
  Settings,
  Package,
  DollarSign,
  CalendarDays,
  Menu,
  X,
  TrendingUp
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Mercado', href: '/market', icon: TrendingUp },
  { name: 'Gemas', href: '/inventario/piedras', icon: Gem },
  { name: 'Piezas', href: '/piezas', icon: Package },
  { name: 'Esmaltes', href: '/inventario/esmaltes', icon: Palette },
  { name: 'Costos Fijos', href: '/costos-fijos', icon: DollarSign },
  { name: 'Ventas', href: '/ventas', icon: CalendarDays },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      {/* Header móvil */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-black"
          onClick={() => setIsOpen(true)}
        >
          <span className="sr-only">Abrir menú</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-center">
          <span
            className="text-lg tracking-[0.2em] text-black uppercase"
            style={{ fontFamily: 'Cormorant, serif' }}
          >
            Lebedeva
          </span>
        </div>
        <div className="w-10" /> {/* Spacer para centrar */}
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="relative z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Cerrar menú</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                {/* Logo */}
                <div className="flex h-20 shrink-0 items-center justify-center border-b border-gray-100">
                  <div className="text-center">
                    <h1
                      className="text-xl tracking-[0.3em] text-black uppercase"
                      style={{ fontFamily: 'Cormorant, serif' }}
                    >
                      Lebedeva
                    </h1>
                    <p
                      className="text-[9px] tracking-[0.4em] text-gray-500 uppercase mt-1"
                      style={{ fontFamily: 'Comfortaa, sans-serif' }}
                    >
                      Jewelry
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] tracking-widest text-gray-400 uppercase">
                    Sistema de Costeo
                  </p>
                </div>

                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-2">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href))
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  'group flex gap-x-3 rounded-sm px-3 py-3 text-sm transition-all duration-200',
                                  isActive
                                    ? 'bg-black text-white'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                                )}
                                style={{ fontFamily: 'Comfortaa, sans-serif' }}
                              >
                                <item.icon
                                  className={cn(
                                    'h-5 w-5 shrink-0',
                                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-black'
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="tracking-wide">{item.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
