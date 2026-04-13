import { useState } from "react";
import { Ruler, Sparkles, Layers, Palette } from "lucide-react";
import { cn } from "@/utils/cn";
import TileSizesTab from "./tabs/TileSizesTab";
import FinishesTab from "./tabs/FinishesTab";
import SeriesTab from "./tabs/SeriesTab";
import DesignCodesTab from "./tabs/DesignCodesTab";

type TabKey = "sizes" | "finishes" | "series" | "designs";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  step: number;
  description: string;
}

const TABS: TabDef[] = [
  {
    key: "sizes",
    label: "Tile Sizes",
    icon: Ruler,
    step: 1,
    description: "Base dimensions used across the catalogue.",
  },
  {
    key: "finishes",
    label: "Finishes",
    icon: Sparkles,
    step: 2,
    description: "Surface treatments, each linked to one or more sizes.",
  },
  {
    key: "series",
    label: "Series",
    icon: Layers,
    step: 3,
    description: "Product lines within a finish.",
  },
  {
    key: "designs",
    label: "Design Codes",
    icon: Palette,
    step: 4,
    description: "Individual SKU codes under a series.",
  },
];

const CataloguePage: React.FC = () => {
  const [active, setActive] = useState<TabKey>("sizes");
  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <div className="page-enter space-y-6">
      {/* Stepper tabs */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-nl-200 bg-nl-50/60 p-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={cn(
                  "flex min-w-[9.5rem] flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-nl-900 shadow-sm ring-1 ring-nl-200"
                    : "text-nl-600 hover:bg-white/60 hover:text-nl-800",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    isActive
                      ? "bg-pl-600 text-white"
                      : "bg-nl-200 text-nl-600",
                  )}
                >
                  {t.step}
                </span>
                <Icon
                  size={16}
                  className={isActive ? "text-pl-600" : "text-nl-400"}
                />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="border-b border-nl-100 bg-white px-6 py-3">
          <p className="text-xs text-nl-500">{activeTab.description}</p>
        </div>

        <div className="p-6">
          {active === "sizes" && <TileSizesTab />}
          {active === "finishes" && <FinishesTab />}
          {active === "series" && <SeriesTab />}
          {active === "designs" && <DesignCodesTab />}
        </div>
      </div>
    </div>
  );
};

export default CataloguePage;
