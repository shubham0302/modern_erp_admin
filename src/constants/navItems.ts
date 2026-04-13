import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  FileBarChart2,
  Settings,
  Ruler,
  Sparkles,
  Layers,
  Palette,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  children?: NavChild[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      {
        label: "Catalogue",
        to: "/catalogue",
        icon: Package,
        children: [
          { label: "Tile Sizes", to: "/catalogue/sizes", icon: Ruler },
          { label: "Finishes", to: "/catalogue/finishes", icon: Sparkles },
          { label: "Series", to: "/catalogue/series", icon: Layers },
          { label: "Design", to: "/catalogue/designs", icon: Palette },
        ],
      },
      { label: "Orders", to: "/orders", icon: ShoppingCart },
      { label: "Inventory", to: "/inventory", icon: Boxes },
      { label: "Customers", to: "/customers", icon: Users },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Reports", to: "/reports", icon: FileBarChart2 },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];
