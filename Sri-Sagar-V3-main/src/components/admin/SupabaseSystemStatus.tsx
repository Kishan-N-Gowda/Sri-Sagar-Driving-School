import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SUPABASE_DASHBOARD_URL = 'https://supabase.com/dashboard/project/wcurzjcdqxkahcardcyi';

export function SupabaseSystemStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage(null);

    try {
      // Enforce a 6-second timeout to avoid hanging if the project is paused
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
        setTimeout(
          () => reject(new Error('Connection timed out. The project may be paused or unreachable.')),
          6000
        )
      );

      // Perform a lightweight safe read request
      const queryPromise = supabase.from('site_settings').select('id').limit(1).maybeSingle();

      const result = (await Promise.race([queryPromise, timeoutPromise])) as {
        data?: unknown;
        error?: { message?: string } | null;
      };

      if (result?.error) {
        const msg = result.error.message || '';
        // If it is a network or fetch failure, mark as unavailable
        if (
          msg.toLowerCase().includes('failed to fetch') ||
          msg.toLowerCase().includes('network') ||
          msg.toLowerCase().includes('connection refused')
        ) {
          setIsOnline(false);
          setErrorMessage('Supabase is currently unreachable. The project may be paused or temporarily unavailable.');
        } else {
          // If server responded (even if no rows or permission constraint), the Supabase project is active/reachable
          setIsOnline(true);
          setLastChecked(new Date());
        }
      } else {
        setIsOnline(true);
        setLastChecked(new Date());
      }
    } catch (err: unknown) {
      setIsOnline(false);
      const msg = err instanceof Error ? err.message : 'Supabase project is currently unreachable.';
      setErrorMessage(msg);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  return (
    <div className="rounded-2xl border border-[#e2e0db] bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a1628] text-white">
            <Database size={20} />
          </span>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#0a1628]">
              Supabase System Status
            </h3>
            <p className="text-xs text-slate-500">
              Database and backend services connectivity
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-3">
          {isChecking && isOnline === null ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600">
              <LoaderCircle size={14} className="animate-spin text-slate-500" />
              Checking...
            </span>
          ) : isOnline === true ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              🟢 Supabase Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 border border-red-200">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              🔴 Supabase Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Details & Error Notice */}
      <div className="mt-5 border-t border-[#eeeae2] pt-4">
        {isOnline === false && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-900">Project May Be Paused</p>
              <p className="mt-1 leading-relaxed text-red-700">
                {errorMessage || 'The Supabase project is unreachable. If the project has been inactive, it may have been paused by Supabase.'}
              </p>
            </div>
          </div>
        )}

        {isOnline === true && (
          <div className="mb-4 flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Database connection verified. Backend services and storage are active and operational.</span>
          </div>
        )}

        {/* Informational Guidance Notice */}
        <p className="text-xs leading-relaxed text-slate-500">
          Your website cannot automatically resume a paused Supabase project from the browser. If Supabase is paused, open the dashboard and resume the project there.
        </p>

        {/* Action Controls and Timestamp */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void checkConnection()}
              disabled={isChecking}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e2e0db] bg-[#faf9f6] px-4 py-2 text-xs font-bold text-[#0a1628] shadow-2xs transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} />
              {isChecking ? 'Checking...' : 'Check Connection'}
            </button>

            <a
              href={SUPABASE_DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0a1628] px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#1a283e]"
            >
              <ExternalLink size={13} />
              Open Supabase Dashboard
            </a>
          </div>

          {lastChecked && (
            <p className="text-[11px] font-medium text-slate-400">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
