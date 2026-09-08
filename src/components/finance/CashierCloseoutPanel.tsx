"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  Printer,
  Lock,
  Banknote,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  History,
  ShieldCheck,
} from "lucide-react";
import { financeApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Textarea } from "@/components/ui";

const NOTES = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1] as const;

const STATUS_TONE: Record<string, "gold" | "info" | "success" | "danger"> = {
  SEALED: "gold",
  DEPOSITED: "info",
  VERIFIED: "success",
  REJECTED: "danger",
};

const taka = (n: number | undefined | null) =>
  `৳${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const dhakaToday = () => new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10);

const errMsg = (e: any) => e?.response?.data?.message || e?.message || "Request failed";

/** Opens a print-ready, 2-copy bank deposit slip for a sealed bag */
function printDepositSlip(c: any) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  const rows = (c.denominations || [])
    .map(
      (d: any) =>
        `<tr><td>৳${d.note}</td><td style="text-align:right">${d.count}</td><td style="text-align:right">৳${(d.note * d.count).toLocaleString("en-IN")}</td></tr>`
    )
    .join("");
  const copy = (label: string) => `
    <section class="slip">
      <header><h2>Bank Deposit Slip — ${label}</h2><span>${c.closeoutNumber}</span></header>
      <p><b>Business date:</b> ${c.businessDate} &nbsp; <b>Bag no:</b> ${c.bagNumber} &nbsp; <b>Seal:</b> ${c.sealToken}</p>
      <p><b>Cashier:</b> ${c.cashier?.name || c.cashier?.email || "—"}</p>
      <table><thead><tr><th>Note</th><th>Pieces</th><th>Amount</th></tr></thead><tbody>${rows}
        <tr><td>Coins</td><td></td><td style="text-align:right">৳${Number(c.coinsAmount || 0).toLocaleString("en-IN")}</td></tr>
        <tr class="tot"><td colspan="2">Total cash in bag</td><td style="text-align:right">৳${Number(c.physicalTotal).toLocaleString("en-IN")}</td></tr>
      </tbody></table>
      <p><b>System receipts:</b> ৳${Number(c.systemTotal).toLocaleString("en-IN")} (${c.receiptCount} receipts) &nbsp; <b>Variance:</b> ৳${Number(c.variance).toLocaleString("en-IN")}</p>
      <div class="sig"><span>Cashier signature</span><span>Supervisor signature</span><span>Bank teller stamp</span></div>
    </section>`;
  w.document.write(`<!doctype html><html><head><title>${c.closeoutNumber}</title><style>
    body{font-family:Arial,sans-serif;color:#111;margin:24px}
    .slip{border:1px solid #333;padding:16px;margin-bottom:28px;page-break-inside:avoid}
    header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #333;margin-bottom:8px}
    h2{font-size:16px;margin:4px 0} table{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}
    th,td{border:1px solid #999;padding:4px 8px} th{background:#eee;text-align:left} .tot td{font-weight:bold}
    p{font-size:13px;margin:4px 0} .sig{display:flex;justify-content:space-between;margin-top:36px;font-size:12px}
    .sig span{border-top:1px solid #333;padding-top:4px;width:30%;text-align:center}
  </style></head><body>${copy("Bank Copy")}${copy("Bursar Office Copy")}<script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

interface Props {
  onNotify?: (msg: string) => void;
}

export function CashierCloseoutPanel({ onNotify = () => {} }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isSupervisor =
    user?.role === "super-admin" || user?.role === "domain-admin" || (user as any)?.staffSubRole === "accountant";

  const [businessDate, setBusinessDate] = useState(dhakaToday());
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [coins, setCoins] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");

  const [depositFor, setDepositFor] = useState<any>(null);
  const [deposit, setDeposit] = useState({ bankName: "Sonali Bank — College Branch", depositSlipNo: "", depositedAmount: "" });
  const [rejectFor, setRejectFor] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState("");

  const summaryQ = useQuery({
    queryKey: ["drawer-summary", businessDate],
    queryFn: () => financeApi.getDrawerSummary(businessDate),
    retry: false,
  });
  const historyQ = useQuery({
    queryKey: ["cashier-closeouts"],
    queryFn: () => financeApi.getCashierCloseouts({ limit: 30 }),
    retry: false,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["drawer-summary"] });
    queryClient.invalidateQueries({ queryKey: ["cashier-closeouts"] });
  };

  const physicalTotal = useMemo(
    () => NOTES.reduce((s, n) => s + n * (parseInt(counts[n] || "0", 10) || 0), 0) + (parseFloat(coins) || 0),
    [counts, coins]
  );
  const expected = summaryQ.data?.expectedCash ?? 0;
  const variance = Math.round((physicalTotal - expected) * 100) / 100;
  const existing = summaryQ.data?.existingCloseout;

  const sealM = useMutation({
    mutationFn: financeApi.sealCashierCloseout,
    onSuccess: (c: any) => {
      onNotify(`Drawer sealed. Bag ${c.bagNumber} created — print the deposit slip and hand over to the bank runner.`);
      setCounts({});
      setCoins("");
      setReason("");
      refreshAll();
      printDepositSlip(c);
    },
    onError: (e) => setFormError(errMsg(e)),
  });

  const depositM = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => financeApi.recordCloseoutDeposit(id, payload),
    onSuccess: () => {
      onNotify("Bank deposit recorded. Awaiting supervisor verification.");
      setDepositFor(null);
      refreshAll();
    },
    onError: (e) => setActionError(errMsg(e)),
  });

  const verifyM = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => financeApi.verifyCashierCloseout(id, payload),
    onSuccess: (c: any) => {
      onNotify(
        c.status === "VERIFIED"
          ? `Closeout ${c.closeoutNumber} verified${c.varianceJournal ? " — over/short journal posted to GL" : ""}.`
          : `Closeout ${c.closeoutNumber} rejected. Cashier must recount and reseal.`
      );
      setRejectFor(null);
      setRejectReason("");
      refreshAll();
    },
    onError: (e) => setActionError(errMsg(e)),
  });

  const handleSeal = () => {
    setFormError("");
    const denominations = NOTES.map((note) => ({ note, count: parseInt(counts[note] || "0", 10) || 0 })).filter(
      (d) => d.count > 0
    );
    if (!denominations.length && !(parseFloat(coins) > 0)) {
      setFormError("Enter the physical note count before sealing.");
      return;
    }
    if (variance !== 0 && !reason.trim()) {
      setFormError("Drawer does not balance — explain the variance before sealing.");
      return;
    }
    sealM.mutate({
      businessDate,
      denominations: denominations.length ? denominations : [{ note: 1, count: 0 }],
      coinsAmount: parseFloat(coins) || 0,
      varianceReason: reason.trim() || undefined,
    });
  };

  const isOwn = (c: any) => !!user?.email && c.cashier?.email === user.email;
  const history: any[] = Array.isArray(historyQ.data) ? historyQ.data : [];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Landmark size={16} className="text-gold" />
            Daily Cashier Drawer Audit &amp; Bank Bag
          </h3>
          <p className="text-xs text-text-muted">
            Count the drawer → seal the bag → record the bank deposit → supervisor verifies. Expected cash is computed by
            the server from your own cash receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="closeout-date" className="text-xs text-text-muted">
            Business date
          </label>
          <input
            id="closeout-date"
            type="date"
            value={businessDate}
            max={dhakaToday()}
            onChange={(e) => setBusinessDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text"
          />
          <Button variant="ghost" size="sm" onClick={refreshAll} leftIcon={<RefreshCw size={14} />} aria-label="Refresh">
            Refresh
          </Button>
        </div>
      </div>

      {summaryQ.isError && (
        <div className="p-4 rounded-xl border border-danger/30 bg-danger-soft text-danger text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> Could not load drawer summary: {errMsg(summaryQ.error)}
        </div>
      )}

      {existing ? (
        <Card orientation="vertical" padding="md" className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm font-bold text-text flex items-center gap-2">
              <Lock size={15} className="text-gold" /> Drawer already sealed for {businessDate}
            </h4>
            <Badge tone={STATUS_TONE[existing.status]} size="sm">
              {existing.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <Stat label="Bag number" value={existing.bagNumber} mono />
            <Stat label="Physical counted" value={taka(existing.physicalTotal)} />
            <Stat label="System receipts" value={taka(existing.systemTotal)} />
            <Stat
              label="Variance"
              value={taka(existing.variance)}
              tone={existing.variance === 0 ? "ok" : "bad"}
            />
          </div>
          {summaryQ.data?.expectedCash > 0 && (
            <p className="text-xs text-warning flex items-center gap-1.5">
              <AlertTriangle size={13} /> {taka(summaryQ.data.expectedCash)} of cash was collected after sealing. It will
              need a supervisor rejection and reseal, or roll into the next business day.
            </p>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card orientation="vertical" padding="md">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-3 flex items-center gap-2">
                <Banknote size={14} className="text-gold" /> Physical Currency Count
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {NOTES.map((note) => {
                  const c = parseInt(counts[note] || "0", 10) || 0;
                  return (
                    <div
                      key={note}
                      className={`p-3 rounded-xl border transition-colors ${
                        c > 0 ? "border-gold/40 bg-gold/5" : "border-border bg-surface-muted"
                      }`}
                    >
                      <label htmlFor={`note-${note}`} className="flex justify-between text-xs text-text-muted mb-1">
                        <span>৳{note} notes</span>
                        <span className="font-mono text-gold">{taka(note * c)}</span>
                      </label>
                      <input
                        id={`note-${note}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={counts[note] ?? ""}
                        placeholder="0"
                        onChange={(e) => setCounts((p) => ({ ...p, [note]: e.target.value.replace(/[^\d]/g, "") }))}
                        className="w-full h-9 px-2 rounded-lg border border-border bg-surface font-mono text-sm text-text"
                      />
                    </div>
                  );
                })}
                <div className="p-3 rounded-xl border border-border bg-surface-muted">
                  <label htmlFor="coins" className="text-xs text-text-muted mb-1 block">
                    Coins (total ৳)
                  </label>
                  <input
                    id="coins"
                    type="number"
                    min={0}
                    step="0.01"
                    value={coins}
                    placeholder="0"
                    onChange={(e) => setCoins(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-border bg-surface font-mono text-sm text-text"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card orientation="vertical" padding="md" className="space-y-3">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Reconciliation</h4>
              <div className="space-y-2 text-xs">
                <Row label="Physical cash counted" value={taka(physicalTotal)} strong />
                <Row
                  label={`System cash receipts (${summaryQ.data?.cashReceiptCount ?? 0})`}
                  value={summaryQ.isLoading ? "…" : taka(expected)}
                />
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold text-text">Variance (over/short)</span>
                  <motion.span
                    key={variance}
                    initial={{ scale: 0.9, opacity: 0.4 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`font-mono font-bold ${variance === 0 ? "text-emerald-600" : "text-danger"}`}
                  >
                    {variance === 0 ? "৳0 (Balanced)" : `${variance > 0 ? "+" : "−"}${taka(Math.abs(variance))} ${variance > 0 ? "over" : "short"}`}
                  </motion.span>
                </div>
                {summaryQ.data?.byMethod && Object.keys(summaryQ.data.byMethod).length > 0 && (
                  <div className="pt-2 border-t border-border space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted">Today by method (not in drawer unless cash)</span>
                    {Object.entries<any>(summaryQ.data.byMethod).map(([m, v]) => (
                      <Row key={m} label={`${m} · ${v.count}`} value={taka(v.amount)} />
                    ))}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {variance !== 0 && physicalTotal > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <FormField label="Variance explanation" required htmlFor="variance-reason">
                      <Textarea
                        id="variance-reason"
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. ৳500 change returned twice to student at 14:10; counterfeit ৳1000 note confiscated"
                      />
                    </FormField>
                  </motion.div>
                )}
              </AnimatePresence>

              {formError && (
                <p role="alert" className="text-xs text-danger flex items-start gap-1.5">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {formError}
                </p>
              )}

              <Button
                id="seal-drawer-btn"
                variant="gold"
                className="w-full"
                loading={sealM.isPending}
                disabled={summaryQ.isLoading || summaryQ.isError}
                leftIcon={<Printer size={15} />}
                onClick={handleSeal}
              >
                Seal Drawer &amp; Print Deposit Slip
              </Button>
              <p className="text-[10px] text-text-muted text-center">
                Sealing locks today&apos;s cash receipts to this bag. It cannot be edited — only rejected by a supervisor.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* History & supervisor queue */}
      <Card orientation="vertical" padding="md">
        <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-3 flex items-center gap-2">
          <History size={14} className="text-gold" /> {isSupervisor ? "Closeout Register & Verification Queue" : "My Closeout History"}
        </h4>
        {historyQ.isError ? (
          <p className="text-xs text-danger">Could not load closeouts: {errMsg(historyQ.error)}</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-text-muted py-6 text-center">{historyQ.isLoading ? "Loading…" : "No closeouts yet."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Bag / Ref</th>
                  {isSupervisor && <th className="py-2 pr-3">Cashier</th>}
                  <th className="py-2 pr-3 text-right">Counted</th>
                  <th className="py-2 pr-3 text-right">System</th>
                  <th className="py-2 pr-3 text-right">Variance</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((c) => (
                  <tr key={c._id} className="border-b border-border/60 hover:bg-surface-muted/50">
                    <td className="py-2 pr-3 font-mono">{c.businessDate}</td>
                    <td className="py-2 pr-3">
                      <div className="font-mono text-text">{c.bagNumber}</div>
                      <div className="text-[10px] text-text-muted">
                        {c.depositSlipNo ? `Slip ${c.depositSlipNo}` : c.closeoutNumber}
                      </div>
                    </td>
                    {isSupervisor && <td className="py-2 pr-3">{c.cashier?.name || c.cashier?.email || "—"}</td>}
                    <td className="py-2 pr-3 text-right font-mono">{taka(c.depositedAmount ?? c.physicalTotal)}</td>
                    <td className="py-2 pr-3 text-right font-mono">{taka(c.systemTotal)}</td>
                    <td className={`py-2 pr-3 text-right font-mono ${c.variance === 0 ? "text-emerald-600" : "text-danger"}`}>
                      {taka(c.variance)}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge tone={STATUS_TONE[c.status]} size="sm" title={c.rejectionReason || c.varianceReason || undefined}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => printDepositSlip(c)} aria-label="Print slip">
                        <Printer size={13} />
                      </Button>
                      {c.status === "SEALED" && (isOwn(c) || isSupervisor) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActionError("");
                            setDeposit((d) => ({ ...d, depositSlipNo: "", depositedAmount: String(c.physicalTotal) }));
                            setDepositFor(c);
                          }}
                        >
                          Record deposit
                        </Button>
                      )}
                      {isSupervisor && !isOwn(c) && c.status === "DEPOSITED" && (
                        <Button
                          size="sm"
                          variant="gold"
                          loading={verifyM.isPending && verifyM.variables?.id === c._id}
                          leftIcon={<ShieldCheck size={13} />}
                          onClick={() => {
                            setActionError("");
                            verifyM.mutate({ id: c._id, payload: { decision: "VERIFIED" } });
                          }}
                        >
                          Verify
                        </Button>
                      )}
                      {isSupervisor && !isOwn(c) && ["SEALED", "DEPOSITED"].includes(c.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setActionError("");
                            setRejectFor(c);
                          }}
                          aria-label="Reject"
                        >
                          <XCircle size={13} className="text-danger" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {actionError && !depositFor && !rejectFor && (
              <p role="alert" className="text-xs text-danger mt-2">{actionError}</p>
            )}
          </div>
        )}
      </Card>

      {/* Deposit modal */}
      <Modal
        isOpen={!!depositFor}
        onClose={() => setDepositFor(null)}
        title="Record Bank Deposit"
        subtitle={depositFor ? `${depositFor.bagNumber} · sealed ${taka(depositFor.physicalTotal)}` : ""}
        size="md"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            depositM.mutate({
              id: depositFor._id,
              payload: {
                bankName: deposit.bankName,
                depositSlipNo: deposit.depositSlipNo,
                depositedAmount: parseFloat(deposit.depositedAmount) || 0,
              },
            });
          }}
        >
          <FormField label="Bank & branch" required htmlFor="dep-bank">
            <Input id="dep-bank" value={deposit.bankName} onChange={(e) => setDeposit({ ...deposit, bankName: e.target.value })} />
          </FormField>
          <FormField label="Deposit slip / transaction no." required htmlFor="dep-slip">
            <Input id="dep-slip" value={deposit.depositSlipNo} onChange={(e) => setDeposit({ ...deposit, depositSlipNo: e.target.value })} />
          </FormField>
          <FormField
            label="Amount credited by bank (৳)"
            required
            htmlFor="dep-amt"
            hint="Enter what the bank teller actually accepted. Any difference (e.g. a rejected counterfeit) becomes the final variance."
          >
            <Input
              id="dep-amt"
              type="number"
              min={0}
              step="0.01"
              value={deposit.depositedAmount}
              onChange={(e) => setDeposit({ ...deposit, depositedAmount: e.target.value })}
            />
          </FormField>
          {actionError && <p role="alert" className="text-xs text-danger">{actionError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDepositFor(null)}>Cancel</Button>
            <Button type="submit" variant="gold" loading={depositM.isPending} leftIcon={<CheckCircle2 size={15} />}>
              Confirm deposit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject modal */}
      <Modal
        isOpen={!!rejectFor}
        onClose={() => setRejectFor(null)}
        title="Reject Closeout"
        subtitle="The cash receipts will be released so the cashier can recount and reseal."
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Reason" required htmlFor="reject-reason">
            <Textarea id="reject-reason" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </FormField>
          {actionError && <p role="alert" className="text-xs text-danger">{actionError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button
              variant="danger"
              loading={verifyM.isPending}
              disabled={!rejectReason.trim()}
              onClick={() => verifyM.mutate({ id: rejectFor._id, payload: { decision: "REJECTED", rejectionReason: rejectReason } })}
            >
              Reject closeout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted capitalize">{label}</span>
      <strong className={`font-mono ${strong ? "text-emerald-600 text-sm" : "text-text"}`}>{value}</strong>
    </div>
  );
}

function Stat({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: "ok" | "bad" }) {
  return (
    <div className="p-3 rounded-xl bg-surface-muted border border-border">
      <div className="text-text-muted mb-1">{label}</div>
      <div className={`font-bold ${mono ? "font-mono" : "font-mono"} ${tone === "ok" ? "text-emerald-600" : tone === "bad" ? "text-danger" : "text-text"}`}>
        {value}
      </div>
    </div>
  );
}

export default CashierCloseoutPanel;
