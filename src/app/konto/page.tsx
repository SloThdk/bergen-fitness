'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, CreditCard, Calendar, Settings, LogOut, Check, ChevronRight, ChevronLeft, Camera, Shield, Bell, X, Dumbbell, Heart, Flame, Zap, Trophy, Clock, Users, AlertTriangle, Lock, Download, Key } from 'lucide-react';

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

const TIMES = ['06:00','07:30','09:00','10:30','12:00','14:00','16:00','17:30','18:30','19:30'];
const DAYS_NO = ['Son','Man','Tir','Ons','Tor','Fre','Lor'];
const MONTHS_NO = ['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];

function seededRandom(seed: number) { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; }; }

function generateClasses(date: Date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rng = seededRandom(seed);
  if (date.getDay() === 0) return [];
  const count = date.getDay() === 6 ? 4 : 6 + Math.floor(rng() * 3);
  const classes: { name: string; time: string; trainer: typeof TRAINERS[0]; duration: number; capacity: number; booked: number; icon: typeof Flame }[] = [];
  const usedTimes = new Set<string>();
  for (let i = 0; i < count; i++) {
    const ct = CLASS_TYPES[Math.floor(rng() * CLASS_TYPES.length)];
    let time = TIMES[Math.floor(rng() * TIMES.length)];
    let att = 0;
    while (usedTimes.has(time) && att < 10) { time = TIMES[Math.floor(rng() * TIMES.length)]; att++; }
    if (usedTimes.has(time)) continue;
    usedTimes.add(time);
    const booked = Math.floor(rng() * (ct.capacity + 2));
    classes.push({ name: ct.name, time, trainer: TRAINERS[ct.trainer], duration: ct.duration, capacity: ct.capacity, booked: Math.min(booked, ct.capacity), icon: ct.icon });
  }
  return classes.sort((a, b) => a.time.localeCompare(b.time));
}

function getMonday(d: Date) { const r = new Date(d); const day = r.getDay(); r.setDate(r.getDate() - day + (day === 0 ? -6 : 1)); r.setHours(0,0,0,0); return r; }

export default function KontoPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<'oversikt' | 'kalender' | 'abonnement' | 'profil' | 'innstillinger'>('oversikt');
  const [currentPlan, setCurrentPlan] = useState('Aktiv');
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBirthdate, setProfileBirthdate] = useState('');
  const [toast, setToast] = useState('');
  const [calendarDate, setCalendarDate] = useState(() => getMonday(new Date()));
  const [myBookings, setMyBookings] = useState<{ name: string; time: string; date: string; trainer: string }[]>([]);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; });
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true, marketing: false });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [cancelSubConfirm, setCancelSubConfirm] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => {
    try { const u = sessionStorage.getItem('bf_user'); if (u) { const parsed = JSON.parse(u); setUser(parsed); setProfileName(parsed.name); setProfileEmail(parsed.email); } } catch {}
    setChecking(false);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const planData = PLANER.find(p => p.name === currentPlan);
  const hasClasses = planData?.hasClasses ?? false;

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(calendarDate); d.setDate(calendarDate.getDate() + i); return d; }), [calendarDate]);
  const selectedDate = weekDays[selectedDay] || new Date();
  const dayClasses = useMemo(() => generateClasses(selectedDate), [selectedDate]);

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  const handlePurchase = () => {
    const errs: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, '').length !== 16) errs.cardNumber = 'Kortnummer ma vaere 16 siffer';
    if (!cardName.trim()) errs.cardName = 'Navn er obligatorisk';
    const exp = cardExpiry.replace('/', '');
    if (exp.length !== 4) errs.cardExpiry = 'Ugyldig';
    if (cardCvc.length < 3) errs.cardCvc = 'Ugyldig CVC';
    if (Object.keys(errs).length) { setCardErrors(errs); return; }
    setPaymentSuccess(true);
    setCurrentPlan(buyingPlan!);
    setTimeout(() => { setPaymentSuccess(false); setBuyingPlan(null); setCardNumber(''); setCardExpiry(''); setCardCvc(''); setCardName(''); setCardErrors({}); }, 2000);
  };

  const isBooked = (name: string, time: string) => myBookings.some(b => b.name === name && b.time === time && b.date === selectedDate.toISOString().split('T')[0]);
  const bookClass = (cls: { name: string; time: string; trainer: typeof TRAINERS[0] }) => {
    setMyBookings(prev => [...prev, { name: cls.name, time: cls.time, date: selectedDate.toISOString().split('T')[0], trainer: cls.trainer.name }]);
    showToast(`Bestilt: ${cls.name} kl. ${cls.time}`);
  };
  const cancelBooking = (idx: number) => { const b = myBookings[idx]; setMyBookings(prev => prev.filter((_, i) => i !== idx)); showToast(`Avbestilt: ${b.name}`); setCancelConfirm(null); };

  const handleLogout = () => { try { sessionStorage.removeItem('bf_user'); } catch {} router.push('/'); };

  const inputStyle = (err?: string): React.CSSProperties => ({
    background: 'rgba(255,255,255,0.05)', border: err ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box',
  });

  if (checking) return null;
  if (!user) { if (typeof window !== 'undefined') router.push('/'); return null; }

  const tabs = [
    { id: 'oversikt' as const, label: 'Oversikt', icon: User },
    { id: 'kalender' as const, label: 'Timeplan', icon: Calendar },
    { id: 'abonnement' as const, label: 'Abonnement', icon: CreditCard },
    { id: 'profil' as const, label: 'Profil', icon: User },
    { id: 'innstillinger' as const, label: 'Innstillinger', icon: Settings },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', color: '#fff' }}>
      {/* Toast */}
      {toast && <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '10px', padding: '12px 24px', color: '#86efac', fontSize: '14px', fontWeight: 600, zIndex: 400, whiteSpace: 'nowrap', backdropFilter: 'blur(8px)' }}>{toast}</div>}

      {/* Cancel booking confirm */}
      {cancelConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && setCancelConfirm(null)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <AlertTriangle size={28} color="#f87171" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Avbestille time?</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '4px' }}><strong>{myBookings[cancelConfirm]?.name}</strong> kl. {myBookings[cancelConfirm]?.time}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '20px' }}>med {myBookings[cancelConfirm]?.trainer}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelConfirm(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac', fontWeight: 700, fontSize: '14px' }}>Behold</button>
              <button onClick={() => cancelBooking(cancelConfirm)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 700, fontSize: '14px' }}>Avbestill</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && setDeleteConfirm(false)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <AlertTriangle size={32} color="#f87171" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f87171' }}>Slette kontoen din permanent?</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>Alle dine data, bestillinger, treningshistorikk og abonnement vil bli slettet permanent. Denne handlingen kan <strong style={{ color: '#f87171' }}>ikke angres</strong>.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, fontSize: '14px' }}>Avbryt</button>
              <button onClick={() => { setDeleteConfirm(false); showToast('Konto slettet (demo)'); setTimeout(handleLogout, 1500); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', fontWeight: 700, fontSize: '14px' }}>Slett permanent</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel subscription confirm */}
      {cancelSubConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && setCancelSubConfirm(false)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <AlertTriangle size={28} color="#fbbf24" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Avbestille abonnement?</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>Du vil miste tilgang til alle fordeler i <strong>{currentPlan}</strong>-planen ved slutten av navaerende fakturaperiode.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelSubConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac', fontWeight: 700, fontSize: '14px' }}>Behold plan</button>
              <button onClick={() => { setCancelSubConfirm(false); setCurrentPlan('Aktiv'); showToast('Abonnement avbestilt. Nedgradert til Aktiv.'); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontWeight: 700, fontSize: '14px' }}>Avbestill</button>
            </div>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {changePassword && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && setChangePassword(false)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Endre passord</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Navaerende passord</label>
                <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} style={inputStyle()} placeholder="Ditt navaerende passord" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Nytt passord</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle()} placeholder="Minst 8 tegn" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Bekreft nytt passord</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle()} placeholder="Gjenta nytt passord" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => setChangePassword(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: '14px' }}>Avbryt</button>
                <button onClick={() => { setChangePassword(false); setOldPw(''); setNewPw(''); setConfirmPw(''); showToast('Passord oppdatert!'); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--orange)', color: '#fff', fontWeight: 700, fontSize: '14px' }}>Lagre</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top header */}
      <div style={{ background: 'var(--navy-mid)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
            <div style={{ background: 'var(--orange)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dumbbell size={14} color="#fff" /></div>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '16px' }}>Bergen<span style={{ color: 'var(--orange)' }}>Fitness</span></span>
          </a>
          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Min konto</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: 'rgba(232,93,4,0.12)', border: '1px solid rgba(232,93,4,0.25)', color: 'var(--orange-light)', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', letterSpacing: '0.08em' }}>DEMO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{user.name}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '0', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <aside style={{ width: '220px', flexShrink: 0, paddingTop: '28px', paddingRight: '24px', borderRight: '1px solid rgba(255,255,255,0.06)' }} className="konto-sidebar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: active ? 'rgba(232,93,4,0.1)' : 'transparent', border: active ? '1px solid rgba(232,93,4,0.25)' : '1px solid transparent', color: active ? '#fff' : 'rgba(255,255,255,0.5)', width: '100%', textAlign: 'left' }}>
                  <Icon size={15} color={active ? 'var(--orange)' : 'rgba(255,255,255,0.35)'} />
                  <span style={{ fontSize: '13px', fontWeight: active ? 700 : 400 }}>{t.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', color: '#f87171', fontSize: '13px', fontWeight: 600, width: '100%', textAlign: 'left' }}>
              <LogOut size={15} /> Logg ut
            </button>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 0 80px 32px', minWidth: 0 }}>

          {/* ── OVERSIKT ── */}
          {tab === 'oversikt' && (
            <div style={{ maxWidth: '700px' }}>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>Velkommen, {user.name.split(' ')[0]}</h1>
              <div style={{ background: 'linear-gradient(135deg, rgba(232,93,4,0.08), rgba(232,93,4,0.02))', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Ditt abonnement</div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{currentPlan}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800, color: 'var(--orange)' }}>kr {planData?.price}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>/maned</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button onClick={() => setTab('abonnement')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '9px 18px', fontSize: '12px', fontWeight: 700 }}>Oppgrader</button>
                  {currentPlan !== 'Aktiv' && <button onClick={() => setCancelSubConfirm(true)} style={{ color: '#f87171', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(248,113,113,0.25)', borderRadius: '8px', padding: '9px 18px' }}>Avbestill abonnement</button>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }} className="responsive-grid">
                {[
                  { label: 'Treningsokter', value: '24', sub: 'denne maneden', icon: Dumbbell },
                  { label: 'Neste time', value: myBookings.length > 0 ? myBookings[0].time : '--', sub: myBookings.length > 0 ? myBookings[0].name : 'Ingen bestilt', icon: Clock },
                  { label: 'Medlem siden', value: 'Jan 2025', sub: '14 dager', icon: Users },
                ].map(s => { const I = s.icon; return (
                  <div key={s.label} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><I size={12} color="var(--orange)" /><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</span></div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800 }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.sub}</div>
                  </div>
                ); })}
              </div>
              {myBookings.length > 0 && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-syne)', marginBottom: '10px' }}>Mine bestillinger</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {myBookings.map((b, i) => (
                      <div key={i} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{b.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>kl. {b.time}</span></div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{b.trainer} - {b.date}</div>
                        </div>
                        <button onClick={() => setCancelConfirm(i)} style={{ color: '#f87171', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(248,113,113,0.25)', borderRadius: '6px', padding: '6px 14px' }}>Avbestill</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── KALENDER ── */}
          {tab === 'kalender' && (
            <div style={{ maxWidth: '700px' }}>
              {!hasClasses ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Calendar size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Gruppetimer er ikke tilgjengelig</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.6 }}>Du er pa <strong>{currentPlan}</strong>-planen. Oppgrader til Trening eller hoyere for tilgang til alle timer.</p>
                  <div style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '10px', padding: '10px 16px', fontSize: '12px', color: 'var(--orange-light)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}><span style={{ background: 'var(--orange)', color: '#fff', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px' }}>DEMO</span> Avhenger av valgt abonnement</div>
                  <br /><button onClick={() => setTab('abonnement')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 700 }}>Oppgrader plan</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <button onClick={() => { const d = new Date(calendarDate); d.setDate(d.getDate() - 7); setCalendarDate(d); setSelectedDay(0); }} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 700 }}>{MONTHS_NO[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}</div>
                    </div>
                    <button onClick={() => { const d = new Date(calendarDate); d.setDate(d.getDate() + 7); setCalendarDate(d); setSelectedDay(0); }} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }} className="day-tabs">
                    {weekDays.map((d, i) => { const isToday = d.toDateString() === new Date().toDateString(); const isSun = d.getDay() === 0; return (
                      <button key={i} onClick={() => setSelectedDay(i)} style={{ flex: '1 0 0', minWidth: '52px', padding: '10px 4px', borderRadius: '10px', textAlign: 'center', background: selectedDay === i ? 'var(--orange)' : 'var(--navy-mid)', border: isToday && selectedDay !== i ? '1px solid rgba(232,93,4,0.4)' : selectedDay === i ? 'none' : '1px solid rgba(255,255,255,0.06)', opacity: isSun ? 0.4 : 1 }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: selectedDay === i ? '#fff' : 'rgba(255,255,255,0.4)' }}>{DAYS_NO[d.getDay()]}</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: selectedDay === i ? '#fff' : 'rgba(255,255,255,0.8)', marginTop: '2px' }}>{d.getDate()}</div>
                        {isToday && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: selectedDay === i ? '#fff' : 'var(--orange)', margin: '4px auto 0' }} />}
                      </button>
                    ); })}
                  </div>
                  {selectedDate.getDay() === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)' }}>Senteret er stengt pa sondager</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dayClasses.map((cls, i) => { const isFull = cls.booked >= cls.capacity; const spots = cls.capacity - cls.booked; const booked = isBooked(cls.name, cls.time); const Icon = cls.icon; return (
                        <div key={i} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                            <Image src={cls.trainer.img} alt={cls.trainer.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                          </div>
                          <div style={{ flex: 1, minWidth: '140px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon size={14} color={cls.trainer.color} /><span style={{ fontWeight: 600, fontSize: '15px' }}>{cls.name}</span></div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>{cls.trainer.name} - {cls.duration} min</div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}>
                            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '15px', fontWeight: 700 }}>{cls.time}</div>
                            <div style={{ fontSize: '11px', color: isFull ? '#f87171' : spots <= 3 ? '#fb923c' : 'rgba(255,255,255,0.35)' }}>{isFull ? 'Fullt' : `${spots}/${cls.capacity}`}</div>
                          </div>
                          <button onClick={() => { if (booked) return; if (isFull) { showToast('Satt pa ventelisten!'); return; } bookClass(cls); }}
                            style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, minWidth: '100px', background: booked ? 'rgba(74,222,128,0.1)' : isFull ? 'transparent' : 'var(--orange)', border: booked ? '1px solid rgba(74,222,128,0.3)' : isFull ? '1px solid rgba(255,255,255,0.12)' : 'none', color: booked ? '#86efac' : isFull ? 'rgba(255,255,255,0.35)' : '#fff' }}>
                            {booked ? 'Bestilt' : isFull ? 'Venteliste' : 'Bestill'}
                          </button>
                        </div>
                      ); })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ABONNEMENT ── */}
          {tab === 'abonnement' && !buyingPlan && (
            <div style={{ maxWidth: '700px' }}>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Velg abonnement</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>Ingen bindingstid. Avbestill nar som helst.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }} className="responsive-grid">
                {PLANER.map(plan => { const isCurrent = plan.name === currentPlan; return (
                  <div key={plan.name} style={{ background: 'var(--navy-mid)', border: plan.popular ? '2px solid var(--orange)' : isCurrent ? '2px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px', position: 'relative' }}>
                    {plan.popular && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--orange)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Mest Populaer</div>}
                    {isCurrent && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap' }}>Din plan</div>}
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{plan.name}</div>
                    <div style={{ marginBottom: '16px' }}><span style={{ fontFamily: 'var(--font-syne)', fontSize: '30px', fontWeight: 800 }}>kr {plan.price}</span><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{plan.period}</span></div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                      {plan.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}><Check size={11} color="var(--orange)" strokeWidth={3} style={{ flexShrink: 0 }} />{f}</li>)}
                    </ul>
                    <button onClick={() => !isCurrent && setBuyingPlan(plan.name)} style={{ width: '100%', padding: '11px', background: isCurrent ? 'rgba(74,222,128,0.08)' : plan.popular ? 'var(--orange)' : 'rgba(232,93,4,0.85)', color: isCurrent ? '#86efac' : '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer' }}>{isCurrent ? 'Aktiv plan' : 'Velg plan'}</button>
                    {isCurrent && currentPlan !== 'Aktiv' && <button onClick={() => setCancelSubConfirm(true)} style={{ width: '100%', marginTop: '8px', padding: '9px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', background: 'transparent' }}>Avbestill abonnement</button>}
                  </div>
                ); })}
              </div>
            </div>
          )}

          {/* PAYMENT */}
          {tab === 'abonnement' && buyingPlan && (
            <div style={{ maxWidth: '440px' }}>
              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Check size={32} color="#86efac" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Betaling gjennomfort!</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Oppgradert til <strong>{buyingPlan}</strong>.</p>
                </div>
              ) : (
                <>
                  <button onClick={() => setBuyingPlan(null)} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}><ChevronLeft size={15} /> Tilbake</button>
                  <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '12px', padding: '18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Oppgraderer til</div><div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{buyingPlan}</div></div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '24px', fontWeight: 800, color: 'var(--orange)' }}>kr {PLANER.find(p => p.name === buyingPlan)?.price}/mnd</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Navn pa kortet</label><input type="text" value={cardName} onChange={e => { setCardName(e.target.value); setCardErrors(p => ({ ...p, cardName: '' })); }} style={inputStyle(cardErrors.cardName)} placeholder="Fullt navn" />{cardErrors.cardName && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px' }}>{cardErrors.cardName}</p>}</div>
                    <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Kortnummer</label><input type="text" value={cardNumber} onChange={e => { setCardNumber(formatCard(e.target.value)); setCardErrors(p => ({ ...p, cardNumber: '' })); }} style={inputStyle(cardErrors.cardNumber)} placeholder="0000 0000 0000 0000" maxLength={19} />{cardErrors.cardNumber && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px' }}>{cardErrors.cardNumber}</p>}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Utloper</label><input type="text" value={cardExpiry} onChange={e => { setCardExpiry(formatExpiry(e.target.value)); setCardErrors(p => ({ ...p, cardExpiry: '' })); }} style={inputStyle(cardErrors.cardExpiry)} placeholder="MM/YY" maxLength={5} /></div>
                      <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>CVC</label><input type="text" value={cardCvc} onChange={e => { setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3)); setCardErrors(p => ({ ...p, cardCvc: '' })); }} style={inputStyle(cardErrors.cardCvc)} placeholder="123" maxLength={3} /></div>
                    </div>
                    <button onClick={handlePurchase} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, marginTop: '8px' }}>Betal kr {PLANER.find(p => p.name === buyingPlan)?.price}/mnd</button>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', textAlign: 'center' }}>Demo: ingen ekte betaling</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── PROFIL ── */}
          {tab === 'profil' && (
            <div style={{ maxWidth: '480px' }}>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, marginBottom: '24px' }}>Min profil</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '28px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(232,93,4,0.4)' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '32px' }}>{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <button onClick={() => showToast('Profilbilde oppdatert!')} style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '28px', height: '28px', background: 'var(--orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--navy)' }}><Camera size={13} color="#fff" /></button>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{profileName}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{currentPlan}-medlem</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Fullt navn</label><input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} style={inputStyle()} /></div>
                <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>E-post</label><input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} style={inputStyle()} /></div>
                <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Telefon</label><input type="tel" placeholder="+47 000 00 000" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={inputStyle()} /></div>
                <div><label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Fodselsdato</label><input type="date" value={profileBirthdate} onChange={e => setProfileBirthdate(e.target.value)} style={{ ...inputStyle(), colorScheme: 'dark' }} /></div>
                <button onClick={() => showToast('Profil oppdatert!')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, marginTop: '6px' }}>Lagre endringer</button>
              </div>
            </div>
          )}

          {/* ── INNSTILLINGER ── */}
          {tab === 'innstillinger' && (
            <div style={{ maxWidth: '480px' }}>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, marginBottom: '24px' }}>Innstillinger</h1>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={15} color="var(--orange)" /> Varsler</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'email' as const, label: 'E-postvarsler', desc: 'Bekreftelser og paminneringer' },
                    { key: 'sms' as const, label: 'SMS-varsler', desc: 'Paminneringer 1 time for' },
                    { key: 'push' as const, label: 'Push-varsler', desc: 'Varsler i sanntid' },
                    { key: 'marketing' as const, label: 'Nyhetsbrev', desc: 'Tilbud og treningstips' },
                  ].map(n => (
                    <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px' }}>
                      <div><div style={{ fontSize: '14px', fontWeight: 600 }}>{n.label}</div><div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{n.desc}</div></div>
                      <button onClick={() => { setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] })); showToast(`${n.label} ${!notifications[n.key] ? 'aktivert' : 'deaktivert'}`); }}
                        style={{ width: '44px', height: '24px', borderRadius: '12px', background: notifications[n.key] ? 'var(--orange)' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: notifications[n.key] ? '23px' : '3px', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={15} color="var(--orange)" /> Sikkerhet</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button onClick={() => setChangePassword(true)} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Key size={15} color="rgba(255,255,255,0.4)" /><div><div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Endre passord</div><div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Oppdater passordet ditt</div></div></div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                  </button>
                  <button onClick={() => showToast('To-faktor autentisering: I produksjon vises valg mellom SMS, autentiseringsapp og sikkerhetsnokkel her.')} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={15} color="rgba(255,255,255,0.4)" /><div><div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>To-faktor autentisering</div><div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Ekstra sikkerhet for kontoen</div></div></div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                  </button>
                  <button onClick={() => { showToast('Dataeksport startet! Du mottar en e-post med dine data (demo).'); }} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Download size={15} color="rgba(255,255,255,0.4)" /><div><div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Last ned mine data</div><div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Eksporter alle opplysninger (GDPR)</div></div></div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                  </button>
                </div>
              </div>

              <div style={{ padding: '20px', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171', marginBottom: '8px' }}>Faresone</div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '14px', lineHeight: 1.6 }}>Sletting av kontoen er permanent og kan ikke angres.</p>
                <button onClick={() => setDeleteConfirm(true)} style={{ color: '#f87171', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '10px 20px' }}>Slett konto</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar */}
      <style>{`@media (max-width: 768px) { .konto-sidebar { display: none !important; } main { padding-left: 0 !important; } }`}</style>

      {/* Mobile bottom tabs */}
      <div className="konto-mobile-tabs" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--navy-mid)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 0', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {tabs.map(t => { const Icon = t.icon; const active = tab === t.id; return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 8px', color: active ? 'var(--orange)' : 'rgba(255,255,255,0.35)' }}>
              <Icon size={18} /><span style={{ fontSize: '9px', fontWeight: active ? 700 : 400 }}>{t.label}</span>
            </button>
          ); })}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .konto-mobile-tabs { display: block !important; } }`}</style>
    </div>
  );
}
