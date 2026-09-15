"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DEMO_ACCOUNTS_ENABLED,
  PRIMARY_DEMO_ACCOUNTS,
  ALL_DEMO_ACCOUNTS,
  type DemoAccount,
} from "@/config/demoAccounts";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeftRight, Check, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Demo role switcher.
 *
 * A presentation aid: signs in as any seeded demo account in one click so a
 * reviewer can watch navigation, dashboards and permissions change per role.
 *
 * Renders nothing unless demo accounts are enabled - see
 * `src/config/demoAccounts.ts`. It never bypasses the backend: switching goes
 * through the same `/auth/login` endpoint as the login screen, so the token and
 * resulting permissions are exactly what that account would really get.
 */
export default function DemoRoleSwitcher() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loginUser = useAuthStore((s) => s.login);

  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [switchingKey, setSwitchingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const accounts = showAll ? ALL_DEMO_ACCOUNTS : PRIMARY_DEMO_ACCOUNTS;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const switchTo = useCallback(
    async (acct: DemoAccount) => {
      setError("");
      if (acct.email === user?.email) {
        setOpen(false);
        return;
      }
      setSwitchingKey(acct.key);
      try {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: acct.email,
          password: acct.password,
          role: acct.role,
        });
        const data = res.data?.data;
        if (!data?.token || !data?.profile) {
          throw new Error("Unexpected login response");
        }
        // Same path the login screen uses: this clears cached queries when the
        // role changes, so no data leaks across demo accounts.
        loginUser(data.profile, data.token);
        setOpen(false);
        router.push("/");
        router.refresh();
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.message as string | undefined)
          : undefined;
        setError(
          message ||
            "Could not switch account. Make sure the backend is running and seeded.",
        );
      } finally {
        setSwitchingKey(null);
      }
    },
    [loginUser, router, user?.email],
  );

  if (!DEMO_ACCOUNTS_ENABLED) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Demo role switcher"
        className={`flex items-center gap-1.5 h-9 px-2 sm:px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
          open
            ? "border-primary bg-primary-soft text-primary"
            : "border-border bg-surface-muted/60 text-text-muted hover:text-text hover:border-border-strong"
        }`}
      >
        <ArrowLeftRight size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Demo</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Demo role switcher"
            className="absolute right-0 top-full mt-1.5 w-[19rem] max-w-[calc(100vw-1.5rem)] rounded-lg bg-surface-raised border border-border shadow-lg z-40 overflow-hidden"
          >
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-text">Switch demo role</p>
              <p className="text-[10px] text-text-subtle mt-0.5 leading-relaxed">
                Signs in through the real login endpoint. Nothing is mocked.
              </p>
            </div>

            {error && (
              <div className="px-3 py-2 bg-danger-soft border-b border-border text-[10px] text-danger">
                {error}
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto p-1.5 space-y-1">
              {accounts.map((acct) => {
                const isCurrent = acct.email === user?.email;
                const isSwitching = switchingKey === acct.key;
                return (
                  <button
                    key={acct.key}
                    type="button"
                    onClick={() => switchTo(acct)}
                    disabled={isSwitching}
                    aria-current={isCurrent ? "true" : undefined}
                    className={`w-full text-left rounded-md border px-2.5 py-2 transition-colors cursor-pointer disabled:cursor-wait ${
                      isCurrent
                        ? "border-primary bg-primary-soft"
                        : "border-transparent hover:border-border hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-text truncate flex-1">
                        {acct.roleLabel}
                      </span>
                      {isSwitching ? (
                        <Loader2 size={12} className="animate-spin text-text-muted" aria-hidden="true" />
                      ) : isCurrent ? (
                        <Check size={13} className="text-primary shrink-0" aria-hidden="true" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge tone={acct.access === "read-only" ? "warning" : "success"}>
                        {acct.access === "read-only" ? "View-Only" : "Full"}
                      </Badge>
                      <span className="text-[10px] text-text-muted truncate">{acct.email}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border p-1.5 space-y-1">
              {ALL_DEMO_ACCOUNTS.length > PRIMARY_DEMO_ACCOUNTS.length && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full text-center text-[10px] text-primary hover:text-primary-hover font-medium py-1 cursor-pointer"
                >
                  {showAll
                    ? "Show headline roles only"
                    : `Show all ${ALL_DEMO_ACCOUNTS.length} accounts`}
                </button>
              )}
              <a
                href="/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[10px] text-text-muted hover:text-text font-medium py-1"
              >
                Open demo guide
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
