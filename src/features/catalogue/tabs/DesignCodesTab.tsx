import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCatalogueStore } from "../store";
import type { LegacyDesignCode as DesignCode } from "../types";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import RowActions from "../components/RowActions";
import StatusPill from "../components/StatusPill";
import Dialog from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";

const DesignCodesTab: React.FC = () => {
  const designCodes = useCatalogueStore((s) => s.designCodes);
  const seriesList = useCatalogueStore((s) => s.series);
  const finishes = useCatalogueStore((s) => s.finishes);
  const addDesignCode = useCatalogueStore((s) => s.addDesignCode);
  const updateDesignCode = useCatalogueStore((s) => s.updateDesignCode);
  const deleteDesignCode = useCatalogueStore((s) => s.deleteDesignCode);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DesignCode | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DesignCode | null>(null);
  const [seriesFilter, setSeriesFilter] = useState<string>("");

  const [code, setCode] = useState("");
  const [seriesId, setSeriesId] = useState("");
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
    setThumbnailUrl("");
    setError("");
  };

  const openEdit = (d: DesignCode) => {
    setEditing(d);
    setCode(d.code);
    setSeriesId(d.seriesId);
    setThumbnailUrl(d.thumbnailUrl ?? "");
    setError("");
  };

  const closeDialog = () => {
    setAdding(false);
    setEditing(null);
    setCode("");
    setSeriesId("");
    setThumbnailUrl("");
    setError("");
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
        thumbnailUrl: thumbnailUrl || undefined,
      });
      toast.success("Design code updated");
    } else {
      const parentSeries = seriesList.find((s) => s.id === seriesId);
      addDesignCode(trimmed, seriesId, parentSeries?.finishSizePairs ?? [], thumbnailUrl || undefined);
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

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Toolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search design codes…"
          addLabel="Add Design Code"
          onAdd={openAdd}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-nl-500">Filter by series:</span>
        <button
          onClick={() => setSeriesFilter("")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            seriesFilter === ""
              ? "bg-pl-600 text-white"
              : "bg-nl-100 text-nl-600 hover:bg-nl-200"
          }`}
        >
          All
        </button>
        {seriesList.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeriesFilter(s.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              seriesFilter === s.id
                ? "bg-pl-600 text-white"
                : "bg-nl-100 text-nl-600 hover:bg-nl-200"
            }`}
          >
            {s.code}
          </button>
        ))}
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
                <th className="px-4 py-3">Finish</th>
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
                    <td className="px-4 py-3 text-nl-600">
                      {sr
                        ? [...new Set(sr.finishSizePairs.map((p) => p.finishId))]
                            .map((fid) => finishMap[fid] ?? "?")
                            .join(", ") || "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        active={d.active}
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

      <Dialog
        open={adding || editing !== null}
        onClose={closeDialog}
        title={editing ? "Edit Design Code" : "Add Design Code"}
        subtitle="Link the SKU code to a series"
        primaryAction={{
          label: editing ? "Save" : "Add Design Code",
          onClick: handleSave,
          disabled: code.trim() === "" || !seriesId,
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
              onChange={(e) => setSeriesId(e.target.value)}
              className="h-10 w-full rounded-xl border border-nl-200 bg-white px-3 text-sm text-nl-900 focus:border-pl-500 focus:ring-2 focus:ring-pl-500/30 focus:outline-none"
            >
              {seriesList.length === 0 && <option value="">No series available</option>}
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {[...new Set(s.finishSizePairs.map((p) => p.finishId))].map((fid) => finishMap[fid] ?? "?").join(", ")}
                </option>
              ))}
            </select>
          </div>

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
    </>
  );
};

export default DesignCodesTab;
