import {
  LayoutDashboard,
  Package,
  Boxes,
  Factory,
  ShoppingCart,
  Wallet,
  Warehouse,
  Users,
  Ruler,
  Sparkles,
  Layers,
  Palette,
  UserSquare2,
  ShieldCheck,
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
    title: "Main",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
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
      { label: "Inventory", to: "/inventory", icon: Boxes },
      { label: "Production", to: "/production", icon: Factory },
      { label: "Order", to: "/order", icon: ShoppingCart },
      { label: "Finance", to: "/finance", icon: Wallet },
      { label: "Depot", to: "/depot", icon: Warehouse },
      {
        label: "Staff",
        to: "/staff",
        icon: Users,
        children: [
          { label: "Users", to: "/staff/users", icon: UserSquare2 },
          {
            label: "Roles & Permissions",
            to: "/staff/roles",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
];
