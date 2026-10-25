import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle, Phone, Search, Ticket, XCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

type SearchMode = 'id' | 'phone';

interface StatusResult {
  appointment_id: string;
  status: string;
}

export default function AppointmentStatusPage() {
  const { t } = useLanguage();
  const queryParams = new URLSearchParams(window.location.search);
  const initialId = queryParams.get('id') || '';
  const initialPhone = queryParams.get('phone') || '';

  const [mode, setMode] = useState<SearchMode>(initialPhone && !initialId ? 'phone' : 'id');
  const [input, setInput] = useState(initialId || initialPhone);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const statusConfig: Record<string, { label: string; description: string; badgeClass: string; icon: typeof Clock3 }> = {
    pending: {
      label: t.statusLabelPending,
      description: t.statusDescPending,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock3
    },
    confirmed: {
      label: t.statusLabelConfirmed,
      description: t.statusDescConfirmed,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2
    },
    completed: {
      label: t.statusLabelCompleted,
      description: t.statusDescCompleted,
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: CheckCircle2
    },
    cancelled: {
      label: t.statusLabelCancelled,
      description: t.statusDescCancelled,
      badgeClass: 'bg-red-50 text-red-800 border-red-200',
      icon: XCircle
    }
  };

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const val = input.trim();
    if (!val) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setSearched(true);

    try {
      const payload = mode === 'id'
        ? { p_appointment_id: val, p_phone: null }
        : { p_appointment_id: null, p_phone: val };

      const { data, error } = await supabase.rpc('check_appointment_status', payload);

      if (error) {
        console.error('Error fetching appointment status:', error);
        setErrorMsg(t.statusNotFound);
      } else if (data && data.length > 0) {
        setResult(data[0] as StatusResult);
      } else {
        setErrorMsg(t.statusNotFound);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMsg(t.statusNotFound);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] px-5 py-8 text-[#1a1a1a] sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a1628] hover:text-[#c1272d] transition">
            <ArrowLeft size={16} /> {t.statusBackWeb}
          </a>
          <LanguageSwitcher scrolled={true} />
        </div>

        <div className="mt-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a1628] text-white font-black shadow-lg">SS</span>
          <p className="mt-6 text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">{t.statusSchoolName}</p>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#0a1628]">{t.statusPageTitle}</h1>
          <p className="mt-3 text-xs sm:text-sm font-sans text-slate-600">{t.statusPageSubtitle}</p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#e2e0db] bg-white p-6 sm:p-8 shadow-xl shadow-black/5">
          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-[#f4f1ea] p-1.5 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('id');
                setInput('');
                setSearched(false);
                setResult(null);
                setErrorMsg('');
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                mode === 'id' ? 'bg-[#0a1628] text-white shadow' : 'text-slate-600 hover:text-[#0a1628]'
              }`}
            >
              <Ticket size={15} /> {t.statusTabId}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('phone');
                setInput('');
                setSearched(false);
                setResult(null);
                setErrorMsg('');
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                mode === 'phone' ? 'bg-[#0a1628] text-white shadow' : 'text-slate-600 hover:text-[#0a1628]'
              }`}
            >
              <Phone size={15} /> {t.statusTabPhone}
            </button>
          </div>

          <form onSubmit={search} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type={mode === 'phone' ? 'tel' : 'text'}
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'id' ? t.statusInputIdPlaceholder : t.statusInputPhonePlaceholder}
              aria-label={mode === 'id' ? t.statusTabId : t.statusTabPhone}
              className={`flex-1 rounded-xl border border-[#d4d0c8] bg-[#faf8f4] px-4 py-3.5 text-sm font-semibold text-[#0a1628] focus:border-[#0a1628] focus:bg-white focus:outline-none ${
                mode === 'id' ? 'uppercase tracking-wider' : ''
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c1272d] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-900/15 hover:bg-[#a51f25] disabled:opacity-50 transition"
            >
              {loading ? <LoaderCircle className="animate-spin" size={17} /> : <Search size={17} />} {t.statusCheckBtn}
            </button>
          </form>

          {searched && (
            <div className="mt-8 border-t border-[#e2e0db] pt-6">
              {result ? (
                (() => {
                  const info = statusConfig[result.status] || {
                    label: result.status,
                    description: `Status: ${result.status}`,
                    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
                    icon: Clock3
                  };
                  const Icon = info.icon;

                  return (
                    <div className="rounded-2xl border border-[#e2e0db] bg-[#faf8f4] p-6 text-left">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e0db] pb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.statusTabId}</p>
                          <p className="mt-1 font-display text-2xl font-extrabold text-[#0a1628]">{result.appointment_id}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold ${info.badgeClass}`}>
                          <Icon size={14} />
                          {info.label}
                        </span>
                      </div>
                      <p className="mt-4 text-xs sm:text-sm font-medium leading-relaxed text-slate-700">
                        {info.description}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-xs sm:text-sm font-semibold text-red-700">
                  {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
