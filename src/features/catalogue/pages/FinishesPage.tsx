import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useCatalogueStore } from "../store";
import type { Finish } from "../types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import ToggleSwitch from "../components/ToggleSwitch";
import Dialog from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";

const FinishesPage: React.FC = () => {
  const finishes = useCatalogueStore((s) => s.finishes);
  const sizes = useCatalogueStore((s) => s.sizes);
  const addFinish = useCatalogueStore((s) => s.addFinish);
  const updateFinish = useCatalogueStore((s) => s.updateFinish);
  const deleteFinish = useCatalogueStore((s) => s.deleteFinish);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Finish | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Finish | null>(null);

  const [name, setName] = useState("");
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  const sizeMap = useMemo(
    () => Object.fromEntries(sizes.map((s) => [s.id, s.label])),
    [sizes],
  );

  const filtered = useMemo(
    () =>
      finishes.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [finishes, search],
  );

  const openAdd = () => {
    setAdding(true);
    setName("");
    setSelectedSizeIds([]);
    setError("");
  };

  const openEdit = (f: Finish) => {
    setEditing(f);
    setName(f.name);
    setSelectedSizeIds(f.sizeIds);
    setError("");
  };

  const closeDialog = () => {
    setAdding(false);
    setEditing(null);
    setName("");
    setSelectedSizeIds([]);
    setError("");
  };

  const toggleSize = (id: string) => {
    setSelectedSizeIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Finish name is required");
      return;
    }
    const duplicate = finishes.some(
      (f) =>
        f.id !== editing?.id &&
        f.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setError("A finish with this name already exists");
      return;
    }
    if (selectedSizeIds.length === 0) {
      setError("Select at least one size for this finish");
      return;
    }

    if (editing) {
      updateFinish(editing.id, { name: trimmed, sizeIds: selectedSizeIds });
      toast.success("Finish updated");
    } else {
      addFinish(trimmed, selectedSizeIds);
      toast.success("Finish added");
    }
    closeDialog();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFinish(deleteTarget.id);
    toast.success(`Deleted ${deleteTarget.name}`);
    setDeleteTarget(null);
  };

  return (
    <div className="page-enter space-y-6">
      <div className="card p-6">
        <Toolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search finishes…"
          addLabel="Add Finish"
          onAdd={openAdd}
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No finishes yet"
            description="Add a finish and link it to the sizes it applies to."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-nl-200">
            <table className="w-full text-sm">
              <thead className="bg-nl-50 text-left text-xs font-semibold text-nl-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Finish</th>
                  <th className="px-4 py-3">Available Sizes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nl-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-nl-50/60">
                    <td className="px-4 py-3 font-medium text-nl-900">
                      {f.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {f.sizeIds.length === 0 ? (
                          <span className="text-xs text-nl-400">—</span>
                        ) : (
                          f.sizeIds.map((sid) => (
                            <span
                              key={sid}
                              className="rounded-md bg-nl-100 px-2 py-0.5 text-[11px] font-medium text-nl-600"
                            >
                              {(sizeMap[sid] ?? "?").replace("x", "×")}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        active={f.active}
                        label={f.name}
                        onToggle={() => updateFinish(f.id, { active: !f.active })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RowActions
                          onEdit={() => openEdit(f)}
                          onDelete={() => setDeleteTarget(f)}
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
        title={editing ? "Edit Finish" : "Add Finish"}
        subtitle="Name the finish and select the sizes it is available in"
        primaryAction={{
          label: editing ? "Save" : "Add Finish",
          onClick: handleSave,
          disabled: name.trim() === "" || selectedSizeIds.length === 0,
        }}
        secondaryAction={{ label: "Cancel", onClick: closeDialog }}
      >
        <div className="space-y-4">
          <Input
            label="Finish name"
            placeholder="e.g. Glossy"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            error={error}
            autoFocus
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-nl-700">
              Available in sizes
            </label>
            {sizes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-nl-200 p-3 text-xs text-nl-500">
                No sizes yet — add sizes first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const selected = selectedSizeIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSize(s.id)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                        selected
                          ? "border-pl-500 bg-pl-500 text-white"
                          : "border-nl-200 bg-white text-nl-700 hover:border-pl-400 hover:bg-pl-50",
                      )}
                    >
                      {selected && <Check size={12} strokeWidth={3} />}
                      {s.label.replace("x", "×")}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete finish?"
        message={`This will also remove all series and design codes under "${deleteTarget?.name}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default FinishesPage;
