import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCatalogueStore } from "../store";
import type { FinishSizePair, Series } from "../types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import StatusPill from "../components/StatusPill";
import Dialog from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";

const SeriesTab: React.FC = () => {
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
    () => Object.fromEntries(finishes.map((f) => [f.id, f.name])),
    [finishes],
  );
  const sizeMap = useMemo(
    () => Object.fromEntries(sizes.map((s) => [s.id, s.label])),
    [sizes],
  );

  const getFinishNames = (pairs: FinishSizePair[]) => {
    const uniqueFinishIds = [...new Set(pairs.map((p) => p.finishId))];
    return uniqueFinishIds.map((id) => finishMap[id] ?? "?").join(", ");
  };

  const filtered = useMemo(
    () =>
      seriesList.filter((s) => {
        const q = search.toLowerCase();
        const finishNames = getFinishNames(s.finishSizePairs);
        return (
          s.code.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q) ||
          finishNames.toLowerCase().includes(q)
        );
      }),
    [seriesList, search, finishMap],
  );

  const hasPair = (finishId: string, sizeId: string) =>
    selectedPairs.some((p) => p.finishId === finishId && p.sizeId === sizeId);

  const togglePair = (finishId: string, sizeId: string) => {
    setSelectedPairs((prev) =>
      hasPair(finishId, sizeId)
        ? prev.filter((p) => !(p.finishId === finishId && p.sizeId === sizeId))
        : [...prev, { finishId, sizeId }],
    );
    if (error) setError("");
  };

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
    setSelectedPairs([...s.finishSizePairs]);
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
        description,
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

  return (
    <>
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
          description="Series group SKUs under a finish (e.g. GL, EL, SF)."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-nl-200">
          <table className="w-full text-sm">
            <thead className="bg-nl-50 text-left text-xs font-semibold text-nl-500 uppercase">
              <tr>
                <th className="px-4 py-3">Series Code</th>
                <th className="px-4 py-3">Finish–Size Pairs</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nl-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-nl-50/60">
                  <td className="px-4 py-3 font-semibold text-nl-900">{s.code}</td>
                  <td className="px-4 py-3 text-nl-600">
                    {s.finishSizePairs.length === 0
                      ? "—"
                      : s.finishSizePairs.map((p, i) => (
                          <span key={i}>
                            {finishMap[p.finishId] ?? "?"} / {sizeMap[p.sizeId] ?? "?"}
                            {i < s.finishSizePairs.length - 1 ? ", " : ""}
                          </span>
                        ))}
                  </td>
                  <td className="px-4 py-3 text-nl-500">
                    {s.description || <span className="text-nl-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      active={s.active}
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

      <Dialog
        open={adding || editing !== null}
        onClose={closeDialog}
        title={editing ? "Edit Series" : "Add Series"}
        subtitle="Link a series code to finish–size pairs"
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

          <div>
            <label className="mb-1.5 block text-xs font-medium text-nl-700">
              Finish–Size Pairs
            </label>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-nl-200 bg-white p-3">
              {finishes.length === 0 ? (
                <p className="text-xs text-nl-400">No finishes available</p>
              ) : (
                finishes.map((f) =>
                  f.sizeIds.map((sizeId) => (
                    <label
                      key={`${f.id}-${sizeId}`}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-nl-700 hover:bg-nl-50"
                    >
                      <input
                        type="checkbox"
                        checked={hasPair(f.id, sizeId)}
                        onChange={() => togglePair(f.id, sizeId)}
                        className="accent-pl-600"
                      />
                      {f.name} / {sizeMap[sizeId] ?? sizeId}
                    </label>
                  )),
                )
              )}
            </div>
          </div>

          <Input
            label="Description (optional)"
            placeholder="e.g. Glamour line"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

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
    </>
  );
};

export default SeriesTab;
