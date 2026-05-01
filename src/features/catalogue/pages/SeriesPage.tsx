import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  createSeries,
  deleteSeries,
  listSeries,
  listSizeFinishes,
  restoreSeries,
  updateSeries,
} from "../api";
import type { FinishSizePair, Series, SizeFinish } from "../types";
import type { ApiError } from "@/lib/api/types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import ToggleSwitch from "../components/ToggleSwitch";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";

const pairKey = (p: FinishSizePair) => `${p.finishId}::${p.sizeId}`;

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

const SeriesPage: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Series | null>(null);
  const [adding, setAdding] = useState(false);

  const [name, setName] = useState("");
  const [selectedPairs, setSelectedPairs] = useState<FinishSizePair[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [sizeFinishes, setSizeFinishes] = useState<SizeFinish[]>([]);
  const [loadingPairs, setLoadingPairs] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadingPairs(true);
    Promise.all([listSeries(), listSizeFinishes(true)])
      .then(([seriesRes, sizeFinishesRes]) => {
        if (cancelled) return;
        setSeriesList(seriesRes.data);
        setSizeFinishes(sizeFinishesRes);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(apiErrorMessage(err, "Failed to load series"));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadingPairs(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pairsByFinish = useMemo(() => {
    const grouped = new Map<
      string,
      { finishName: string; pairs: SizeFinish[] }
    >();
    for (const sf of sizeFinishes) {
      const entry = grouped.get(sf.finish.id);
      if (entry) {
        entry.pairs.push(sf);
      } else {
        grouped.set(sf.finish.id, { finishName: sf.finish.name, pairs: [sf] });
      }
    }
    return grouped;
  }, [sizeFinishes]);

  const selectedKeys = useMemo(
    () => new Set(selectedPairs.map(pairKey)),
    [selectedPairs],
  );

  const filtered = useMemo(
    () =>
      seriesList.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [seriesList, search],
  );

  const openAdd = () => {
    setAdding(true);
    setName("");
    setSelectedPairs([]);
    setError("");
  };

  const openEdit = (s: Series) => {
    setEditing(s);
    setName(s.name);
    setSelectedPairs(
      s.sizeFinishes.map((sf) => ({
        finishId: sf.finish.id,
        sizeId: sf.size.id,
      })),
    );
    setError("");
  };

  const closeDialog = () => {
    if (saving) return;
    setAdding(false);
    setEditing(null);
    setName("");
    setSelectedPairs([]);
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

  const handleSave = async () => {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      setError("Series name is required");
      return;
    }
    if (selectedPairs.length === 0) {
      setError("Select at least one finish–size pair");
      return;
    }
    const duplicate = seriesList.some(
      (s) => s.id !== editing?.id && s.name.toUpperCase() === trimmed,
    );
    if (duplicate) {
      setError("A series with this name already exists");
      return;
    }

    const sizeFinishIds: string[] = [];
    for (const pair of selectedPairs) {
      const sf = sizeFinishes.find(
        (x) => x.finish.id === pair.finishId && x.size.id === pair.sizeId,
      );
      if (sf) sizeFinishIds.push(sf.id);
    }
    if (sizeFinishIds.length === 0) {
      setError("Selected pairs no longer match any active finish-size pair");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const previousIds = editing.sizeFinishes.map((sf) => sf.id);
        const deletedSizeFinishIds = previousIds.filter(
          (id) => !sizeFinishIds.includes(id),
        );
        await updateSeries(editing.id, {
          name: trimmed,
          sizeFinishIds,
          deletedSizeFinishIds,
        });
        toast.success("Series updated");
      } else {
        await createSeries({ name: trimmed, sizeFinishIds });
        toast.success("Series added");
      }
      const res = await listSeries();
      setSeriesList(res.data);
      closeDialog();
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          editing ? "Failed to update series" : "Failed to add series",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (s: Series) => {
    try {
      if (s.isActive) {
        await deleteSeries(s.id);
        toast.success(`Deactivated ${s.name}`);
      } else {
        await restoreSeries(s.id);
        toast.success(`Activated ${s.name}`);
      }
      const res = await listSeries();
      setSeriesList(res.data);
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
          placeholder="Search series…"
          addLabel="Add Series"
          onAdd={openAdd}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-7 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No series yet"
            description="Series group SKUs under finish–size combinations."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-nl-200">
            <table className="w-full text-sm">
              <thead className="bg-nl-50 text-left text-xs font-semibold text-nl-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Series</th>
                  <th className="px-4 py-3">Finish – Size Pairs</th>
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
                    <td className="px-4 py-3 font-semibold text-nl-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.sizeFinishes.length === 0 ? (
                          <span className="text-xs text-nl-400">—</span>
                        ) : (
                          s.sizeFinishes.map((sf) => (
                            <span
                              key={sf.id}
                              className="rounded-md bg-nl-100 px-2 py-0.5 text-[11px] font-medium text-nl-600"
                            >
                              {sf.finish.name} / {sf.size.name}
                            </span>
                          ))
                        )}
                      </div>
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
        title={editing ? "Edit Series" : "Add Series"}
        subtitle="Assign the series to finish–size combinations"
        primaryAction={{
          label: saving
            ? editing
              ? "Saving…"
              : "Adding…"
            : editing
              ? "Save"
              : "Add Series",
          onClick: handleSave,
          disabled:
            name.trim() === "" || selectedPairs.length === 0 || saving,
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
            label="Series name"
            placeholder="e.g. GL"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            autoFocus
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-nl-700">
              Finish – Size Pairs
            </label>
            {loadingPairs ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
              </div>
            ) : sizeFinishes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-nl-200 p-3 text-xs text-nl-500">
                No finish–size pairs available — add finishes with sizes first.
              </p>
            ) : (
              <div className="max-h-48 space-y-3 overflow-y-auto">
                {Array.from(pairsByFinish.entries()).map(
                  ([finishId, { finishName, pairs }]) => (
                    <div key={finishId}>
                      <div className="mb-1.5 text-[11px] font-semibold text-nl-500 uppercase">
                        {finishName}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pairs.map((sf) => {
                          const pair: FinishSizePair = {
                            finishId,
                            sizeId: sf.size.id,
                          };
                          const selected = selectedKeys.has(pairKey(pair));
                          return (
                            <button
                              key={sf.id}
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
                              {sf.size.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </Dialog>
    </div>
  );
};

export default SeriesPage;
