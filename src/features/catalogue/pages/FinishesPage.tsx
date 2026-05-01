import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  createFinish,
  deleteFinish,
  listActiveSizes,
  listFinishes,
  restoreFinish,
  updateFinish,
} from "../api";
import type { Finish, Size } from "../types";
import type { ApiError } from "@/lib/api/types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import ToggleSwitch from "../components/ToggleSwitch";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";

const apiErrorMessage = (err: unknown, fallback: string): string =>
  (axios.isAxiosError(err) &&
    (err.response?.data as ApiError | undefined)?.error?.message) ||
  fallback;

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

const FinishesPage: React.FC = () => {
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [activeSizes, setActiveSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Finish | null>(null);
  const [adding, setAdding] = useState(false);

  const [name, setName] = useState("");
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([listFinishes(), listActiveSizes()])
      .then(([finishesRes, sizesRes]) => {
        if (cancelled) return;
        setFinishes(finishesRes.data);
        setActiveSizes(sizesRes);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(apiErrorMessage(err, "Failed to load finishes"));
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
    setSelectedSizeIds(f.sizes.map((s) => s.id));
    setError("");
  };

  const closeDialog = () => {
    if (saving) return;
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

  const handleSave = async () => {
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

    setSaving(true);
    try {
      if (editing) {
        const previousSizeIds = editing.sizes.map((s) => s.id);
        const deletedSizeIds = previousSizeIds.filter(
          (id) => !selectedSizeIds.includes(id),
        );
        await updateFinish(editing.id, {
          name: trimmed,
          sizeIds: selectedSizeIds,
          deletedSizeIds,
        });
        toast.success("Finish updated");
      } else {
        await createFinish({ name: trimmed, sizeIds: selectedSizeIds });
        toast.success("Finish added");
      }
      const res = await listFinishes();
      setFinishes(res.data);
      closeDialog();
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          editing ? "Failed to update finish" : "Failed to add finish",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (f: Finish) => {
    try {
      if (f.isActive) {
        await deleteFinish(f.id);
        toast.success(`Deactivated ${f.name}`);
      } else {
        await restoreFinish(f.id);
        toast.success(`Activated ${f.name}`);
      }
      const res = await listFinishes();
      setFinishes(res.data);
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
          placeholder="Search finishes…"
          addLabel="Add Finish"
          onAdd={openAdd}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-7 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
          </div>
        ) : filtered.length === 0 ? (
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
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Updated By</th>
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
                        {f.sizes.length === 0 ? (
                          <span className="text-xs text-nl-400">—</span>
                        ) : (
                          f.sizes.map((s) => (
                            <span
                              key={s.id}
                              className="rounded-md bg-nl-100 px-2 py-0.5 text-[11px] font-medium text-nl-600"
                            >
                              {s.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nl-500">
                      {formatDateTime(f.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-nl-500">
                      {formatDateTime(f.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-nl-700">
                      {f.updatedByName ?? (
                        <span className="text-nl-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        active={f.isActive}
                        label={f.name}
                        onToggle={() => handleToggle(f)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RowActions onEdit={() => openEdit(f)} />
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
          label: saving
            ? editing
              ? "Saving…"
              : "Adding…"
            : editing
              ? "Save"
              : "Add Finish",
          onClick: handleSave,
          disabled:
            name.trim() === "" || selectedSizeIds.length === 0 || saving,
          loading: saving,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: closeDialog,
          disabled: saving,
        }}
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
            {activeSizes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-nl-200 p-3 text-xs text-nl-500">
                No active sizes yet — add sizes first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeSizes.map((s) => {
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
                      {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default FinishesPage;
