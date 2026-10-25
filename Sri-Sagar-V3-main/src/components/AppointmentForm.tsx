import { useMemo, useState } from 'react';
import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase, phoneUrl, whatsappUrl } from '@/lib/supabase';
import { courses, timeSlots } from '@/lib/types';

interface BookingFormProps { phone: string; whatsapp: string; }
interface BookingValues { name: string; phone: string; email: string; course: string; preferred_date: string; preferred_time: string; message: string; }
interface BookingSuccess { appointment_id: string; name: string; course: string; preferred_date: string; preferred_time: string; }

const initialValues: BookingValues = { name: '', phone: '', email: '', course: '', preferred_date: '', preferred_time: '', message: '' };

function formatDate(value: string, lang: string): string {
  const locale = lang === 'kn' ? 'kn-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

export default function AppointmentForm({ phone, whatsapp }: BookingFormProps) {
  const { language, t } = useLanguage();
  const [values, setValues] = useState<BookingValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingValues, string>>>({});
  const [success, setSuccess] = useState<BookingSuccess | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const minimumDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const update = (field: keyof BookingValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof BookingValues, string>> = {};
    if (!values.name.trim()) next.name = t.formErrName;
    if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(values.phone.replace(/[\s-]/g, ''))) next.phone = t.formErrPhone;
    if (!values.course) next.course = t.formErrCourse;
    if (!values.preferred_date) next.preferred_date = t.formErrDate;
    else if (values.preferred_date < minimumDate) next.preferred_date = t.formErrFutureDate;
    if (!values.preferred_time) next.preferred_time = t.formErrTime;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError('');
    const { data, error } = await supabase.rpc('create_appointment', {
      p_name: values.name.trim(),
      p_phone: values.phone.trim(),
      p_email: values.email.trim() || null,
      p_course: values.course,
      p_preferred_date: values.preferred_date,
      p_preferred_time: values.preferred_time,
      p_message: values.message.trim() || null
    });
    setSaving(false);
    if (error || !data || data.length === 0) {
      console.error('appointment submission failed', error);
      setServerError(t.formErrServer);
      return;
    }
    setSuccess(data[0] as BookingSuccess);
  };

  if (success) {
    const localizedCourse = t.courseNames[success.course] || success.course;
    const appointmentMessage = `Hello Sri Sagar Driving School, I have submitted appointment ${success.appointment_id} for ${success.course} on ${formatDate(success.preferred_date, language)} at ${success.preferred_time}.`;
    return (
      <div className="flex min-h-[30rem] flex-col justify-center rounded-[2rem] border border-[#e2e0db] bg-white p-7 text-center shadow-xl shadow-black/5 sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0a1628] text-white">
          <Check size={30} />
        </span>
        <p className="mt-6 text-[11px] font-bold font-sans uppercase tracking-[0.25em] text-[#c1272d]">{t.successReceivedEyebrow}</p>
        <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-[#0a1628]">{t.successThankYou}, {success.name.split(' ')[0]}.</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 font-sans text-slate-600">{t.successDesc}</p>
        <div className="mx-auto mt-7 w-full max-w-sm rounded-2xl bg-[#f4f1ea] p-5 text-left text-sm font-sans">
          <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
            <span className="text-slate-500">{t.successApptId}</span>
            <strong className="text-[#0a1628]">{success.appointment_id}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4">
            <span className="text-slate-500">{t.successCourse}</span>
            <strong className="text-right text-[#0a1628]">{localizedCourse}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4">
            <span className="text-slate-500">{t.successDate}</span>
            <strong className="text-right text-[#0a1628]">{formatDate(success.preferred_date, language)}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4">
            <span className="text-slate-500">{t.successTime}</span>
            <strong className="text-right text-[#0a1628]">{success.preferred_time}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4">
            <span className="text-slate-500">{t.successStatus}</span>
            <strong className="text-right capitalize text-amber-600">{t.successPendingText}</strong>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row font-sans">
          <a href={phoneUrl(phone)} className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#0a1628] px-4 py-3 text-sm font-bold text-white">
            {t.successCallBtn}
          </a>
          <a href={whatsappUrl(whatsapp, appointmentMessage)} className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#c1272d] px-4 py-3 text-sm font-bold text-white">
            {t.successWhatsappBtn}
          </a>
        </div>
        <button
          type="button"
          onClick={() => { setSuccess(null); setValues(initialValues); }}
          className="mt-5 text-xs font-bold font-sans text-slate-500 underline underline-offset-4"
        >
          {t.successBookAnother}
        </button>
      </div>
    );
  }

  const field = (name: keyof BookingValues, label: string, input: React.ReactNode) => (
    <div>
      <label htmlFor={name}>{label}</label>
      {input}
      {errors[name] && <p className="mt-1.5 text-xs font-semibold font-sans text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-[2rem] border border-[#e2e0db] bg-white p-6 shadow-xl shadow-black/5 sm:p-10">
      <div className="mb-8">
        <p className="text-[11px] font-bold font-sans uppercase tracking-[0.3em] text-[#c1272d]">{t.formEyebrow}</p>
        <h3 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-[#0a1628]">{t.formTitle}</h3>
        <p className="mt-2 text-sm font-sans text-slate-500">{t.formSubtitle}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field('name', t.formNameLabel, <input id="name" value={values.name} onChange={(event) => update('name', event.target.value)} placeholder={t.formNamePlaceholder} />)}
        {field('phone', t.formPhoneLabel, <input id="phone" value={values.phone} onChange={(event) => update('phone', event.target.value)} type="tel" inputMode="tel" placeholder={t.formPhonePlaceholder} />)}
        {field('email', t.formEmailLabel, <input id="email" value={values.email} onChange={(event) => update('email', event.target.value)} type="email" placeholder={t.formEmailPlaceholder} />)}
        {field('course', t.formCourseLabel, (
          <select id="course" value={values.course} onChange={(event) => update('course', event.target.value)}>
            <option value="">{t.formCourseSelect}</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {t.courseNames[course] || course}
              </option>
            ))}
          </select>
        ))}
        {field('preferred_date', t.formDateLabel, <input id="preferred_date" value={values.preferred_date} onChange={(event) => update('preferred_date', event.target.value)} type="date" min={minimumDate} />)}
        {field('preferred_time', t.formTimeLabel, (
          <select id="preferred_time" value={values.preferred_time} onChange={(event) => update('preferred_time', event.target.value)}>
            <option value="">{t.formTimeSelect}</option>
            {timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        ))}
        <div className="sm:col-span-2">
          {field('message', t.formMessageLabel, <textarea id="message" value={values.message} onChange={(event) => update('message', event.target.value)} rows={4} placeholder={t.formMessagePlaceholder} />)}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="group mt-1 inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#c1272d] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/15 transition hover:bg-[#a51f25] disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
        >
          {saving ? (
            <>
              <LoaderCircle size={18} className="animate-spin" /> {t.formBookingLoading}
            </>
          ) : (
            <>
              {t.formSubmitBtn} <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </>
          )}
        </button>
        {serverError && <p className="text-sm font-semibold text-red-600 sm:col-span-2">{serverError}</p>}
      </div>
    </form>
  );
}
