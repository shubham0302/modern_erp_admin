import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  createSize,
  deleteSize,
  listSizes,
  restoreSize,
  updateSize,
} from "../api";
import type { Size } from "../types";
import type { ApiError } from "@/lib/api/types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import ToggleSwitch from "../components/ToggleSwitch";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const apiErrorMessage = (err: unknown, fallback: string): string =>
  (axios.isAxiosError(err) &&
    (err.response?.data as ApiError | undefined)?.error?.message) ||
  fallback;

const TileSizesPage: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Size | null>(null);
  const [adding, setAdding] = useState(false);

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listSizes()
      .then((res) => {
        if (cancelled) return;
        setSizes(res.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(apiErrorMessage(err, "Failed to load sizes"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      sizes.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [sizes, search],
  );

  const openAdd = () => {
    setAdding(true);
    setName("");
    setError("");
  };

  const openEdit = (s: Size) => {
    setEditing(s);
    setName(s.name);
    setError("");
  };

  const closeDialog = () => {
    setAdding(false);
    setEditing(null);
    setName("");
    setError("");
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Size name is required");
      return;
    }
    const duplicate = sizes.some(
      (s) =>
        s.id !== editing?.id &&
        s.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setError("A size with this name already exists");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateSize(editing.id, { name: trimmed });
        toast.success("Size updated");
      } else {
        await createSize({ name: trimmed });
        toast.success("Size added");
      }
      const res = await listSizes();
      setSizes(res.data);
      closeDialog();
    } catch (err) {
      toast.error(
        apiErrorMessage(err, editing ? "Failed to update size" : "Failed to add size"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !saving && name.trim()) {
      e.preventDefault();
      void handleSave();
    }
  };

  const handleToggle = async (s: Size) => {
    try {
      if (s.isActive) {
        await deleteSize(s.id);
        toast.success(`Deactivated ${s.name}`);
      } else {
        await restoreSize(s.id);
        toast.success(`Activated ${s.name}`);
      }
      const res = await listSizes();
      setSizes(res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update status"));
      throw err;
    }
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

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-7 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
          </div>
        ) : filtered.length === 0 ? (
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
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Updated By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nl-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-nl-50/60">
                    <td className="px-4 py-3 font-medium text-nl-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-nl-500">
                      {formatDateTime(s.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-nl-500">
                      {formatDateTime(s.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-nl-700">
                      {s.updatedByName ?? (
                        <span className="text-nl-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        active={s.isActive}
                        label={s.name}
                        onToggle={() => handleToggle(s)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RowActions onEdit={() => openEdit(s)} />
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
        subtitle="Enter a name for the tile size"
        primaryAction={{
          label: saving
            ? editing
              ? "Saving…"
              : "Adding…"
            : editing
              ? "Save"
              : "Add Size",
          onClick: handleSave,
          disabled: name.trim() === "" || saving,
        }}
        secondaryAction={{ label: "Cancel", onClick: closeDialog }}
      >
        <Input
          label="Size name"
          placeholder="e.g. 60 x 60"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          error={error}
          autoFocus
        />
      </Dialog>
    </div>
  );
};

export default TileSizesPage;
