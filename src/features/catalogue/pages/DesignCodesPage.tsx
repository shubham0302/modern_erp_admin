import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { approveDesign, listDesigns, listSeries, rejectDesign } from "../api";
import type { Design, DesignStatus, Series } from "../types";
import type { ApiError } from "@/lib/api/types";
import EmptyState from "../components/EmptyState";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";

const apiErrorMessage = (err: unknown, fallback: string): string =>
  (axios.isAxiosError(err) &&
    (err.response?.data as ApiError | undefined)?.error?.message) ||
  fallback;

const formatDateTime = (iso: string) => {
  if (!iso) return "—";
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

const STATUS_PILL: Record<DesignStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

const STATUS_LABEL: Record<DesignStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const DesignCodesPage: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [actionTarget, setActionTarget] = useState<{
    design: Design;
    action: "approve" | "reject";
  } | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([listDesigns(), listSeries()])
      .then(([designsRes, seriesRes]) => {
        if (cancelled) return;
        setDesigns(designsRes.data);
        setSeriesList(seriesRes.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(apiErrorMessage(err, "Failed to load designs"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    return designs.filter((d) => {
      if (seriesFilter && d.series.id !== seriesFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.series.name.toLowerCase().includes(q)
      );
    });
  }, [designs, search, seriesFilter]);

  const openActionDialog = (design: Design, action: "approve" | "reject") => {
    setActionTarget({ design, action });
    setReason("");
    setReasonError("");
  };

  const closeActionDialog = () => {
    if (submittingAction) return;
    setActionTarget(null);
    setReason("");
    setReasonError("");
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    const trimmed = reason.trim();
    if (actionTarget.action === "reject" && !trimmed) {
      setReasonError("Reason is required");
      return;
    }
    setSubmittingAction(true);
    try {
      if (actionTarget.action === "approve") {
        await approveDesign(actionTarget.design.id);
        toast.success(`${actionTarget.design.name} approved`);
      } else {
        await rejectDesign(actionTarget.design.id, trimmed);
        toast.success(`${actionTarget.design.name} rejected`);
      }
      const res = await listDesigns();
      setDesigns(res.data);
      setActionTarget(null);
      setReason("");
      setReasonError("");
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          actionTarget.action === "approve"
            ? "Failed to approve design"
            : "Failed to reject design",
        ),
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  const seriesFilterLabel =
    seriesList.find((s) => s.id === seriesFilter)?.name ?? "All Series";

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
              <span className="truncate">{seriesFilterLabel}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-nl-400 transition-transform duration-200",
                  dropdownOpen && "rotate-180",
                )}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-nl-200 bg-white py-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setSeriesFilter("");
                    setDropdownOpen(false);
                  }}
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
                    onClick={() => {
                      setSeriesFilter(s.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm transition-colors",
                      seriesFilter === s.id
                        ? "bg-pl-50 font-medium text-pl-700"
                        : "text-nl-700 hover:bg-nl-50",
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-7 animate-spin rounded-full border-2 border-nl-200 border-t-pl-500" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No design codes"
            description="Design codes represent individual SKUs under a series."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-nl-200">
            <table className="w-full text-sm">
              <thead className="bg-nl-50 text-left text-xs font-semibold text-nl-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Design</th>
                  <th className="px-4 py-3">Series</th>
                  <th className="px-4 py-3">Applicable Pairs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nl-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-nl-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-nl-100 to-nl-200 text-[11px] font-bold text-nl-500">
                          {d.thumbnailUrl ? (
                            <img
                              src={d.thumbnailUrl}
                              alt={d.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            d.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="font-semibold text-nl-900">
                          {d.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nl-600">{d.series.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {d.sizeFinishes.length === 0 ? (
                          <span className="text-xs text-nl-400">—</span>
                        ) : (
                          d.sizeFinishes.map((sf) => (
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
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          STATUS_PILL[d.status],
                        )}
                      >
                        {STATUS_LABEL[d.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-nl-500">
                      {formatDateTime(d.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-nl-700">
                      {d.updatedByName ?? (
                        <span className="text-nl-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {d.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openActionDialog(d, "approve")}
                              className="rounded-lg p-2 text-nl-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                              title="Approve"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openActionDialog(d, "reject")}
                              className="rounded-lg p-2 text-nl-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              title="Reject"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
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
        open={actionTarget !== null}
        onClose={closeActionDialog}
        title={
          actionTarget?.action === "approve"
            ? "Approve design?"
            : "Reject design?"
        }
        subtitle={
          actionTarget
            ? actionTarget.action === "approve"
              ? `Approve "${actionTarget.design.name}".`
              : `Reject "${actionTarget.design.name}". Provide a reason below.`
            : undefined
        }
        primaryAction={{
          label: submittingAction
            ? actionTarget?.action === "approve"
              ? "Approving…"
              : "Rejecting…"
            : actionTarget?.action === "approve"
              ? "Approve"
              : "Reject",
          onClick: handleConfirmAction,
          disabled:
            submittingAction ||
            (actionTarget?.action === "reject" && reason.trim() === ""),
          loading: submittingAction,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: closeActionDialog,
          disabled: submittingAction,
        }}
        destructive={actionTarget?.action === "reject"}
      >
        {actionTarget?.action === "reject" ? (
          <Input
            label="Reason"
            placeholder="e.g. Thumbnail not provided"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError) setReasonError("");
            }}
            error={reasonError}
            autoFocus
          />
        ) : (
          <p className="text-sm text-nl-600">
            Are you sure you want to approve this design?
          </p>
        )}
      </Dialog>
    </div>
  );
};

export default DesignCodesPage;
