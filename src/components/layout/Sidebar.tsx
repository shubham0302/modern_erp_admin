import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { NAV_SECTIONS, type NavItem } from "@/constants/navItems";
import { cn } from "@/utils/cn";

const Sidebar: React.FC = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (item: NavItem) =>
    pathname === item.to || pathname.startsWith(item.to + "/");

  const isChildActive = (to: string) => pathname === to;

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.children && isActive(item)) {
          setExpandedMenu(item.to);
          return;
        }
      }
    }
  }, []);

  return (
    <aside className="hidden w-64 shrink-0 p-4 md:block">
      <div className="flex h-full flex-col overflow-hidden rounded-4xl bg-white shadow-xs">
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
          <div className="flex size-9 items-center justify-center rounded-[11px] bg-linear-to-br from-pl-500 to-pl-400 shadow-sm">
            <span className="text-sm font-extrabold text-white">M</span>
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-bold text-nl-800">Modern ERP</div>
            <div className="text-[10px] font-semibold tracking-wider text-pl-600 uppercase">
              Admin Console
            </div>
          </div>
        </div>

        <div className="mx-5 h-px bg-nl-100" />

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.12em] text-nl-400 uppercase">
                {section.title}
              </div>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  const hasChildren =
                    item.children && item.children.length > 0;
                  const expanded = hasChildren && expandedMenu === item.to;

                  const itemClasses = cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-pl-50 text-pl-700"
                      : "text-nl-600 hover:bg-nl-50 hover:text-nl-900",
                  );

                  const accentBar = (
                    <span
                      className={cn(
                        "absolute top-1/2 left-0 h-5 w-0.75 -translate-x-px -translate-y-1/2 rounded-r-full bg-pl-500 transition-all",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  );

                  const icon = (
                    <Icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        active
                          ? "text-pl-600"
                          : "text-nl-400 group-hover:text-nl-600",
                      )}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                  );

                  return (
                    <li key={item.to}>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMenu((prev) =>
                              prev === item.to ? null : item.to,
                            )
                          }
                          className={cn(itemClasses, "cursor-pointer")}
                        >
                          {accentBar}
                          {icon}
                          <span className="flex-1 truncate text-left">
                            {item.label}
                          </span>
                          <ChevronDown
                            size={14}
                            className={cn(
                              "shrink-0 transition-transform duration-200",
                              expanded
                                ? "rotate-180 text-pl-500"
                                : "text-nl-400",
                            )}
                          />
                        </button>
                      ) : (
                        <Link
                          to={item.to}
                          className={itemClasses}
                          onClick={() => setExpandedMenu(null)}
                        >
                          {accentBar}
                          {icon}
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}

                      {expanded && (
                        <ul className="ml-4 mt-2 flex flex-col gap-1">
                          {item.children!.map((child) => {
                            const childActive = isChildActive(child.to);
                            return (
                              <li key={child.to}>
                                <Link
                                  to={child.to}
                                  className={cn(
                                    "block rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-all duration-200",
                                    childActive
                                      ? "bg-pl-50 text-pl-700"
                                      : "text-nl-500 hover:bg-nl-50 hover:text-nl-800",
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
