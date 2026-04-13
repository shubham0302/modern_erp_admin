import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useCatalogueStore } from "../store";
import type { DesignCode, FinishSizePair } from "../types";
import EmptyState from "../components/EmptyState";
import Button from "@/components/ui/Button";
import RowActions from "../components/RowActions";
import ToggleSwitch from "../components/ToggleSwitch";
import Dialog from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";

const pairKey = (p: FinishSizePair) => `${p.finishId}::${p.sizeId}`;

const DesignCodesPage: React.FC = () => {
  const designCodes = useCatalogueStore((s) => s.designCodes);
  const seriesList = useCatalogueStore((s) => s.series);
  const finishes = useCatalogueStore((s) => s.finishes);
  const sizes = useCatalogueStore((s) => s.sizes);
  const addDesignCode = useCatalogueStore((s) => s.addDesignCode);
  const updateDesignCode = useCatalogueStore((s) => s.updateDesignCode);
  const deleteDesignCode = useCatalogueStore((s) => s.deleteDesignCode);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DesignCode | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DesignCode | null>(null);
  const [seriesFilter, setSeriesFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [code, setCode] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [selectedPairs, setSelectedPairs] = useState<FinishSizePair[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState("");

  const seriesMap = useMemo(
    () => Object.fromEntries(seriesList.map((s) => [s.id, s])),
    [seriesList],
  );
  const finishMap = useMemo(
    () => Object.fromEntries(finishes.map((f) => [f.id, f.name])),
    [finishes],
  );
  const sizeMap = useMemo(
    () => Object.fromEntries(sizes.map((s) => [s.id, s.label])),
    [sizes],
  );

  const selectedKeys = useMemo(
    () => new Set(selectedPairs.map(pairKey)),
    [selectedPairs],
  );

  const parentSeriesPairs = useMemo(() => {
    if (!seriesId) return [];
    return seriesMap[seriesId]?.finishSizePairs ?? [];
  }, [seriesId, seriesMap]);

  const filtered = useMemo(() => {
    return designCodes.filter((d) => {
      if (seriesFilter && d.seriesId !== seriesFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const sr = seriesMap[d.seriesId];
      return (
        d.code.toLowerCase().includes(q) ||
        (sr?.code ?? "").toLowerCase().includes(q)
      );
    });
  }, [designCodes, search, seriesFilter, seriesMap]);

  const openAdd = () => {
    if (seriesList.length === 0) {
      toast.error("Add a series first before creating a design code");
      return;
    }
    setAdding(true);
    setCode("");
    setSeriesId(seriesList[0]?.id ?? "");
    setSelectedPairs([]);
    setThumbnailUrl("");
    setError("");
  };

  const openEdit = (d: DesignCode) => {
    setEditing(d);
    setCode(d.code);
    setSeriesId(d.seriesId);
    setSelectedPairs(d.applicablePairs);
    setThumbnailUrl(d.thumbnailUrl ?? "");
    setError("");
  };

  const closeDialog = () => {
    setAdding(false);
    setEditing(null);
    setCode("");
    setSeriesId("");
    setSelectedPairs([]);
    setThumbnailUrl("");
    setError("");
  };

  const togglePair = (pair: FinishSizePair) => {
    const key = pairKey(pair);
    if (selectedKeys.has(key)) {
      setSelectedPairs((prev) => prev.filter((p) => pairKey(p) !== key));
    } else {
      setSelectedPairs((prev) => [...prev, pair]);
    }
  };

  const handleSeriesChange = (newSeriesId: string) => {
    setSeriesId(newSeriesId);
    setSelectedPairs([]);
  };

  const handleSave = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Design code is required");
      return;
    }
    if (!seriesId) {
      setError("Select a parent series");
      return;
    }
    if (selectedPairs.length === 0) {
      setError("Select at least one finish–size pair");
      return;
    }
    const duplicate = designCodes.some(
      (d) =>
        d.id !== editing?.id &&
        d.seriesId === seriesId &&
        d.code.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setError("A design with this code already exists under the selected series");
      return;
    }

    if (editing) {
      updateDesignCode(editing.id, {
        code: trimmed,
        seriesId,
        applicablePairs: selectedPairs,
        thumbnailUrl: thumbnailUrl || undefined,
      });
      toast.success("Design code updated");
    } else {
      addDesignCode(trimmed, seriesId, selectedPairs, thumbnailUrl || undefined);
      toast.success("Design code added");
    }
    closeDialog();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteDesignCode(deleteTarget.id);
    toast.success(`Deleted design ${deleteTarget.code}`);
    setDeleteTarget(null);
  };

  const pairsByFinish = useMemo(() => {
    const grouped = new Map<string, FinishSizePair[]>();
    for (const pair of parentSeriesPairs) {
      const list = grouped.get(pair.finishId) ?? [];
      list.push(pair);
      grouped.set(pair.finishId, list);
    }
    return grouped;
  }, [parentSeriesPairs]);

  return (
    <div className="page-enter space-y-6">
      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-nl-200 bg-white px-3">
            <Search size={16} className="text-nl-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search design codes…"
              className="w-full bg-transparent text-sm text-nl-700 placeholder:text-nl-400 focus:outline-none"
            />
          </div>
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex h-9 w-48 cursor-pointer items-center justify-between rounded-xl border border-nl-200 bg-white px-3 text-sm text-nl-900 transition-colors hover:border-nl-300"
            >
              <span className="truncate">
                {seriesFilter
                  ? seriesList.find((s) => s.id === seriesFilter)?.code ?? "All Series"
                  : "All Series"}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-nl-400 transition-transform duration-200",
                  dropdownOpen && "rotate-180",
                )}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-nl-200 bg-white py-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => { setSeriesFilter(""); setDropdownOpen(false); }}
                  className={cn(
                    "flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm transition-colors",
                    seriesFilter === ""
                      ? "bg-pl-50 font-medium text-pl-700"
                      : "text-nl-700 hover:bg-nl-50",
                  )}
                >
                  All Series
                </button>
                {seriesList.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setSeriesFilter(s.id); setDropdownOpen(false); }}
                    className={cn(
                      "flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm transition-colors",
                      seriesFilter === s.id
                        ? "bg-pl-50 font-medium text-pl-700"
                        : "text-nl-700 hover:bg-nl-50",
                    )}
                  >
                    {s.code}{s.description ? ` — ${s.description}` : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add Design Code
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No design codes"
            description="Design codes represent individual SKUs under a series."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-nl-200">
            <table className="w-full text-sm">
              <thead className="bg-nl-50 text-left text-xs font-semibold text-nl-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Design Code</th>
                  <th className="px-4 py-3">Series</th>
                  <th className="px-4 py-3">Applicable Pairs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nl-100">
                {filtered.map((d) => {
                  const sr = seriesMap[d.seriesId];
                  return (
                    <tr key={d.id} className="hover:bg-nl-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-nl-100 to-nl-200 text-[11px] font-bold text-nl-500">
                            {d.code.slice(0, 2)}
                          </div>
                          <div className="font-semibold text-nl-900">{d.code}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-nl-600">{sr?.code ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {d.applicablePairs.length === 0 ? (
                            <span className="text-xs text-nl-400">—</span>
                          ) : (
                            d.applicablePairs.map((p) => (
                              <span
                                key={pairKey(p)}
                                className="rounded-md bg-nl-100 px-2 py-0.5 text-[11px] font-medium text-nl-600"
                              >
                                {finishMap[p.finishId] ?? "?"} /{" "}
                                {(sizeMap[p.sizeId] ?? "?").replace("x", "×")}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ToggleSwitch
                          active={d.active}
                          label={d.code}
                          onToggle={() =>
                            updateDesignCode(d.id, { active: !d.active })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <RowActions
                            onEdit={() => openEdit(d)}
                            onDelete={() => setDeleteTarget(d)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={adding || editing !== null}
        onClose={closeDialog}
        title={editing ? "Edit Design Code" : "Add Design Code"}
        subtitle="Link the SKU code to a series and pick applicable finish–size pairs"
        primaryAction={{
          label: editing ? "Save" : "Add Design Code",
          onClick: handleSave,
          disabled: code.trim() === "" || !seriesId || selectedPairs.length === 0,
        }}
        secondaryAction={{ label: "Cancel", onClick: closeDialog }}
      >
        <div className="space-y-4">
          <Input
            label="Design code"
            placeholder="e.g. 4001"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError("");
            }}
            autoFocus
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-nl-700">
              Parent series
            </label>
            <select
              value={seriesId}
              onChange={(e) => handleSeriesChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-nl-200 bg-white px-3 text-sm text-nl-900 focus:border-pl-500 focus:ring-2 focus:ring-pl-500/30 focus:outline-none"
            >
              {seriesList.length === 0 && (
                <option value="">No series available</option>
              )}
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                  {s.description ? ` — ${s.description}` : ""}
                </option>
              ))}
            </select>
          </div>

          {parentSeriesPairs.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-nl-700">
                Applicable Finish – Size Pairs
              </label>
              <div className="max-h-40 space-y-3 overflow-y-auto">
                {Array.from(pairsByFinish.entries()).map(([finishId, pairs]) => (
                  <div key={finishId}>
                    <div className="mb-1.5 text-[11px] font-semibold text-nl-500 uppercase">
                      {finishMap[finishId] ?? finishId}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pairs.map((pair) => {
                        const selected = selectedKeys.has(pairKey(pair));
                        return (
                          <button
                            key={pairKey(pair)}
                            type="button"
                            onClick={() => togglePair(pair)}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                              selected
                                ? "border-pl-500 bg-pl-500 text-white"
                                : "border-nl-200 bg-white text-nl-700 hover:border-pl-400 hover:bg-pl-50",
                            )}
                          >
                            {selected && <Check size={12} strokeWidth={3} />}
                            {(sizeMap[pair.sizeId] ?? "?").replace("x", "×")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Thumbnail URL (optional)"
            placeholder="https://…"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete design code?"
        message={`This will permanently remove design code "${deleteTarget?.code}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default DesignCodesPage;
