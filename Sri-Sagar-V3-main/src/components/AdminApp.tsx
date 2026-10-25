import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Facebook,
  FileImage,
  History,
  ImagePlus,
  Instagram,
  LayoutDashboard,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Menu,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { publishFacebookPost } from '@/lib/facebookPublisher';
import {
  getActiveHardcodedPhotos,
  getCanonicalPhotoKey,
  markPhotoAsDeleted,
  mergeAndDeduplicatePhotos,
} from '@/lib/galleryDefaults';
import { extractGalleryStorageKey, galleryImageUrl, phoneUrl, supabase, whatsappUrl } from '@/lib/supabase';
import { Appointment, AppointmentStatus, GalleryCategory, GalleryPhoto, SiteSettings } from '@/lib/types';
import { EditCaptionModal } from './admin/EditCaptionModal';
import { FacebookQuickPostModal } from './admin/FacebookQuickPostModal';
import { PublishModal } from './admin/PublishModal';
import { ConfirmDeleteModal } from './admin/ConfirmDeleteModal';
import { SocialConnectionStatus } from './admin/SocialConnectionStatus';
import { SocialHistoryView } from './admin/SocialHistoryView';
import { SupabaseSystemStatus } from './admin/SupabaseSystemStatus';

const statusLabels: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
const statusClasses: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};
const categories: GalleryCategory[] = ['Training', 'Vehicles', 'Students', 'Branches', 'School'];

export default function AdminApp() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [page, setPage] = useState(window.location.pathname.replace('/admin', '').replace(/^\//, '') || 'dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const result = await supabase.rpc('is_admin');
          let isAdmin = result.data === true;
          if (!isAdmin) {
            const adminCheck = await supabase.from('admin_users').select('user_id').eq('user_id', data.session.user.id).maybeSingle();
            isAdmin = !!adminCheck.data;
          }
          setAuthorized(isAdmin);
        }
      } catch (e) {
        console.warn('Supabase session check failed', e);
      }
      setSessionChecked(true);
    };
    void check();
  }, []);

  const navigate = (next: string) => {
    const path = next === 'dashboard' ? '/admin' : `/admin/${next}`;
    window.history.pushState({}, '', path);
    setPage(next);
    setMenuOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthorized(false);
  };

  if (!sessionChecked) return <LoadingScreen />;
  if (!authorized) return <AdminLogin onAuthorized={() => setAuthorized(true)} />;

  const content =
    page === 'appointments' ? (
      <AppointmentsPage />
    ) : page === 'gallery' ? (
      <GalleryPage />
    ) : page === 'settings' ? (
      <SettingsPage />
    ) : (
      <DashboardPage navigate={navigate} />
    );

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1a1a1a]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0a1628] p-6 text-white transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <a
            href="/admin"
            onClick={(event) => {
              event.preventDefault();
              navigate('dashboard');
            }}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-sm font-black">
              SS
            </span>
            <span>
              <span className="block font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[#c1272d]">
                Sri Sagar
              </span>
              <span className="block font-display text-sm font-extrabold">Admin</span>
            </span>
          </a>
          <button type="button" onClick={() => setMenuOpen(false)} className="lg:hidden">
            <X />
          </button>
        </div>

        <nav className="mt-14 grid gap-2">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { key: 'appointments', label: 'Appointments', icon: CalendarDays },
            { key: 'gallery', label: 'Gallery & Social Media', icon: ImagePlus },
            { key: 'settings', label: 'Settings', icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => navigate(key)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                page === key ? 'bg-white text-[#0a1628]' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => void logout()}
          className="absolute bottom-7 left-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/60 hover:text-white"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/5 bg-[#f4f1ea]/90 px-5 backdrop-blur-lg lg:px-10">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-xl bg-white p-3 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c1272d]">Owner portal</p>
            <h1 className="font-display text-xl font-extrabold capitalize text-[#0a1628]">
              {page === 'gallery' ? 'Gallery & Social Media' : page}
            </h1>
          </div>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0a1628]">
            <ExternalLink size={16} /> View website
          </a>
        </header>
        <main className="p-3.5 sm:p-5 lg:p-10 w-full max-w-full overflow-x-hidden">{content}</main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea]">
      <LoaderCircle className="animate-spin text-[#c1272d]" />
    </div>
  );
}

function AdminLogin({ onAuthorized }: { onAuthorized: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setError('Unable to sign in with those details.');
      setLoading(false);
      return;
    }
    const admin = await supabase.rpc('is_admin');
    setLoading(false);
    if (admin.data !== true) {
      await supabase.auth.signOut();
      setError('This account is not authorized for the owner portal.');
      return;
    }
    onAuthorized();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1628] px-5 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl sm:p-10">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0a1628]">
          <ArrowLeft size={16} /> Website
        </a>
        <div className="mt-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a1628] text-sm font-black text-white">
            SS
          </span>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.3em] text-[#c1272d]">Owner portal</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-[#0a1628]">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Sign in with your authorized Supabase account to manage the school.</p>
        </div>
        <div className="mt-8 grid gap-5">
          <div>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@example.com"
            />
          </div>
          <div>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#c1272d] py-4 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? <LoaderCircle className="animate-spin" size={17} /> : null} Sign in
          </button>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        </div>
      </form>
    </div>
  );
}

function DashboardPage({ navigate }: { navigate: (page: string) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [galleryCount, setGalleryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [a, g] = await Promise.all([
        supabase.from('appointments').select('*').order('preferred_date', { ascending: true }),
        supabase.from('gallery_photos').select('id', { count: 'exact', head: true }),
      ]);
      if (a?.data) setAppointments(a.data as Appointment[]);
      setGalleryCount(g?.count || 0);
    } catch (e) {
      console.warn('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setUpdatingId(appointmentId);
    setActionError(null);
    try {
      const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', appointmentId);
      if (error) {
        setActionError(`Failed to update appointment status: ${error.message}`);
      } else {
        setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a)));
      }
    } catch {
      setActionError('An error occurred while updating the appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter((a) => a.preferred_date >= today).slice(0, 5);

  const cards = [
    { label: "Today's appointments", value: appointments.filter((a) => a.preferred_date === today).length, icon: CalendarDays },
    { label: 'Pending', value: appointments.filter((a) => a.status === 'pending').length, icon: Clock3 },
    { label: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length, icon: CheckCircle2 },
    { label: 'Completed', value: appointments.filter((a) => a.status === 'completed').length, icon: Check },
    { label: 'Total appointments', value: appointments.length, icon: Users },
    { label: 'Gallery photos', value: galleryCount, icon: FileImage },
  ];

  return (
    <div>
      <PageHeading eyebrow="At a glance" title="Dashboard" description="Keep track of lessons, customers and school content." />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-[#e2e0db] bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a1628] text-white">
                <Icon size={19} />
              </span>
              <span className="font-display text-3xl font-extrabold text-[#0a1628]">{value}</span>
            </div>
            <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-[#e2e0db] bg-[#ffffff] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-[#0a1628]">Upcoming appointments</h2>
          <button type="button" onClick={() => navigate('appointments')} className="text-sm font-bold text-[#c1272d] hover:underline">
            View all
          </button>
        </div>

        {actionError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
            {actionError}
          </div>
        )}

        {upcoming.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500">No upcoming appointments yet.</p>
        ) : (
          <div className="mt-6 grid gap-3">
            {upcoming.map((appointment) => {
              const isUpdating = updatingId === appointment.id;
              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 rounded-xl border border-[#eeeae2] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="grid flex-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
                    <div>
                      <p className="font-bold text-[#0a1628]">{appointment.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{appointment.appointment_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{appointment.course}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        {appointment.preferred_date} · {appointment.preferred_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 sm:justify-end">
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClasses[appointment.status]}`}>
                      {appointment.status}
                    </span>

                    {appointment.status === 'pending' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void updateStatus(appointment.id, 'confirmed')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isUpdating ? <LoaderCircle className="animate-spin" size={13} /> : <Check size={14} />}
                        Confirm
                      </button>
                    )}

                    {appointment.status === 'confirmed' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void updateStatus(appointment.id, 'completed')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUpdating ? <LoaderCircle className="animate-spin" size={13} /> : <CheckCircle2 size={14} />}
                        Complete
                      </button>
                    )}

                    {appointment.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    )}

                    {appointment.status === 'cancelled' && (
                      <span className="text-xs font-semibold text-red-600">Cancelled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10">
        <SupabaseSystemStatus />
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c1272d]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-extrabold text-[#0a1628]">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function AppointmentRow({ appointment, onClick }: { appointment: Appointment; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full gap-2 rounded-xl border border-[#eeeae2] p-4 text-left transition hover:border-[#c1272d]/40 sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-center"
    >
      <div>
        <p className="font-bold text-[#0a1628]">{appointment.name}</p>
        <p className="mt-1 text-xs text-slate-400">{appointment.appointment_id}</p>
      </div>
      <p className="text-sm text-slate-600">{appointment.course}</p>
      <p className="text-sm font-semibold text-slate-600">
        {appointment.preferred_date} · {appointment.preferred_time}
      </p>
      <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClasses[appointment.status]}`}>
        {appointment.status}
      </span>
    </button>
  );
}

function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('preferred_date', { ascending: true })
      .order('preferred_time', { ascending: true });
    if (data) setAppointments(data as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const shown = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (filter === 'all' || a.status === filter) &&
          (!date || a.preferred_date === date) &&
          (!search || `${a.name} ${a.phone} ${a.appointment_id}`.toLowerCase().includes(search.toLowerCase()))
      ),
    [appointments, filter, date, search]
  );

  const update = async (appointment: Appointment, status: AppointmentStatus) => {
    await supabase.from('appointments').update({ status }).eq('id', appointment.id);
    await load();
    setSelected((current) => (current ? { ...current, status } : null));
  };

  const remove = async (appointment: Appointment) => {
    if (!window.confirm('Delete this appointment?')) return;
    await supabase.from('appointments').delete().eq('id', appointment.id);
    setSelected(null);
    await load();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeading eyebrow="Owner portal" title="Appointments" description="Search, filter and manage every booking request." />
      <div className="mt-8 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-11"
            placeholder="Search name, phone or appointment ID"
          />
        </div>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="lg:w-48" />
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {['all', ...statusLabels].map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setFilter(item as 'all' | AppointmentStatus)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold capitalize ${
              filter === item ? 'bg-[#0a1628] text-white' : 'bg-white text-slate-500'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d4d0c8] p-12 text-center text-slate-500">
            No appointments match your filters.
          </div>
        ) : (
          shown.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment} onClick={() => setSelected(appointment)} />
          ))
        )}
      </div>
      {selected && (
        <AppointmentDetails
          appointment={selected}
          onClose={() => setSelected(null)}
          onUpdate={update}
          onDelete={remove}
        />
      )}
    </div>
  );
}

function AppointmentDetails({
  appointment,
  onClose,
  onUpdate,
  onDelete,
}: {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: (appointment: Appointment, status: AppointmentStatus) => Promise<void>;
  onDelete: (appointment: Appointment) => Promise<void>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0a1628]/70 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 sm:rounded-[2rem] sm:p-10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c1272d]">Appointment details</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-[#0a1628]">{appointment.appointment_id}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-[#f4f1ea] p-2">
            <X size={18} />
          </button>
        </div>
        <div className="mt-8 grid gap-5 border-y border-[#e2e0db] py-7 sm:grid-cols-2">
          <Detail label="Customer" value={appointment.name} />
          <Detail label="Phone" value={appointment.phone} />
          <Detail label="Email" value={appointment.email || 'Not provided'} />
          <Detail label="Course" value={appointment.course} />
          <Detail label="Preferred date" value={appointment.preferred_date} />
          <Detail label="Preferred time" value={appointment.preferred_time} />
          <Detail label="Created" value={new Date(appointment.created_at).toLocaleString('en-IN')} />
          <Detail label="Message" value={appointment.message || 'No message'} />
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={phoneUrl(appointment.phone)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0a1628] px-4 py-3 text-sm font-bold text-white"
          >
            <Phone size={16} /> Call customer
          </a>
          <a
            href={whatsappUrl(
              appointment.phone,
              `Hello ${appointment.name}, this is Sri Sagar Driving School regarding appointment ${appointment.appointment_id}.`
            )}
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {statusLabels.map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => void onUpdate(appointment, status)}
              className={`rounded-xl border px-3 py-3 text-xs font-bold capitalize ${
                appointment.status === status ? 'border-[#0a1628] bg-[#0a1628] text-white' : 'border-[#e2e0db] text-slate-600'
              }`}
            >
              {status === 'confirmed'
                ? 'Confirm'
                : status === 'completed'
                ? 'Mark completed'
                : status === 'cancelled'
                ? 'Cancel'
                : 'Pending'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void onDelete(appointment)}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-red-600"
        >
          <Trash2 size={16} /> Delete appointment
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-[#0a1628]">{value}</p>
    </div>
  );
}

function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => getActiveHardcodedPhotos());
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [viewTab, setViewTab] = useState<'library' | 'history'>('library');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    caption: '',
    category: 'Training' as GalleryCategory,
    publishImmediately: false,
    publishInstagram: true,
    publishFacebook: true,
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Modals state
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [publishModalPhoto, setPublishModalPhoto] = useState<GalleryPhoto | null>(null);
  const [captionModalPhoto, setCaptionModalPhoto] = useState<GalleryPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
  const [showFacebookQuickPost, setShowFacebookQuickPost] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryingPlatform, setRetryingPlatform] = useState<{ photoId: string; platform: 'instagram' | 'facebook' } | null>(null);

  const load = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        supabase.from('gallery_photos').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*').maybeSingle(),
      ]);

      const activeHardcoded = getActiveHardcodedPhotos();

      if (pRes.data && pRes.data.length > 0) {
        const merged = mergeAndDeduplicatePhotos(activeHardcoded, pRes.data as GalleryPhoto[]);
        setPhotos(merged);
      } else {
        setPhotos(activeHardcoded);
      }

      if (sRes.data) {
        const settings = sRes.data as SiteSettings;
        setSiteSettings(settings);
        if (settings.social_auto_publish) {
          setForm((prev) => ({
            ...prev,
            publishImmediately: true,
            publishInstagram: settings.social_auto_publish_instagram ?? true,
            publishFacebook: settings.social_auto_publish_facebook ?? true,
          }));
        }
      }
    } catch (err) {
      console.error('Error in GalleryPage load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const insertTemplateCaption = (type: 'test_pass' | 'new_batch' | 'general') => {
    if (type === 'test_pass') {
      setForm((prev) => ({
        ...prev,
        caption: `Congratulations to our student for successfully clearing the driving test and getting the driver's license! 🚗🎉 Safe driving ahead with Sri Sagar Driving School.\n\n📍 Bhadrappa Layout, Bengaluru\n📞 Call/WhatsApp: +91 90195 04489\n#SriSagarDrivingSchool #DrivingSchoolBengaluru #LearnToDrive #DrivingLicense #BhadrappaLayout`,
      }));
    } else if (type === 'new_batch') {
      setForm((prev) => ({
        ...prev,
        caption: `New Driving Training Batches starting this week! Master car driving with dual-control training vehicles, certified instructors, and flexible timings.\n\n📍 1st Floor, Srinika Complex, Bhadrappa Layout Service Road, Bengaluru\n📞 +91 90195 04489\n#SriSagarDrivingSchool #CarDrivingClasses #DrivingClassesBangalore #SafeDriving`,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        caption: `${form.title || 'Practical Driving Session'} at Sri Sagar Driving School, Bhadrappa Layout, Bengaluru. Learn to drive with practical skill and safety. Contact: +91 90195 04489 #SriSagarDrivingSchool #Bengaluru`,
      }));
    }
  };

  const triggerSocialPublish = async (
    photoId: string,
    imageUrl: string,
    caption: string,
    platforms: ('instagram' | 'facebook')[],
    isRetry = false
  ) => {
    try {
      const promises: Promise<unknown>[] = [];

      // Facebook Publishing via Supabase Edge Function `publish-facebook-post`
      if (platforms.includes('facebook')) {
        promises.push(
          publishFacebookPost({
            message: caption,
            imageUrl,
            photoId,
          })
        );
      }

      // Instagram Publishing
      if (platforms.includes('instagram')) {
        promises.push(
          supabase.functions.invoke('publish-social-post', {
            body: {
              photoId,
              imageUrl,
              caption,
              platforms: ['instagram'],
              retry: isRetry,
            },
          })
        );
      }

      await Promise.all(promises);
      await load();

      const { data: updatedPhoto } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('id', photoId)
        .maybeSingle();

      if (updatedPhoto) {
        setSelectedPhoto((current) => (current?.id === photoId ? (updatedPhoto as GalleryPhoto) : current));
      }
    } catch (err) {
      console.error('Social publish trigger error:', err);
      await load();
    }
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !form.title.trim()) return;
    setSaving(true);
    setUploadNotice(null);

    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const uploaded = await supabase.storage.from('gallery').upload(path, file, { contentType: file.type, upsert: false });

    if (!uploaded.error) {
      const publicUrl = galleryImageUrl(path);
      const socialCaption =
        form.caption.trim() ||
        `${form.title.trim()}${form.description.trim() ? ` - ${form.description.trim()}` : ''} — Sri Sagar Driving School, Bhadrappa Layout, Bengaluru.`;

      const shouldPublishImmediately = form.publishImmediately || siteSettings?.social_auto_publish;
      const platformsToPublish: ('instagram' | 'facebook')[] = [];
      if (shouldPublishImmediately) {
        if (form.publishInstagram) platformsToPublish.push('instagram');
        if (form.publishFacebook) platformsToPublish.push('facebook');
      }

      const { data: inserted, error: insertError } = await supabase
        .from('gallery_photos')
        .insert({
          storage_path: path,
          title: form.title.trim(),
          description: form.description.trim() || null,
          caption: socialCaption,
          category: form.category,
          published: true,
          instagram_status: platformsToPublish.includes('instagram') ? 'publishing' : null,
          facebook_status: platformsToPublish.includes('facebook') ? 'publishing' : null,
        })
        .select('*')
        .single();

      if (!insertError && inserted) {
        // Immediate optimistic update so newly uploaded photo appears instantly
        setPhotos((prev) => [inserted as GalleryPhoto, ...prev.filter((p) => p.id !== inserted.id)]);

        setForm({
          title: '',
          description: '',
          caption: '',
          category: 'Training',
          publishImmediately: false,
          publishInstagram: true,
          publishFacebook: true,
        });
        setFile(null);
        setPreviewUrl(null);

        const fileInput = document.getElementById('photo-file') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';

        await load();

        if (platformsToPublish.length > 0) {
          setUploadNotice({
            type: 'success',
            message: `Photo uploaded! Publishing to ${platformsToPublish.join(' & ')} in background...`,
          });

          void triggerSocialPublish(inserted.id, publicUrl, socialCaption, platformsToPublish).then(() => {
            setUploadNotice({
              type: 'success',
              message: 'Photo saved. Social media publishing deliverable updated.',
            });
            setTimeout(() => setUploadNotice(null), 5000);
          });
        } else {
          setUploadNotice({
            type: 'success',
            message: 'Photo successfully uploaded to website gallery. You can publish to social media anytime.',
          });
          setTimeout(() => setUploadNotice(null), 4000);
        }
      } else {
        setUploadNotice({
          type: 'error',
          message: `Database record creation failed: ${insertError?.message || 'Unknown error'}`,
        });
      }
    } else {
      setUploadNotice({
        type: 'error',
        message: `Storage upload failed: ${uploaded.error.message}`,
      });
    }
    setSaving(false);
  };

  const handleRetry = async (photo: GalleryPhoto, platform: 'instagram' | 'facebook') => {
    setRetryingPlatform({ photoId: photo.id, platform });
    const publicUrl = galleryImageUrl(photo.storage_path);
    const captionText = photo.caption || photo.description || photo.title;

    if (platform === 'facebook') {
      await publishFacebookPost({
        message: captionText,
        imageUrl: publicUrl,
        photoId: photo.id,
      });
      await load();
      const { data: updatedPhoto } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('id', photo.id)
        .maybeSingle();

      if (updatedPhoto) {
        setSelectedPhoto((current) => (current?.id === photo.id ? (updatedPhoto as GalleryPhoto) : current));
      }
    } else {
      await triggerSocialPublish(photo.id, publicUrl, captionText, [platform], true);
    }
    setRetryingPlatform(null);
  };

  const toggle = async (photo: GalleryPhoto) => {
    const updatedStatus = !photo.published;
    await supabase.from('gallery_photos').update({ published: updatedStatus }).eq('id', photo.id);
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto({ ...selectedPhoto, published: updatedStatus });
    }
    await load();
  };

  const executeDelete = async (photo: GalleryPhoto) => {
    if (!photo) return;
    setDeletingId(photo.id);
    setUploadNotice(null);

    try {
      // 1. If photo is a hardcoded/local static photo
      if (photo.id.startsWith('hardcoded-') || photo.storage_path.startsWith('/')) {
        markPhotoAsDeleted(photo.id);
        markPhotoAsDeleted(photo.storage_path);
        const canonKey = getCanonicalPhotoKey(photo.storage_path || photo.id);
        if (canonKey) markPhotoAsDeleted(canonKey);
        setPhotos((prev) =>
          prev.filter(
            (p) =>
              p.id !== photo.id &&
              p.storage_path !== photo.storage_path &&
              getCanonicalPhotoKey(p.storage_path || p.id) !== canonKey
          )
        );
        if (
          selectedPhoto &&
          (selectedPhoto.id === photo.id ||
            selectedPhoto.storage_path === photo.storage_path ||
            getCanonicalPhotoKey(selectedPhoto.storage_path || selectedPhoto.id) === canonKey)
        ) {
          setSelectedPhoto(null);
        }
        setPhotoToDelete(null);
        setUploadNotice({
          type: 'success',
          message: 'Photo deleted successfully.',
        });
        setTimeout(() => setUploadNotice(null), 4000);
        return;
      }

      // 2. Delete database record using unique photo ID
      const { error: dbError } = await supabase.from('gallery_photos').delete().eq('id', photo.id);

      if (dbError) {
        console.error('[Gallery Database Deletion Failed]', dbError);
        setUploadNotice({
          type: 'error',
          message: `Database record deletion failed: ${dbError.message || 'Database error'}`,
        });
        setDeletingId(null);
        return;
      }

      // 3. Best-effort Supabase Storage cleanup
      const storageKey = extractGalleryStorageKey(photo.storage_path);
      if (storageKey) {
        try {
          const { error: storageError } = await supabase.storage.from('gallery').remove([storageKey]);
          if (storageError) {
            console.warn('[Gallery Storage Cleanup Warning]', storageError);
          }
        } catch (storageErr) {
          console.warn('[Gallery Storage Cleanup Exception]', storageErr);
        }
      }

      // 4. Mark as deleted in local cache & immediately update UI state
      markPhotoAsDeleted(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (selectedPhoto && selectedPhoto.id === photo.id) {
        setSelectedPhoto(null);
      }
      setPhotoToDelete(null);
      setUploadNotice({
        type: 'success',
        message: 'Photo deleted successfully.',
      });
      setTimeout(() => setUploadNotice(null), 4000);
      await load();
    } catch (err: unknown) {
      console.error('[Gallery Deletion Exception]', err);
      setUploadNotice({
        type: 'error',
        message: `Deletion failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesCategory = filterCategory === 'all' || photo.category === filterCategory;
      const matchesSearch =
        !searchTerm ||
        `${photo.title} ${photo.caption || ''} ${photo.description || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [photos, filterCategory, searchTerm]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Content & Social Media Sync"
        title="Gallery & Social Publishing"
        description="Upload photos to website and manage automatic or manual publishing to Instagram and Facebook Page."
      />

      {/* Meta Connection Status Card */}
      <SocialConnectionStatus />

      {uploadNotice && (
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold shadow-xs ${
            uploadNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : uploadNotice.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {uploadNotice.type === 'success' ? (
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}
          <span>{uploadNotice.message}</span>
        </div>
      )}

      {/* UPLOAD FORM */}
      <form onSubmit={upload} className="rounded-2xl border border-[#e2e0db] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-black/5 pb-4 gap-2">
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#0a1628]">Upload Photo</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add photos to website gallery with optional instant or scheduled social publishing
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 w-fit">
            <Share2 size={13} /> Meta Graph API v19.0
          </span>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* File Picker with local thumbnail preview */}
          <div>
            <label htmlFor="photo-file">Photo File (JPG, PNG, WebP)</label>
            <input
              id="photo-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={handleFileChange}
            />
            {previewUrl && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-[#e2e0db]">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="h-14 w-14 rounded-lg object-cover border border-black/10"
                />
                <div className="text-xs text-slate-600">
                  <p className="font-bold text-[#0a1628] truncate max-w-[200px]">{file?.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} · Ready for upload
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="photo-title">Photo Title</label>
            <input
              id="photo-title"
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="e.g. Student Cleared Driving Test"
            />
          </div>

          <div>
            <label htmlFor="photo-category">Category</label>
            <select
              id="photo-category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value as GalleryCategory })}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="photo-description">Website Gallery Description (Optional)</label>
            <input
              id="photo-description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Brief caption for public website view"
            />
          </div>

          {/* Caption Area with Template Buttons */}
          <div className="md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label htmlFor="photo-caption">Social Media Caption (Instagram & Facebook)</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Quick templates:</span>
                <button
                  type="button"
                  onClick={() => insertTemplateCaption('test_pass')}
                  className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700"
                >
                  + Driving Test Pass
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplateCaption('new_batch')}
                  className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700"
                >
                  + New Batch
                </button>
              </div>
            </div>
            <textarea
              id="photo-caption"
              rows={3}
              value={form.caption}
              onChange={(event) => setForm({ ...form, caption: event.target.value })}
              placeholder="Write a custom caption with hashtags, phone numbers, and location details..."
              className="mt-1.5"
            />
          </div>

          {/* Publishing Preferences */}
          <div className="md:col-span-2 rounded-xl bg-[#f8f7f4] border border-[#e2e0db] p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.publishImmediately}
                  onChange={(e) => setForm({ ...form, publishImmediately: e.target.checked })}
                  className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                />
                <span className="text-xs font-bold text-[#0a1628]">Publish to social media immediately upon upload</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                {form.publishImmediately ? 'Immediate sync active' : 'Save to gallery only'}
              </span>
            </div>

            {form.publishImmediately && (
              <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-black/5">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#e2e0db] cursor-pointer hover:border-[#0a1628]/30 transition">
                  <input
                    type="checkbox"
                    checked={form.publishInstagram}
                    onChange={(event) => setForm({ ...form, publishInstagram: event.target.checked })}
                    className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
                      <Instagram size={15} />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-[#0a1628]">Instagram</span>
                      <span className="block text-[10px] text-slate-500">Professional Account</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#e2e0db] cursor-pointer hover:border-[#0a1628]/30 transition">
                  <input
                    type="checkbox"
                    checked={form.publishFacebook}
                    onChange={(event) => setForm({ ...form, publishFacebook: event.target.checked })}
                    className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1877F2] text-white">
                      <Facebook size={15} />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-[#0a1628]">Facebook Page</span>
                      <span className="block text-[10px] text-slate-500">Sri Sagar Driving School</span>
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-black/5 gap-3">
          <button
            type="submit"
            disabled={saving || !file}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c1272d] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-red-950/10 hover:bg-[#a51f25] transition disabled:opacity-50"
          >
            {saving ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}
            {form.publishImmediately ? 'Upload & Publish Now' : 'Upload to Website Gallery'}
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Safe storage: Photos remain saved on the website regardless of social sync configuration
          </span>
        </div>
      </form>

      {/* VIEW TABS: PHOTOS LIBRARY VS PUBLISHING HISTORY */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-black/5 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewTab('library')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              viewTab === 'library' ? 'bg-[#0a1628] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={15} /> Photos Library ({photos.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('history')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              viewTab === 'history' ? 'bg-[#0a1628] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History size={15} /> Social History & Activity
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFacebookQuickPost(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877F2] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#166fe5] transition shadow-xs"
          >
            <Facebook size={14} /> Quick Facebook Post
          </button>

          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e0db] bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {viewTab === 'history' ? (
        <SocialHistoryView
          photos={photos}
          onOpenPublish={(p) => setPublishModalPhoto(p)}
          onRetry={handleRetry}
          retryingPlatform={retryingPlatform}
        />
      ) : (
        /* PHOTOS LIBRARY VIEW */
        <div>
          {/* Search & Category Filter */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search photo title or caption..."
                className="pl-10 text-xs py-2"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['all', ...categories].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    filterCategory === cat ? 'bg-[#0a1628] text-white' : 'bg-white text-slate-600 border border-[#e2e0db]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredPhotos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e2e0db] bg-white p-12 text-center text-sm font-semibold text-slate-500">
              No photos found matching your search or category filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
              {filteredPhotos.map((photo) => {
                const hasSocialError = photo.instagram_status === 'failed' || photo.facebook_status === 'failed';
                const isSocialPublishing = photo.instagram_status === 'publishing' || photo.facebook_status === 'publishing';
                const isSocialPublished = photo.instagram_status === 'published' || photo.facebook_status === 'published';

                return (
                  <div
                    key={photo.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e2e0db] bg-white shadow-xs hover:shadow-md transition"
                  >
                    {/* Thumbnail click to open full preview modal */}
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      className="relative aspect-square w-full overflow-hidden bg-slate-100 text-left focus:outline-none"
                    >
                      <img
                        src={galleryImageUrl(photo.storage_path)}
                        alt={photo.title}
                        onError={(e) => {
                          const target = e.currentTarget;
                          const raw = (photo.storage_path || '').trim();
                          const clean = raw.replace(/^\/+/, '').replace(/^images\//, '');
                          if (clean && !target.src.endsWith(`/images/${clean}`)) {
                            target.src = `/images/${clean}`;
                          }
                        }}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Status Badges Overlay */}
                      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                        {!photo.published && (
                          <span className="rounded bg-amber-500/95 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                            Hidden
                          </span>
                        )}

                        {isSocialPublishing && (
                          <span className="rounded bg-blue-600/95 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs animate-pulse">
                            Syncing...
                          </span>
                        )}

                        {hasSocialError && !isSocialPublishing && (
                          <span className="rounded bg-red-600/95 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs flex items-center gap-0.5">
                            <ShieldAlert size={9} /> Alert
                          </span>
                        )}

                        {isSocialPublished && !hasSocialError && !isSocialPublishing && (
                          <div className="flex gap-1">
                            {photo.instagram_status === 'published' && (
                              <span className="rounded bg-pink-600/95 p-1 text-white shadow-xs" title="Published to Instagram">
                                <Instagram size={10} />
                              </span>
                            )}
                            {photo.facebook_status === 'published' && (
                              <span className="rounded bg-blue-600/95 p-1 text-white shadow-xs" title="Published to Facebook">
                                <Facebook size={10} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Card Content & Action Buttons */}
                    <div className="p-2.5 flex flex-col flex-1 justify-between bg-white border-t border-black/5">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{photo.category}</span>
                        <h4 className="font-bold text-xs text-[#0a1628] truncate mt-0.5" title={photo.title}>
                          {photo.title}
                        </h4>
                      </div>

                      {/* Quick Action Toolbar */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
                        <button
                          type="button"
                          onClick={() => setPublishModalPhoto(photo)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0a1628] px-2 py-1 text-[10px] font-bold text-white hover:bg-black transition"
                          title="Publish to Instagram & Facebook"
                        >
                          <Send size={10} /> Publish
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setCaptionModalPhoto(photo)}
                            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 transition"
                            title="Edit Caption"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === photo.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoToDelete(photo);
                            }}
                            className="rounded-lg p-1 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                            title="Delete Photo"
                          >
                            {deletingId === photo.id ? <LoaderCircle className="animate-spin" size={12} /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: FULL EXPANDED PHOTO DETAIL & PUBLISH CONTROLS */}
      {selectedPhoto && (() => {
        const selectedIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
        const hasPrev = selectedIndex > 0;
        const hasNext = selectedIndex >= 0 && selectedIndex < photos.length - 1;

        const goToPrev = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (hasPrev) setSelectedPhoto(photos[selectedIndex - 1]);
        };

        const goToNext = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (hasNext) setSelectedPhoto(photos[selectedIndex + 1]);
        };

        const isIgRetrying = retryingPlatform?.photoId === selectedPhoto.id && retryingPlatform?.platform === 'instagram';
        const isFbRetrying = retryingPlatform?.photoId === selectedPhoto.id && retryingPlatform?.platform === 'facebook';

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5"
            onClick={() => setSelectedPhoto(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative flex flex-col max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0a1628] text-white shadow-2xl border border-white/10"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5 bg-[#0c1b30]">
                <div>
                  <h3 className="font-bold text-base sm:text-lg">{selectedPhoto.title}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedPhoto.category} · {new Date(selectedPhoto.created_at).toLocaleDateString('en-IN')}{' '}
                    {photos.length > 1 && `(${selectedIndex + 1} of ${photos.length})`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto max-h-[calc(92vh-140px)]">
                {/* Image Container with Prev/Next controls */}
                <div className="relative flex items-center justify-center bg-black/50 p-4 overflow-hidden min-h-[220px]">
                  {hasPrev && (
                    <button
                      type="button"
                      onClick={goToPrev}
                      aria-label="Previous photo"
                      className="absolute left-3 z-10 rounded-full bg-black/70 p-2 text-white/90 backdrop-blur-xs hover:bg-black/90 hover:text-white transition shadow-md"
                    >
                      <ChevronLeft size={22} />
                    </button>
                  )}

                  <img
                    src={galleryImageUrl(selectedPhoto.storage_path)}
                    alt={selectedPhoto.title}
                    className="max-h-[38vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
                  />

                  {hasNext && (
                    <button
                      type="button"
                      onClick={goToNext}
                      aria-label="Next photo"
                      className="absolute right-3 z-10 rounded-full bg-black/70 p-2 text-white/90 backdrop-blur-xs hover:bg-black/90 hover:text-white transition shadow-md"
                    >
                      <ChevronRight size={22} />
                    </button>
                  )}
                </div>

                {/* Caption / Description Details */}
                <div className="p-4 sm:p-5 space-y-4 bg-[#081220]/70 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Social Caption</span>
                    <button
                      type="button"
                      onClick={() => setCaptionModalPhoto(selectedPhoto)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white underline"
                    >
                      <Pencil size={11} /> Edit Caption
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed bg-white/5 rounded-xl p-3 border border-white/5">
                    {selectedPhoto.caption || selectedPhoto.description || 'No caption set.'}
                  </p>

                  {/* PUBLISHING STATUS SUMMARY PANEL */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Publishing Status</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPublishModalPhoto(selectedPhoto);
                          setSelectedPhoto(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#c1272d] px-3 py-1 text-xs font-bold text-white hover:bg-[#a51f25] transition"
                      >
                        <Send size={12} /> Open Publish Dialog
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* 1. Website Status */}
                      <div className="flex items-center justify-between rounded-xl bg-black/20 p-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c1272d] text-white text-xs font-black">
                            SS
                          </span>
                          <div>
                            <span className="block text-xs font-bold text-white">Website Gallery</span>
                            <span className="block text-[10px] text-slate-400">Public school gallery</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              selectedPhoto.published
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {selectedPhoto.published ? 'Published' : 'Hidden'}
                          </span>
                          <button
                            type="button"
                            onClick={() => void toggle(selectedPhoto)}
                            className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20 transition"
                          >
                            {selectedPhoto.published ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      {/* 2. Instagram Status */}
                      <div className="rounded-xl bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
                              <Instagram size={16} />
                            </span>
                            <div>
                              <span className="block text-xs font-bold text-white">Instagram</span>
                              <span className="block text-[10px] text-slate-400">
                                {selectedPhoto.instagram_published_at
                                  ? `Published ${new Date(selectedPhoto.instagram_published_at).toLocaleDateString('en-IN')}`
                                  : 'Professional Account'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {selectedPhoto.instagram_status === 'published' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                                <Check size={12} /> Published
                              </span>
                            )}

                            {selectedPhoto.instagram_status === 'publishing' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
                                <LoaderCircle className="animate-spin" size={12} /> Publishing
                              </span>
                            )}

                            {selectedPhoto.instagram_status === 'failed' && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
                                  Failed
                                </span>
                                <button
                                  type="button"
                                  disabled={isIgRetrying}
                                  onClick={() => void handleRetry(selectedPhoto, 'instagram')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-50"
                                >
                                  {isIgRetrying ? <LoaderCircle className="animate-spin" size={12} /> : <RefreshCw size={12} />} Retry
                                </button>
                              </div>
                            )}

                            {(!selectedPhoto.instagram_status || selectedPhoto.instagram_status === 'pending') && (
                              <button
                                type="button"
                                disabled={isIgRetrying}
                                onClick={() => void handleRetry(selectedPhoto, 'instagram')}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20 transition disabled:opacity-50"
                              >
                                {isIgRetrying ? <LoaderCircle className="animate-spin" size={12} /> : <Send size={12} />} Publish
                              </button>
                            )}
                          </div>
                        </div>

                        {selectedPhoto.instagram_status === 'published' && selectedPhoto.instagram_post_id && (
                          <p className="mt-2 text-[10px] text-slate-400 font-mono">Meta Post ID: {selectedPhoto.instagram_post_id}</p>
                        )}

                        {selectedPhoto.instagram_status === 'failed' && selectedPhoto.instagram_error && (
                          <div className="mt-2.5 rounded-lg bg-red-950/40 border border-red-800/40 p-2.5 text-[11px] text-red-300">
                            <span className="font-bold block mb-0.5">Error details:</span>
                            {selectedPhoto.instagram_error}
                          </div>
                        )}
                      </div>

                      {/* 3. Facebook Page Status */}
                      <div className="rounded-xl bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2] text-white">
                              <Facebook size={16} />
                            </span>
                            <div>
                              <span className="block text-xs font-bold text-white">Facebook Page</span>
                              <span className="block text-[10px] text-slate-400">
                                {selectedPhoto.facebook_published_at
                                  ? `Published ${new Date(selectedPhoto.facebook_published_at).toLocaleDateString('en-IN')}`
                                  : 'Business Page'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {selectedPhoto.facebook_status === 'published' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                                <Check size={12} /> Published
                              </span>
                            )}

                            {selectedPhoto.facebook_status === 'publishing' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
                                <LoaderCircle className="animate-spin" size={12} /> Publishing
                              </span>
                            )}

                            {selectedPhoto.facebook_status === 'failed' && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
                                  Failed
                                </span>
                                <button
                                  type="button"
                                  disabled={isFbRetrying}
                                  onClick={() => void handleRetry(selectedPhoto, 'facebook')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-50"
                                >
                                  {isFbRetrying ? <LoaderCircle className="animate-spin" size={12} /> : <RefreshCw size={12} />} Retry
                                </button>
                              </div>
                            )}

                            {(!selectedPhoto.facebook_status || selectedPhoto.facebook_status === 'pending') && (
                              <button
                                type="button"
                                disabled={isFbRetrying}
                                onClick={() => void handleRetry(selectedPhoto, 'facebook')}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold hover:bg-white/20 transition disabled:opacity-50"
                              >
                                {isFbRetrying ? <LoaderCircle className="animate-spin" size={12} /> : <Send size={12} />} Publish
                              </button>
                            )}
                          </div>
                        </div>

                        {selectedPhoto.facebook_status === 'published' && selectedPhoto.facebook_post_id && (
                          <p className="mt-2 text-[10px] text-slate-400 font-mono">Meta Post ID: {selectedPhoto.facebook_post_id}</p>
                        )}

                        {selectedPhoto.facebook_status === 'failed' && selectedPhoto.facebook_error && (
                          <div className="mt-2.5 rounded-lg bg-red-950/40 border border-red-800/40 p-2.5 text-[11px] text-red-300">
                            <span className="font-bold block mb-0.5">Error details:</span>
                            {selectedPhoto.facebook_error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-white/10 p-4 sm:p-5 bg-[#060e1a]">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={deletingId === selectedPhoto.id}
                  onClick={() => setPhotoToDelete(selectedPhoto)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600/90 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition shadow-xs disabled:opacity-50"
                >
                  {deletingId === selectedPhoto.id ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />} Delete photo
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        photo={photoToDelete}
        isOpen={Boolean(photoToDelete)}
        isDeleting={Boolean(deletingId)}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={() => {
          if (photoToDelete) {
            void executeDelete(photoToDelete);
          }
        }}
      />

      {/* MODAL 2: DEDICATED PUBLISHING DIALOG MODAL */}
      <PublishModal
        photo={publishModalPhoto}
        isOpen={Boolean(publishModalPhoto)}
        onClose={() => setPublishModalPhoto(null)}
        onSuccess={() => void load()}
      />

      {/* MODAL 3: EDIT CAPTION MODAL */}
      <EditCaptionModal
        photo={captionModalPhoto}
        isOpen={Boolean(captionModalPhoto)}
        onClose={() => setCaptionModalPhoto(null)}
        onSuccess={() => void load()}
      />

      {/* MODAL 4: QUICK FACEBOOK POST MODAL */}
      <FacebookQuickPostModal
        isOpen={showFacebookQuickPost}
        onClose={() => setShowFacebookQuickPost(false)}
        onSuccess={() => void load()}
      />
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('site_settings').select('*').maybeSingle();
      if (data) setSettings(data as SiteSettings);
    };
    void load();
  }, []);

  if (!settings) return <LoadingScreen />;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await supabase
      .from('site_settings')
      .update({
        business_name: settings.business_name,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        address: settings.address,
        opening_hours: settings.opening_hours,
        instagram_url: settings.instagram_url || null,
        facebook_url: settings.facebook_url || null,
        google_maps_url: settings.google_maps_url,
        google_reviews_url: settings.google_reviews_url,
        social_auto_publish: settings.social_auto_publish ?? false,
        social_auto_publish_instagram: settings.social_auto_publish_instagram ?? true,
        social_auto_publish_facebook: settings.social_auto_publish_facebook ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', true);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const update = (field: keyof SiteSettings, value: unknown) => setSettings({ ...settings, [field]: value });

  return (
    <div>
      <PageHeading eyebrow="Business information" title="Settings" description="Keep public contact details, social links and auto-publishing defaults up to date." />
      <form onSubmit={save} className="mt-8 max-w-3xl rounded-2xl border border-[#e2e0db] bg-white p-6 sm:p-8 shadow-xs">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="business-name">Business name</label>
            <input
              id="business-name"
              value={settings.business_name}
              onChange={(event) => update('business_name', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="business-phone">Phone</label>
            <input
              id="business-phone"
              value={settings.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="business-whatsapp">WhatsApp</label>
            <input
              id="business-whatsapp"
              value={settings.whatsapp}
              onChange={(event) => update('whatsapp', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="business-hours">Opening hours</label>
            <input
              id="business-hours"
              value={settings.opening_hours}
              onChange={(event) => update('opening_hours', event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="business-address">Address</label>
            <textarea
              id="business-address"
              rows={3}
              value={settings.address}
              onChange={(event) => update('address', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="instagram-url">Instagram URL</label>
            <input
              id="instagram-url"
              type="url"
              value={settings.instagram_url || ''}
              onChange={(event) => update('instagram_url', event.target.value)}
              placeholder="Leave empty to hide"
            />
          </div>
          <div>
            <label htmlFor="facebook-url">Facebook URL</label>
            <input
              id="facebook-url"
              type="url"
              value={settings.facebook_url || ''}
              onChange={(event) => update('facebook_url', event.target.value)}
              placeholder="Leave empty to hide"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="maps-url">Google Maps URL</label>
            <input
              id="maps-url"
              type="url"
              value={settings.google_maps_url}
              onChange={(event) => update('google_maps_url', event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="reviews-url">Google Reviews URL</label>
            <input
              id="reviews-url"
              type="url"
              value={settings.google_reviews_url}
              onChange={(event) => update('google_reviews_url', event.target.value)}
            />
          </div>

          {/* Social Auto-Publish Preferences */}
          <div className="sm:col-span-2 rounded-2xl bg-[#faf9f6] border border-[#e2e0db] p-5 mt-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#c1272d]" />
              <h4 className="font-display font-extrabold text-sm text-[#0a1628]">Social Media Auto-Publishing Preferences</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure whether newly uploaded photos automatically post to social channels without requiring a manual click on each upload.
            </p>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.social_auto_publish ?? false}
                  onChange={(e) => update('social_auto_publish', e.target.checked)}
                  className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                />
                <div>
                  <span className="text-xs font-bold text-[#0a1628] block">Enable Auto-Publish by Default on Upload</span>
                  <span className="text-[11px] text-slate-500 block">
                    When disabled (recommended), photos are uploaded to website gallery first and published to social media via explicit action.
                  </span>
                </div>
              </label>

              {settings.social_auto_publish && (
                <div className="ml-7 grid sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-[#e2e0db]">
                    <input
                      type="checkbox"
                      checked={settings.social_auto_publish_instagram ?? true}
                      onChange={(e) => update('social_auto_publish_instagram', e.target.checked)}
                      className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                    />
                    <span className="text-xs font-bold text-slate-700">Auto-publish to Instagram</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-[#e2e0db]">
                    <input
                      type="checkbox"
                      checked={settings.social_auto_publish_facebook ?? true}
                      onChange={(e) => update('social_auto_publish_facebook', e.target.checked)}
                      className="h-4 w-4 rounded text-[#c1272d] focus:ring-[#c1272d]"
                    />
                    <span className="text-xs font-bold text-slate-700">Auto-publish to Facebook Page</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button type="submit" className="rounded-xl bg-[#c1272d] px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-[#a51f25] transition">
            Save settings
          </button>
          {saved && <span className="text-sm font-bold text-emerald-600">Settings successfully saved.</span>}
        </div>
      </form>
    </div>
  );
}
