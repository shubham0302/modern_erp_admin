import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown } from "lucide-react";
import { NAV_SECTIONS, type NavItem } from "@/constants/navItems";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ */
/*  Page meta                                                          */
/* ------------------------------------------------------------------ */

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of store performance, inventory and catalogue activity.",
  },
  "/catalogue/sizes": {
    title: "Tile Sizes",
    subtitle: "Manage base tile dimensions for your catalogue.",
  },
  "/catalogue/finishes": {
    title: "Finishes",
    subtitle: "Surface treatments, each linked to one or more sizes.",
  },
  "/catalogue/series": {
    title: "Series",
    subtitle: "Product lines assigned to finish–size combinations.",
  },
  "/catalogue/designs": {
    title: "Design Codes",
    subtitle: "Individual SKU codes under a series.",
  },
  "/orders": { title: "Orders", subtitle: "Track, fulfil and refund customer orders." },
  "/inventory": {
    title: "Inventory",
    subtitle: "Warehouse stock, batches and movement history.",
  },
  "/customers": {
    title: "Customers",
    subtitle: "B2B and B2C customer directory with credit profiles.",
  },
  "/reports": {
    title: "Reports",
    subtitle: "Sales, GST, stock valuation and custom exports.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Organisation profile, users, roles and billing.",
  },
};

const resolveMeta = (pathname: string) => {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
  const match = Object.keys(PAGE_META).find((p) => pathname.startsWith(p + "/"));
  if (match) return PAGE_META[match];
  const navMatch = NAV_SECTIONS.flatMap((s) => s.items).find(
    (item) => pathname === item.to || pathname.startsWith(item.to + "/"),
  );
  return { title: navMatch?.label ?? "Admin Console", subtitle: "" };
};

/* ------------------------------------------------------------------ */
/*  NavTabs – sliding pill indicator (matches portal)                  */
/* ------------------------------------------------------------------ */

const NavTabs: React.FC<{
  items: NavItem[];
  pathname: string;
}> = ({ items, pathname }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const isActive = (item: NavItem) =>
    pathname === item.to || pathname.startsWith(item.to + "/");

  const activeKey = items.find((item) => isActive(item))?.label ?? "";

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const activeEl = container.querySelector(
      "[data-active='true']",
    ) as HTMLElement | null;

    if (activeEl) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      indicator.style.left = `${activeRect.left - containerRect.left}px`;
      indicator.style.width = `${activeRect.width}px`;

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        requestAnimationFrame(() => {
          if (indicator) {
            indicator.style.transition =
              "left 0.3s ease-in-out, width 0.3s ease-in-out";
          }
        });
      }
    }
  }, [activeKey]);

  return (
    <div
      ref={containerRef}
      className="relative hidden items-center gap-0.5 rounded-full bg-white p-1 shadow-xs lg:flex"
    >
      {/* Sliding pill indicator */}
      <div
        ref={indicatorRef}
        className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-nl-800 shadow-sm"
      />

      {items.map((item) => {
        const active = isActive(item);
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
          return (
            <NavTabDropdown
              key={item.to}
              item={item}
              active={active}
              pathname={pathname}
            />
          );
        }

        return (
          <Link
            key={item.to}
            to={item.to}
            data-active={active}
            className={cn(
              "relative z-10 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200",
              active ? "text-white" : "text-nl-500 hover:bg-nl-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Dropdown for items with children (e.g. Catalogue)                  */
/* ------------------------------------------------------------------ */

const NavTabDropdown: React.FC<{
  item: NavItem;
  active: boolean;
  pathname: string;
}> = ({ item, active, pathname }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        data-active={active}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative z-10 flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200",
          active ? "text-white" : "text-nl-500 hover:bg-nl-100",
        )}
      >
        {item.label}
        <ChevronDown
          size={13}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-45 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-nl-100">
          {item.children!.map((child) => {
            const childActive = pathname === child.to;
            return (
              <Link
                key={child.to}
                to={child.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  childActive
                    ? "bg-pl-50 text-pl-700"
                    : "text-nl-600 hover:bg-nl-50 hover:text-nl-900",
                )}
              >
                <child.icon
                  size={16}
                  className={childActive ? "text-pl-500" : "text-nl-400"}
                />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

const AdminHeader: React.FC = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { title } = resolveMeta(pathname);

  const allItems = NAV_SECTIONS.flatMap((s) => s.items);

  return (
    <header className="w-full">
      {/* Top nav bar */}
      <nav className="flex w-full shrink-0 items-center justify-between bg-nl-50 px-4 py-3 sm:px-6 md:px-10 lg:px-8">
        {/* Left: Logo */}
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-[10px] bg-linear-to-br from-pl-500 to-pl-400 shadow-sm">
            <span className="text-sm font-extrabold text-white">M</span>
          </div>
          <span className="hidden text-[15px] font-bold text-nl-800 sm:block">
            Modern ERP
          </span>
        </Link>

        {/* Right: Nav Tabs + Bell + Profile */}
        <div className="flex items-center gap-3">
          <NavTabs items={allItems} pathname={pathname} />

          <button className="hidden size-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-xs transition-colors hover:bg-nl-100 lg:flex">
            <Bell className="size-4.5 text-nl-500" />
          </button>

          <button className="flex cursor-pointer items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-xs transition-colors hover:bg-nl-50">
            <img
              src="https://api.dicebear.com/9.x/avataaars/svg?seed=Admin"
              alt="avatar"
              className="size-8 rounded-full bg-nl-200"
            />
            <span className="hidden text-xs font-semibold text-nl-700 lg:block">
              Super Admin
            </span>
            <svg
              className="hidden size-3 text-nl-400 lg:block"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Page title row */}
      <div className="px-4 pt-5 pb-2 sm:px-6 md:px-10 lg:px-8">
        <h1 className="text-2xl font-bold text-nl-800">{title}</h1>
      </div>
    </header>
  );
};

export default AdminHeader;
