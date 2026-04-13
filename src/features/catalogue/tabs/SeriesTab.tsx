import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCatalogueStore } from "../store";
import type { Series } from "../types";
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
  const addSeries = useCatalogueStore((s) => s.addSeries);
  const updateSeries = useCatalogueStore((s) => s.updateSeries);
  const deleteSeries = useCatalogueStore((s) => s.deleteSeries);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Series | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Series | null>(null);

  const [code, setCode] = useState("");
  const [finishId, setFinishId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const finishMap = useMemo(
    () => Object.fromEntries(finishes.map((f) => [f.id, f.name])),
    [finishes],
  );

  const filtered = useMemo(
    () =>
      seriesList.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.code.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q) ||
          (finishMap[s.finishId] ?? "").toLowerCase().includes(q)
        );
      }),
    [seriesList, search, finishMap],
  );

  const openAdd = () => {
    if (finishes.length === 0) {
      toast.error("Add a finish first before creating a series");
      return;
    }
    setAdding(true);
    setCode("");
    setFinishId(finishes[0]?.id ?? "");
    setDescription("");
    setError("");
  };

  const openEdit = (s: Series) => {
    setEditing(s);
    setCode(s.code);
    setFinishId(s.finishId);
    setDescription(s.description ?? "");
    setError("");
  };

  const closeDialog = () => {
    setAdding(false);
    setEditing(null);
    setCode("");
    setFinishId("");
    setDescription("");
    setError("");
  };

  const handleSave = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Series code is required");
      return;
    }
    if (!finishId) {
      setError("Select a parent finish");
      return;
    }
    const duplicate = seriesList.some(
      (s) =>
        s.id !== editing?.id &&
        s.finishId === finishId &&
        s.code.toUpperCase() === trimmed,
    );
    if (duplicate) {
      setError("A series with this code already exists under the selected finish");
      return;
    }

    if (editing) {
      updateSeries(editing.id, { code: trimmed, finishId, description });
      toast.success("Series updated");
    } else {
      addSeries(trimmed, finishId, description || undefined);
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
                <th className="px-4 py-3">Finish</th>
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
                    {finishMap[s.finishId] ?? "—"}
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
        subtitle="Link a series code to a parent finish"
        primaryAction={{
          label: editing ? "Save" : "Add Series",
          onClick: handleSave,
          disabled: code.trim() === "" || !finishId,
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
              Parent finish
            </label>
            <select
              value={finishId}
              onChange={(e) => setFinishId(e.target.value)}
              className="h-10 w-full rounded-xl border border-nl-200 bg-white px-3 text-sm text-nl-900 focus:border-pl-500 focus:ring-2 focus:ring-pl-500/30 focus:outline-none"
            >
              {finishes.length === 0 && <option value="">No finishes available</option>}
              {finishes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
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
