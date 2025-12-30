import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-72 min-h-screen bg-gray-50">
        <div className="px-4 py-8 sm:px-6 lg:px-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}
