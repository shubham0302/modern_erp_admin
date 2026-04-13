import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useCatalogueStore } from "../store";
import type { FinishSizePair, Series } from "../types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import ToggleSwitch from "../components/ToggleSwitch";
import Dialog from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";

const pairKey = (p: FinishSizePair) => `${p.finishId}::${p.sizeId}`;

const SeriesPage: React.FC = () => {
  const seriesList = useCatalogueStore((s) => s.series);
  const finishes = useCatalogueStore((s) => s.finishes);
  const sizes = useCatalogueStore((s) => s.sizes);
  const addSeries = useCatalogueStore((s) => s.addSeries);
  const updateSeries = useCatalogueStore((s) => s.updateSeries);
  const deleteSeries = useCatalogueStore((s) => s.deleteSeries);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Series | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Series | null>(null);

  const [code, setCode] = useState("");
  const [selectedPairs, setSelectedPairs] = useState<FinishSizePair[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const finishMap = useMemo(
    () => Object.fromEntries(finishes.map((f) => [f.id, f])),
    [finishes],
  );
  const sizeMap = useMemo(
    () => Object.fromEntries(sizes.map((s) => [s.id, s.label])),
    [sizes],
  );

  const availablePairs = useMemo(() => {
    const pairs: FinishSizePair[] = [];
    for (const finish of finishes) {
      for (const sizeId of finish.sizeIds) {
        pairs.push({ finishId: finish.id, sizeId });
      }
    }
    return pairs;
  }, [finishes]);

  const selectedKeys = useMemo(
    () => new Set(selectedPairs.map(pairKey)),
    [selectedPairs],
  );

  const filtered = useMemo(
    () =>
      seriesList.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.code.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q)
        );
      }),
    [seriesList, search],
  );

  const openAdd = () => {
    if (finishes.length === 0) {
      toast.error("Add a finish first before creating a series");
      return;
    }
    setAdding(true);
    setCode("");
    setSelectedPairs([]);
    setDescription("");
    setError("");
  };

  const openEdit = (s: Series) => {
    setEditing(s);
    setCode(s.code);
    setSelectedPairs(s.finishSizePairs);
    setDescription(s.description ?? "");
    setError("");
  };

  const closeDialog = () => {
    setAdding(false);
    setEditing(null);
    setCode("");
    setSelectedPairs([]);
    setDescription("");
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

  const handleSave = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Series code is required");
      return;
    }
    if (selectedPairs.length === 0) {
      setError("Select at least one finish–size pair");
      return;
    }
    const duplicate = seriesList.some(
      (s) => s.id !== editing?.id && s.code.toUpperCase() === trimmed,
    );
    if (duplicate) {
      setError("A series with this code already exists");
      return;
    }

    if (editing) {
      updateSeries(editing.id, {
        code: trimmed,
        finishSizePairs: selectedPairs,
        description: description || undefined,
      });
      toast.success("Series updated");
    } else {
      addSeries(trimmed, selectedPairs, description || undefined);
      toast.success("Series added");
    }
    closeDialog();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSeries(deleteTarget.id);
    toast.success(`Deleted series ${deleteTarget.code}`);
    setDeleteTarget(null);
  };

  const pairsByFinish = useMemo(() => {
    const grouped = new Map<string, FinishSizePair[]>();
    for (const pair of availablePairs) {
      const list = grouped.get(pair.finishId) ?? [];
      list.push(pair);
      grouped.set(pair.finishId, list);
    }
    return grouped;
  }, [availablePairs]);

  return (
    <div className="page-enter space-y-6">
      <div className="card p-6">
        <Toolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search series…"
          addLabel="Add Series"
          onAdd={openAdd}
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No series yet"
            description="Series group SKUs under finish–size combinations."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-nl-200">
            <table className="w-full text-sm">
              <thead className="bg-nl-50 text-left text-xs font-semibold text-nl-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Series Code</th>
                  <th className="px-4 py-3">Finish – Size Pairs</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nl-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-nl-50/60">
                    <td className="px-4 py-3 font-semibold text-nl-900">
                      {s.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.finishSizePairs.length === 0 ? (
                          <span className="text-xs text-nl-400">—</span>
                        ) : (
                          s.finishSizePairs.map((p) => (
                            <span
                              key={pairKey(p)}
                              className="rounded-md bg-nl-100 px-2 py-0.5 text-[11px] font-medium text-nl-600"
                            >
                              {finishMap[p.finishId]?.name ?? "?"} /{" "}
                              {(sizeMap[p.sizeId] ?? "?").replace("x", "×")}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nl-500">
                      {s.description || <span className="text-nl-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        active={s.active}
                        label={s.code}
                        onToggle={() => updateSeries(s.id, { active: !s.active })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RowActions
                          onEdit={() => openEdit(s)}
                          onDelete={() => setDeleteTarget(s)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={adding || editing !== null}
        onClose={closeDialog}
        title={editing ? "Edit Series" : "Add Series"}
        subtitle="Assign the series to finish–size combinations"
        primaryAction={{
          label: editing ? "Save" : "Add Series",
          onClick: handleSave,
          disabled: code.trim() === "" || selectedPairs.length === 0,
        }}
        secondaryAction={{ label: "Cancel", onClick: closeDialog }}
      >
        <div className="space-y-4">
          <Input
            label="Series code"
            placeholder="e.g. GL"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError("");
            }}
            autoFocus
          />

          <Input
            label="Description (optional)"
            placeholder="e.g. Glamour line"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-nl-700">
              Finish – Size Pairs
            </label>
            {availablePairs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-nl-200 p-3 text-xs text-nl-500">
                No finish–size pairs available — add finishes with sizes first.
              </p>
            ) : (
              <div className="max-h-48 space-y-3 overflow-y-auto">
                {Array.from(pairsByFinish.entries()).map(([finishId, pairs]) => (
                  <div key={finishId}>
                    <div className="mb-1.5 text-[11px] font-semibold text-nl-500 uppercase">
                      {finishMap[finishId]?.name ?? finishId}
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
            )}
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete series?"
        message={`This will also remove all design codes under "${deleteTarget?.code}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default SeriesPage;
