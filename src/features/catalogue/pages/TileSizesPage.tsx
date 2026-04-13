import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCatalogueStore } from "../store";
import type { TileSize } from "../types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import ToggleSwitch from "../components/ToggleSwitch";
import Dialog from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";

const TileSizesPage: React.FC = () => {
  const sizes = useCatalogueStore((s) => s.sizes);
  const addSize = useCatalogueStore((s) => s.addSize);
  const updateSize = useCatalogueStore((s) => s.updateSize);
  const deleteSize = useCatalogueStore((s) => s.deleteSize);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TileSize | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TileSize | null>(null);

  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      sizes.filter((s) => s.label.toLowerCase().includes(search.toLowerCase())),
    [sizes, search],
  );

  const openAdd = () => {
    setAdding(true);
    setLabel("");
    setError("");
  };

  const openEdit = (s: TileSize) => {
    setEditing(s);
    setLabel(s.label);
    setError("");
  };

  const closeDialog = () => {
    setAdding(false);
    setEditing(null);
    setLabel("");
    setError("");
  };

  const handleSave = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Size label is required");
      return;
    }
    const duplicate = sizes.some(
      (s) =>
        s.id !== editing?.id &&
        s.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setError("A size with this label already exists");
      return;
    }

    if (editing) {
      updateSize(editing.id, { label: trimmed });
      toast.success("Size updated");
    } else {
      addSize(trimmed);
      toast.success("Size added");
    }
    closeDialog();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSize(deleteTarget.id);
    toast.success(`Deleted ${deleteTarget.label}`);
    setDeleteTarget(null);
  };

  return (
    <div className="page-enter space-y-6">
      <div className="card p-6">
        <Toolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search sizes…"
          addLabel="Add Size"
          onAdd={openAdd}
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No sizes found"
            description="Add your first tile size to get started."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-nl-200">
            <table className="w-full text-sm">
              <thead className="bg-nl-50 text-left text-xs font-semibold text-nl-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nl-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-nl-50/60">
                    <td className="px-4 py-3 font-medium text-nl-900">
                      {s.label.replace("x", "×")}
                    </td>
                    <td className="px-4 py-3 text-nl-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        active={s.active}
                        label={s.label}
                        onToggle={() => updateSize(s.id, { active: !s.active })}
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
        title={editing ? "Edit Tile Size" : "Add Tile Size"}
        subtitle="Enter a label for the tile size"
        primaryAction={{
          label: editing ? "Save" : "Add Size",
          onClick: handleSave,
          disabled: label.trim() === "",
        }}
        secondaryAction={{ label: "Cancel", onClick: closeDialog }}
      >
        <Input
          label="Size label"
          placeholder="e.g. 60x60"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            if (error) setError("");
          }}
          error={error}
          autoFocus
        />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete tile size?"
        message={`This will remove "${deleteTarget?.label}" and unlink it from any finishes.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TileSizesPage;
