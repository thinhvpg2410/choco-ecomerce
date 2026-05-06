"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PanelLeft } from "lucide-react";

/* ---------------- CONTEXT ---------------- */

type SidebarContextType = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (v: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

/* ---------------- PROVIDER ---------------- */

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = () => setOpen((v) => !v);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider
      value={{ state, open, setOpen, isMobile, toggleSidebar }}
    >
      <div
        className="flex min-h-svh w-full"
        data-state={state}
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/* ---------------- SIDEBAR WRAPPER ---------------- */

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isMobile, state } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open>
        <SheetContent className="w-[16rem] p-0 bg-sidebar">
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "h-svh bg-sidebar text-sidebar-foreground border-r transition-all duration-200",
        state === "expanded"
          ? "w-[--sidebar-width]"
          : "w-[--sidebar-width-icon]",
      )}
    >
      {children}
    </aside>
  );
}

/* ---------------- SIDEBAR SECTIONS ---------------- */

export const SidebarContent = ({ children }: any) => (
  <div className="flex flex-col h-full">{children}</div>
);

export const SidebarGroup = ({ children }: any) => (
  <div className="p-2">{children}</div>
);

export const SidebarGroupLabel = ({ children }: any) => (
  <div className="text-sm font-bold px-2 py-2">{children}</div>
);

export const SidebarGroupContent = ({ children }: any) => <div>{children}</div>;

export const SidebarMenu = ({ children }: any) => (
  <div className="flex flex-col gap-1">{children}</div>
);

export const SidebarMenuItem = ({ children }: any) => <div>{children}</div>;

export const SidebarMenuButton = ({ children, onClick, isActive }: any) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm",
        isActive ? "bg-muted font-semibold" : "hover:bg-muted/50",
      )}
    >
      {children}
    </button>
  );
};

export const SidebarFooter = ({ children }: any) => (
  <div className="mt-auto p-2 border-t">{children}</div>
);

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
      <PanelLeft />
    </Button>
  );
}

/* ---------------- EXPORT ---------------- */
export default SidebarProvider;
