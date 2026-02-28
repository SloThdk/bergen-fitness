'use client';

import { useState, useRef, useMemo } from 'react';
import { User, CreditCard, Calendar, Settings, LogOut, Check, ChevronRight, ChevronLeft, Camera, Shield, Bell, X, Dumbbell, Heart, Flame, Zap, Trophy, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

/* ── Data ──────────────────────────────────────────────── */

const PLANER = [
  { name: 'Aktiv', price: 249, period: '/mnd', hasClasses: false, features: ['Tilgang til treningsgulv', 'Garderobe og dusj', 'Fitness-app med treningslogg', 'Tilgang 06:00-22:00'] },
  { name: 'Trening', price: 449, period: '/mnd', hasClasses: true, features: ['Alt i Aktiv', 'Ubegrenset gruppetimer', 'Tilgang 24/7', '1 PT-introduksjonsokt', 'Kostholdsguide (digital)', 'Gjestekort x1/mnd'] },
  { name: 'Performance', price: 699, period: '/mnd', hasClasses: true, popular: true, features: ['Alt i Trening', '4 PT-okter/mnd', 'Naerings- og kostholdscoaching', 'Prioritert timebooking', 'Restitusjonssuite', 'Gjestekort x3/mnd', 'Manedsvis kroppsanalyse'] },
  { name: 'Elite', price: 999, period: '/mnd', hasClasses: true, features: ['Alt i Performance', 'Ubegrenset PT-okter', 'Personlig treningsprogram', 'Konkurranse- og sesongplanlegging', 'Ubegrenset gjestekort', 'Prioritert locker', 'Direkte tilgang til sjefstrener'] },
];

const TRAINERS = [
  { name: 'Erik Hansen', role: 'HIIT & Boksing', img: 'https://images.pexels.com/photos/5209197/pexels-photo-5209197.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', color: '#EF4444' },
  { name: 'Lise Dahl', role: 'Yoga & Pilates', img: 'https://images.pexels.com/photos/6916300/pexels-photo-6916300.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', color: '#8B5CF6' },
  { name: 'Mads Berg', role: 'Styrke & CrossFit', img: 'https://images.pexels.com/photos/14762174/pexels-photo-14762174.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', color: '#F97316' },
  { name: 'Sara Moe', role: 'Spinning & Kondisjon', img: 'https://images.pexels.com/photos/5669172/pexels-photo-5669172.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', color: '#06B6D4' },
];

const CLASS_TYPES = [
  { name: 'HIIT-Okt', icon: Flame, trainer: 0, duration: 45, capacity: 20 },
  { name: 'Yoga', icon: Heart, trainer: 1, duration: 60, capacity: 25 },
  { name: 'Spinning', icon: Zap, trainer: 3, duration: 45, capacity: 18 },
  { name: 'CrossFit', icon: Trophy, trainer: 2, duration: 60, capacity: 16 },
  { name: 'Boksing', icon: Flame, trainer: 0, duration: 60, capacity: 14 },
  { name: 'Pilates', icon: Heart, trainer: 1, duration: 50, capacity: 22 },
  { name: 'Styrketrening', icon: Dumbbell, trainer: 2, duration: 50, capacity: 20 },
  { name: 'Morgenokt', icon: Zap, trainer: 3, duration: 45, capacity: 15 },
];

const TIMES = ['06:00', '07:30', '09:00', '10:30', '12:00', '14:00', '16:00', '17:30', '18:30', '19:30'];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function generateClasses(date: Date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rng = seededRandom(seed);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) return []; // Sunday closed
  const count = dayOfWeek === 6 ? 4 : 6 + Math.floor(rng() * 3);
  const classes: { name: string; time: string; trainer: typeof TRAINERS[0]; duration: number; capacity: number; booked: number; icon: typeof Flame }[] = [];
  const usedTimes = new Set<string>();
  for (let i = 0; i < count; i++) {
    const ct = CLASS_TYPES[Math.floor(rng() * CLASS_TYPES.length)];
    let time = TIMES[Math.floor(rng() * TIMES.length)];
    let attempts = 0;
    while (usedTimes.has(time) && attempts < 10) { time = TIMES[Math.floor(rng() * TIMES.length)]; attempts++; }
    if (usedTimes.has(time)) continue;
    usedTimes.add(time);
    const booked = Math.floor(rng() * (ct.capacity + 2));
    classes.push({ name: ct.name, time, trainer: TRAINERS[ct.trainer], duration: ct.duration, capacity: ct.capacity, booked: Math.min(booked, ct.capacity), icon: ct.icon });
  }
  return classes.sort((a, b) => a.time.localeCompare(b.time));
}

const DAYS_NO = ['Son', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lor'];
const MONTHS_NO = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

function formatDateShort(d: Date) {
  return `${d.getDate()}. ${MONTHS_NO[d.getMonth()].slice(0, 3).toLowerCase()}`;
}

/* ── Component ──────────────────────────────────────────── */

interface UserDashboardProps {
  user: { name: string; email: string };
  onClose: () => void;
  onLogout: () => void;
}

export default function UserDashboard({ user, onClose, onLogout }: UserDashboardProps) {
  const [tab, setTab] = useState<'oversikt' | 'abonnement' | 'kalender' | 'profil' | 'innstillinger'>('oversikt');
  const [currentPlan, setCurrentPlan] = useState('Aktiv');
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBirthdate, setProfileBirthdate] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true, marketing: false });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [myBookings, setMyBookings] = useState<{ name: string; time: string; date: string; trainer: string }[]>([]);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const planData = PLANER.find(p => p.name === currentPlan);
  const hasClasses = planData?.hasClasses ?? false;

  const tabs = [
    { id: 'oversikt' as const, label: 'Oversikt', icon: User },
    { id: 'kalender' as const, label: 'Timeplan', icon: Calendar },
    { id: 'abonnement' as const, label: 'Abonnement', icon: CreditCard },
    { id: 'profil' as const, label: 'Profil', icon: User },
    { id: 'innstillinger' as const, label: 'Innstillinger', icon: Settings },
  ];

  // Calendar week
  const weekDays = useMemo(() => {
    const start = new Date(calendarDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [calendarDate]);

  const selectedDate = weekDays[selectedDay] || new Date();
  const dayClasses = useMemo(() => generateClasses(selectedDate), [selectedDate]);

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handlePurchase = () => {
    const errs: Record<string, string> = {};
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length !== 16) errs.cardNumber = 'Kortnummer ma vaere 16 siffer';
    if (!cardName.trim()) errs.cardName = 'Navn er obligatorisk';
    const exp = cardExpiry.replace('/', '');
    if (exp.length !== 4) errs.cardExpiry = 'Ugyldig utlopsdato';
    else { const m = parseInt(exp.slice(0, 2)); if (m < 1 || m > 12) errs.cardExpiry = 'Ugyldig maned'; }
    if (cardCvc.length < 3) errs.cardCvc = 'CVC ma vaere 3 siffer';
    if (Object.keys(errs).length) { setCardErrors(errs); return; }
    setCardErrors({});
    setPaymentSuccess(true);
    setCurrentPlan(buyingPlan!);
    setTimeout(() => {
      setPaymentSuccess(false);
      setBuyingPlan(null);
      setCardNumber(''); setCardExpiry(''); setCardCvc(''); setCardName('');
    }, 2000);
  };

  const isBooked = (name: string, time: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return myBookings.some(b => b.name === name && b.time === time && b.date === dateStr);
  };

  const bookClass = (cls: { name: string; time: string; trainer: typeof TRAINERS[0] }) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    setMyBookings(prev => [...prev, { name: cls.name, time: cls.time, date: dateStr, trainer: cls.trainer.name }]);
    showToast(`Bestilt: ${cls.name} kl. ${cls.time}`);
  };

  const cancelBooking = (idx: number) => {
    const b = myBookings[idx];
    setMyBookings(prev => prev.filter((_, i) => i !== idx));
    showToast(`Avbestilt: ${b.name} kl. ${b.time}`);
    setCancelConfirm(null);
  };

  const inputStyle = (error?: string): React.CSSProperties => ({
    background: 'rgba(255,255,255,0.05)', border: error ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '10px', padding: '12px 24px', color: '#86efac', fontSize: '14px', fontWeight: 600, zIndex: 400, whiteSpace: 'nowrap', backdropFilter: 'blur(8px)' }}>{toast}</div>
      )}

      {/* Cancel confirmation modal */}
      {cancelConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && setCancelConfirm(null)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(248,113,113,0.12)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} color="#f87171" />
            </div>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Avbestille time?</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '4px' }}>
              <strong>{myBookings[cancelConfirm]?.name}</strong> kl. {myBookings[cancelConfirm]?.time}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '24px' }}>med {myBookings[cancelConfirm]?.trainer}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelConfirm(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac', fontWeight: 700, fontSize: '14px' }}>
                Behold
              </button>
              <button onClick={() => cancelBooking(cancelConfirm)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 700, fontSize: '14px' }}>
                Avbestill
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '100%', maxWidth: '960px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(232,93,4,0.4)', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '17px' }}>{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '17px', lineHeight: 1.2 }}>{profileName || user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{currentPlan}</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>Aktiv</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'rgba(232,93,4,0.12)', border: '1px solid rgba(232,93,4,0.25)', color: 'var(--orange-light)', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', letterSpacing: '0.08em' }}>DEMO</span>
            <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)', padding: '4px' }}><X size={20} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '14px 24px 0', display: 'flex', gap: '2px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflowX: 'auto' }}
          className="day-tabs">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '10px 14px', fontSize: '12px', fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? 'var(--orange)' : 'rgba(255,255,255,0.45)', borderBottom: tab === t.id ? '2px solid var(--orange)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', marginBottom: '-1px', letterSpacing: '0.02em' }}>
                <Icon size={13} />{t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* ── OVERSIKT ── */}
          {tab === 'oversikt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Plan card */}
              <div style={{ background: 'linear-gradient(135deg, rgba(232,93,4,0.08), rgba(232,93,4,0.02))', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Ditt abonnement</div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, marginTop: '2px' }}>{currentPlan}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '26px', fontWeight: 800, color: 'var(--orange)' }}>kr {planData?.price}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>/maned</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button onClick={() => setTab('abonnement')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Oppgrader <ChevronRight size={13} />
                  </button>
                  {!hasClasses && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}><Calendar size={12} /> Gruppetimer ikke inkludert</span>}
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }} className="responsive-grid">
                {[
                  { label: 'Treningsokter', value: '24', sub: 'denne maneden', icon: Dumbbell },
                  { label: 'Neste time', value: myBookings.length > 0 ? myBookings[0].time : '--', sub: myBookings.length > 0 ? myBookings[0].name : 'Ingen bestilt', icon: Clock },
                  { label: 'Medlem siden', value: 'Jan 2025', sub: '14 dager', icon: Users },
                ].map(s => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.label} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <SIcon size={12} color="var(--orange)" />
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800 }}>{s.value}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* My bookings */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', fontFamily: 'var(--font-syne)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Mine bestillinger ({myBookings.length})</span>
                  {myBookings.length > 0 && <button onClick={() => setTab('kalender')} style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600 }}>Se timeplan</button>}
                </div>
                {myBookings.length === 0 ? (
                  <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                    <Calendar size={20} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 8px' }} />
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>Ingen bestilte timer enda</div>
                    {hasClasses && <button onClick={() => setTab('kalender')} style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>Se timeplanen</button>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {myBookings.slice(0, 4).map((b, i) => (
                      <div key={i} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{b.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>kl. {b.time}</span></div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{b.trainer} - {b.date}</div>
                        </div>
                        <button onClick={() => setCancelConfirm(i)} style={{ color: '#f87171', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(248,113,113,0.25)', borderRadius: '6px', padding: '4px 10px' }}>Avbestill</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={onLogout} style={{ color: '#f87171', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <LogOut size={14} /> Logg ut
              </button>
            </div>
          )}

          {/* ── KALENDER / TIMEPLAN ── */}
          {tab === 'kalender' && (
            <div>
              {!hasClasses ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={28} color="rgba(255,255,255,0.2)" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Gruppetimer er ikke tilgjengelig</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: '360px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                    Du er pa <strong>{currentPlan}</strong>-planen som ikke inkluderer gruppetimer. Oppgrader til Trening eller hoyere for tilgang til alle timer.
                  </p>
                  <div style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '12px', color: 'var(--orange-light)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                    <span style={{ background: 'var(--orange)', color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px' }}>DEMO</span>
                    Avhenger av valgt abonnement
                  </div>
                  <br />
                  <button onClick={() => setTab('abonnement')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 700 }}>
                    Oppgrader plan
                  </button>
                </div>
              ) : (
                <>
                  {/* Week navigation */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <button onClick={() => { const d = new Date(calendarDate); d.setDate(d.getDate() - 7); setCalendarDate(d); setSelectedDay(0); }}
                      style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronLeft size={16} />
                    </button>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '16px', fontWeight: 700 }}>
                        {MONTHS_NO[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                        Uke {Math.ceil((weekDays[0].getDate() + new Date(weekDays[0].getFullYear(), weekDays[0].getMonth(), 1).getDay()) / 7)}
                      </div>
                    </div>
                    <button onClick={() => { const d = new Date(calendarDate); d.setDate(d.getDate() + 7); setCalendarDate(d); setSelectedDay(0); }}
                      style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Day selector */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', overflowX: 'auto' }} className="day-tabs">
                    {weekDays.map((d, i) => {
                      const isToday = d.toDateString() === new Date().toDateString();
                      const isSunday = d.getDay() === 0;
                      return (
                        <button key={i} onClick={() => setSelectedDay(i)}
                          style={{ flex: '1 0 0', minWidth: '48px', padding: '10px 4px', borderRadius: '10px', textAlign: 'center',
                            background: selectedDay === i ? 'var(--orange)' : 'var(--navy-mid)',
                            border: isToday && selectedDay !== i ? '1px solid rgba(232,93,4,0.4)' : selectedDay === i ? 'none' : '1px solid rgba(255,255,255,0.06)',
                            opacity: isSunday ? 0.4 : 1 }}>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: selectedDay === i ? '#fff' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{DAYS_NO[d.getDay()]}</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: selectedDay === i ? '#fff' : 'rgba(255,255,255,0.8)', marginTop: '2px' }}>{d.getDate()}</div>
                          {isToday && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: selectedDay === i ? '#fff' : 'var(--orange)', margin: '4px auto 0' }} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Classes */}
                  {selectedDate.getDay() === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                      <Calendar size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      Senteret er stengt pa sondager
                    </div>
                  ) : dayClasses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Ingen timer denne dagen</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {dayClasses.map((cls, i) => {
                        const isFull = cls.booked >= cls.capacity;
                        const spotsLeft = cls.capacity - cls.booked;
                        const booked = isBooked(cls.name, cls.time);
                        const Icon = cls.icon;
                        return (
                          <div key={i} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            {/* Trainer image */}
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                              <Image src={cls.trainer.img} alt={cls.trainer.name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icon size={13} color={cls.trainer.color} />
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{cls.name}</span>
                              </div>
                              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                                {cls.trainer.name} - {cls.duration} min
                              </div>
                            </div>
                            {/* Time + spots */}
                            <div style={{ textAlign: 'right', minWidth: '80px' }}>
                              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '14px', fontWeight: 700 }}>{cls.time}</div>
                              <div style={{ fontSize: '11px', color: isFull ? '#f87171' : spotsLeft <= 3 ? '#fb923c' : 'rgba(255,255,255,0.35)' }}>
                                {isFull ? 'Fullt' : `${spotsLeft}/${cls.capacity} plasser`}
                              </div>
                            </div>
                            {/* Action */}
                            <button onClick={() => {
                              if (booked) return;
                              if (isFull) { showToast('Satt pa ventelisten!'); return; }
                              bookClass(cls);
                            }}
                              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, minWidth: '90px',
                                background: booked ? 'rgba(74,222,128,0.1)' : isFull ? 'transparent' : 'var(--orange)',
                                border: booked ? '1px solid rgba(74,222,128,0.3)' : isFull ? '1px solid rgba(255,255,255,0.12)' : 'none',
                                color: booked ? '#86efac' : isFull ? 'rgba(255,255,255,0.35)' : '#fff' }}>
                              {booked ? 'Bestilt' : isFull ? 'Venteliste' : 'Bestill'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* My upcoming bookings */}
                  {myBookings.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-syne)', marginBottom: '10px' }}>Mine bestillinger</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {myBookings.map((b, i) => (
                          <div key={i} style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '13px', color: '#86efac' }}>{b.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>kl. {b.time}</span></div>
                              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{b.trainer} - {b.date}</div>
                            </div>
                            <button onClick={() => setCancelConfirm(i)} style={{ color: '#f87171', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(248,113,113,0.25)', borderRadius: '6px', padding: '5px 12px' }}>
                              Avbestill
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ABONNEMENT ── */}
          {tab === 'abonnement' && !buyingPlan && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Velg abonnement</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Oppgrader eller endre planen din. Ingen bindingstid.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="responsive-grid">
                {PLANER.map(plan => {
                  const isCurrent = plan.name === currentPlan;
                  return (
                    <div key={plan.name} style={{ background: 'var(--navy-mid)', border: plan.popular ? '2px solid var(--orange)' : isCurrent ? '2px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', position: 'relative' }}>
                      {plan.popular && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--orange)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Mest Populaer</div>}
                      {isCurrent && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Din plan</div>}
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>{plan.name}</div>
                      <div style={{ marginBottom: '14px' }}>
                        <span style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800 }}>kr {plan.price}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{plan.period}</span>
                      </div>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
                        {plan.features.slice(0, 5).map(f => (
                          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'rgba(255,255,255,0.55)' }}>
                            <Check size={11} color="var(--orange)" strokeWidth={3} style={{ flexShrink: 0 }} />{f}
                          </li>
                        ))}
                        {plan.features.length > 5 && <li style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', paddingLeft: '17px' }}>+{plan.features.length - 5} mer</li>}
                      </ul>
                      {!plan.hasClasses && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} /> Ingen gruppetimer</div>}
                      <button onClick={() => !isCurrent && setBuyingPlan(plan.name)}
                        style={{ width: '100%', padding: '10px', background: isCurrent ? 'rgba(74,222,128,0.08)' : plan.popular ? 'var(--orange)' : 'rgba(232,93,4,0.85)', color: isCurrent ? '#86efac' : '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer', opacity: isCurrent ? 0.8 : 1 }}>
                        {isCurrent ? 'Aktiv plan' : 'Velg plan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAYMENT FORM */}
          {tab === 'abonnement' && buyingPlan && (
            <div style={{ maxWidth: '420px', margin: '0 auto' }}>
              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: '56px', height: '56px', background: 'rgba(74,222,128,0.12)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={26} color="#86efac" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Betaling gjennomfort!</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Du er na oppgradert til <strong>{buyingPlan}</strong>.</p>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '8px' }}>Demo: ingen ekte betaling prosessert</p>
                </div>
              ) : (
                <>
                  <button onClick={() => setBuyingPlan(null)} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ChevronLeft size={14} /> Tilbake til planer
                  </button>
                  <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Oppgraderer til</div>
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>{buyingPlan}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, color: 'var(--orange)' }}>kr {PLANER.find(p => p.name === buyingPlan)?.price}/mnd</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-syne)', marginBottom: '14px' }}>Kortdetaljer</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Navn pa kortet</label>
                      <input type="text" placeholder="Fullt navn" value={cardName} onChange={e => { setCardName(e.target.value); setCardErrors(prev => ({ ...prev, cardName: '' })); }} style={inputStyle(cardErrors.cardName)} />
                      {cardErrors.cardName && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px' }}>{cardErrors.cardName}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Kortnummer</label>
                      <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => { setCardNumber(formatCard(e.target.value)); setCardErrors(prev => ({ ...prev, cardNumber: '' })); }} style={inputStyle(cardErrors.cardNumber)} maxLength={19} />
                      {cardErrors.cardNumber && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px' }}>{cardErrors.cardNumber}</p>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Utloper</label>
                        <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => { setCardExpiry(formatExpiry(e.target.value)); setCardErrors(prev => ({ ...prev, cardExpiry: '' })); }} style={inputStyle(cardErrors.cardExpiry)} maxLength={5} />
                        {cardErrors.cardExpiry && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px' }}>{cardErrors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>CVC</label>
                        <input type="text" placeholder="123" value={cardCvc} onChange={e => { setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3)); setCardErrors(prev => ({ ...prev, cardCvc: '' })); }} style={inputStyle(cardErrors.cardCvc)} maxLength={3} />
                        {cardErrors.cardCvc && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px' }}>{cardErrors.cardCvc}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '2px' }}>
                      <Shield size={12} /> Kryptert og sikker betaling
                    </div>
                    <button onClick={handlePurchase} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}>
                      Betal kr {PLANER.find(p => p.name === buyingPlan)?.price}/mnd
                    </button>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', textAlign: 'center' }}>Demo: ingen ekte betaling prosesseres</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── PROFIL ── */}
          {tab === 'profil' && (
            <div style={{ maxWidth: '420px' }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Min profil</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(232,93,4,0.4)' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '28px' }}>{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <button onClick={() => showToast('Profilbilde oppdatert!')} style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '26px', height: '26px', background: 'var(--orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--navy)' }}>
                    <Camera size={12} color="#fff" />
                  </button>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{profileName || user.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{currentPlan}-medlem</div>
                  <button onClick={() => showToast('Profilbilde oppdatert!')} style={{ color: 'var(--orange)', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>Endre bilde</button>
                </div>
              </div>

              {profileSaved && (
                <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#86efac', fontSize: '12px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} /> Profilen er oppdatert
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Fullt navn</label>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>E-post</label>
                  <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Telefon</label>
                  <input type="tel" placeholder="+47 000 00 000" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Fodselsdato</label>
                  <input type="date" value={profileBirthdate} onChange={e => setProfileBirthdate(e.target.value)} style={{ ...inputStyle(), colorScheme: 'dark' }} />
                </div>
                <button onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500); }}
                  style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                  Lagre endringer
                </button>
              </div>
            </div>
          )}

          {/* ── INNSTILLINGER ── */}
          {tab === 'innstillinger' && (
            <div style={{ maxWidth: '420px' }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Innstillinger</div>

              {settingsSaved && (
                <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#86efac', fontSize: '12px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} /> Innstillinger lagret
                </div>
              )}

              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} color="var(--orange)" /> Varsler
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'email' as const, label: 'E-postvarsler', desc: 'Bekreftelser og paminneringer' },
                    { key: 'sms' as const, label: 'SMS-varsler', desc: 'Paminneringer 1 time for' },
                    { key: 'push' as const, label: 'Push-varsler', desc: 'Varsler i sanntid' },
                    { key: 'marketing' as const, label: 'Nyhetsbrev', desc: 'Tilbud og treningstips' },
                  ].map(n => (
                    <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{n.label}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{n.desc}</div>
                      </div>
                      <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                        style={{ width: '40px', height: '22px', borderRadius: '11px', background: notifications[n.key] ? 'var(--orange)' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: notifications[n.key] ? '21px' : '3px', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="var(--orange)" /> Sikkerhet
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['Endre passord', 'To-faktor autentisering', 'Last ned mine data (GDPR)'].map(label => (
                    <button key={label} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{label}</span>
                      <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2500); }}
                style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: 700, width: '100%' }}>
                Lagre innstillinger
              </button>

              <div style={{ marginTop: '28px', padding: '16px', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>Faresone</div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '12px' }}>Sletter alle data permanent.</p>
                <button onClick={onLogout} style={{ color: '#f87171', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(248,113,113,0.25)', borderRadius: '8px', padding: '8px 16px' }}>Slett konto</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
