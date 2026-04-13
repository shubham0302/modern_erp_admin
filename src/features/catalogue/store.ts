import { create } from "zustand";
import type { DesignCode, Finish, FinishSizePair, Series, TileSize } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => Date.now();

interface CatalogueState {
  sizes: TileSize[];
  finishes: Finish[];
  series: Series[];
  designCodes: DesignCode[];

  addSize: (label: string) => void;
  updateSize: (id: string, patch: Partial<Omit<TileSize, "id" | "createdAt">>) => void;
  deleteSize: (id: string) => void;

  addFinish: (name: string, sizeIds: string[]) => void;
  updateFinish: (id: string, patch: Partial<Omit<Finish, "id" | "createdAt">>) => void;
  deleteFinish: (id: string) => void;

  addSeries: (code: string, finishSizePairs: FinishSizePair[], description?: string) => void;
  updateSeries: (id: string, patch: Partial<Omit<Series, "id" | "createdAt">>) => void;
  deleteSeries: (id: string) => void;

  addDesignCode: (code: string, seriesId: string, applicablePairs: FinishSizePair[], thumbnailUrl?: string) => void;
  updateDesignCode: (id: string, patch: Partial<Omit<DesignCode, "id" | "createdAt">>) => void;
  deleteDesignCode: (id: string) => void;
}

const seedSizes: TileSize[] = [
  { id: "sz_4040", label: "40x40", active: true, createdAt: now() },
  { id: "sz_2540", label: "25x40", active: true, createdAt: now() },
  { id: "sz_5050", label: "50x50", active: true, createdAt: now() },
  { id: "sz_3060", label: "30x60", active: true, createdAt: now() },
  { id: "sz_6060", label: "60x60", active: true, createdAt: now() },
  { id: "sz_60120", label: "60x120", active: true, createdAt: now() },
];

const seedFinishes: Finish[] = [
  {
    id: "fn_glossy",
    name: "Glossy",
    sizeIds: ["sz_6060", "sz_60120", "sz_3060"],
    active: true,
    createdAt: now(),
  },
  {
    id: "fn_matt",
    name: "Matt",
    sizeIds: ["sz_4040", "sz_2540", "sz_5050", "sz_3060"],
    active: true,
    createdAt: now(),
  },
];

const seedSeries: Series[] = [
  {
    id: "sr_gl",
    code: "GL",
    finishSizePairs: [
      { finishId: "fn_glossy", sizeId: "sz_6060" },
      { finishId: "fn_glossy", sizeId: "sz_60120" },
    ],
    description: "Glamour line",
    active: true,
    createdAt: now(),
  },
  {
    id: "sr_el",
    code: "EL",
    finishSizePairs: [
      { finishId: "fn_glossy", sizeId: "sz_3060" },
      { finishId: "fn_glossy", sizeId: "sz_6060" },
    ],
    description: "Elegance line",
    active: true,
    createdAt: now(),
  },
  {
    id: "sr_sf",
    code: "SF",
    finishSizePairs: [
      { finishId: "fn_matt", sizeId: "sz_4040" },
      { finishId: "fn_matt", sizeId: "sz_2540" },
    ],
    description: "Soft feel",
    active: true,
    createdAt: now(),
  },
  {
    id: "sr_wf",
    code: "WF",
    finishSizePairs: [
      { finishId: "fn_matt", sizeId: "sz_5050" },
      { finishId: "fn_matt", sizeId: "sz_3060" },
    ],
    description: "Wood finish",
    active: true,
    createdAt: now(),
  },
];

const seedDesignCodes: DesignCode[] = [
  {
    id: "dc_4001",
    code: "4001",
    seriesId: "sr_gl",
    applicablePairs: [{ finishId: "fn_glossy", sizeId: "sz_6060" }],
    active: true,
    createdAt: now(),
  },
  {
    id: "dc_4002",
    code: "4002",
    seriesId: "sr_gl",
    applicablePairs: [
      { finishId: "fn_glossy", sizeId: "sz_6060" },
      { finishId: "fn_glossy", sizeId: "sz_60120" },
    ],
    active: true,
    createdAt: now(),
  },
  {
    id: "dc_4003",
    code: "4003",
    seriesId: "sr_el",
    applicablePairs: [{ finishId: "fn_glossy", sizeId: "sz_3060" }],
    active: true,
    createdAt: now(),
  },
  {
    id: "dc_5001",
    code: "5001",
    seriesId: "sr_sf",
    applicablePairs: [{ finishId: "fn_matt", sizeId: "sz_4040" }],
    active: true,
    createdAt: now(),
  },
];

export const useCatalogueStore = create<CatalogueState>((set) => ({
  sizes: seedSizes,
  finishes: seedFinishes,
  series: seedSeries,
  designCodes: seedDesignCodes,

  addSize: (label) =>
    set((s) => ({
      sizes: [
        ...s.sizes,
        { id: `sz_${uid()}`, label, active: true, createdAt: now() },
      ],
    })),
  updateSize: (id, patch) =>
    set((s) => ({
      sizes: s.sizes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  deleteSize: (id) =>
    set((s) => {
      const finishes = s.finishes.map((f) => ({
        ...f,
        sizeIds: f.sizeIds.filter((sid) => sid !== id),
      }));
      const series = s.series.map((sr) => ({
        ...sr,
        finishSizePairs: sr.finishSizePairs.filter((p) => p.sizeId !== id),
      }));
      const designCodes = s.designCodes.map((d) => ({
        ...d,
        applicablePairs: d.applicablePairs.filter((p) => p.sizeId !== id),
      }));
      return {
        sizes: s.sizes.filter((x) => x.id !== id),
        finishes,
        series,
        designCodes,
      };
    }),

  addFinish: (name, sizeIds) =>
    set((s) => ({
      finishes: [
        ...s.finishes,
        { id: `fn_${uid()}`, name, sizeIds, active: true, createdAt: now() },
      ],
    })),
  updateFinish: (id, patch) =>
    set((s) => ({
      finishes: s.finishes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  deleteFinish: (id) =>
    set((s) => {
      const series = s.series.map((sr) => ({
        ...sr,
        finishSizePairs: sr.finishSizePairs.filter((p) => p.finishId !== id),
      }));
      const designCodes = s.designCodes.map((d) => ({
        ...d,
        applicablePairs: d.applicablePairs.filter((p) => p.finishId !== id),
      }));
      return {
        finishes: s.finishes.filter((x) => x.id !== id),
        series,
        designCodes,
      };
    }),

  addSeries: (code, finishSizePairs, description) =>
    set((s) => ({
      series: [
        ...s.series,
        {
          id: `sr_${uid()}`,
          code,
          finishSizePairs,
          description,
          active: true,
          createdAt: now(),
        },
      ],
    })),
  updateSeries: (id, patch) =>
    set((s) => ({
      series: s.series.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  deleteSeries: (id) =>
    set((s) => ({
      series: s.series.filter((x) => x.id !== id),
      designCodes: s.designCodes.filter((d) => d.seriesId !== id),
    })),

  addDesignCode: (code, seriesId, applicablePairs, thumbnailUrl) =>
    set((s) => ({
      designCodes: [
        ...s.designCodes,
        {
          id: `dc_${uid()}`,
          code,
          seriesId,
          applicablePairs,
          thumbnailUrl,
          active: true,
          createdAt: now(),
        },
      ],
    })),
  updateDesignCode: (id, patch) =>
    set((s) => ({
      designCodes: s.designCodes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  deleteDesignCode: (id) =>
    set((s) => ({ designCodes: s.designCodes.filter((x) => x.id !== id) })),
}));
