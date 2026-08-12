import { Link } from "@tanstack/react-router";
import { Skull, X } from "lucide-react";
import { NAV_ITEMS } from "./navigation";
import { useSystemStore } from "@/store/useSystemStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useSystemStore();

  return (
    <>
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-background/80 lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar/85 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <Skull className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-sm font-bold text-glow-crimson">DEVIL</p>
              <p className="text-[9px] uppercase tracking-[0.28em] text-accent">
                autonomous core
              </p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="text-muted-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1 px-3 pb-10">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => sidebarOpen && toggleSidebar()}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className:
                  "border-primary/70 bg-primary/10 text-foreground ring-glow",
              }}
              inactiveProps={{ className: "border-transparent text-muted-foreground" }}
              className="group flex items-start gap-3 rounded border px-3 py-2.5 transition-all hover:border-accent/60 hover:bg-accent/10 hover:text-foreground"
            >
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent transition-colors group-hover:text-primary" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold tracking-wide">
                  {item.label}
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {item.tag}
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}