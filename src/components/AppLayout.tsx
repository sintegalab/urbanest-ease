import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import DevelopmentSelector from "./DevelopmentSelector";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[240px] transition-all duration-300">
        <div className="flex items-center justify-end border-b border-border px-6 lg:px-8 py-3">
          <DevelopmentSelector />
        </div>
        <div className="p-6 lg:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
