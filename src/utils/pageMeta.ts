import { NAV_SECTIONS, type NavItem } from "@/constants/navItems";

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

export const resolveParentNav = (pathname: string): NavItem | undefined =>
  NAV_SECTIONS.flatMap((s) => s.items).find(
    (item) => pathname === item.to || pathname.startsWith(item.to + "/"),
  );

export const resolvePageMeta = (pathname: string) => {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
  const match = Object.keys(PAGE_META).find((p) => pathname.startsWith(p + "/"));
  if (match) return PAGE_META[match];
  const parent = resolveParentNav(pathname);
  return { title: parent?.label ?? "Admin Console", subtitle: "" };
};
