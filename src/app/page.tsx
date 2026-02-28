'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, Zap, Clock, Users, ChevronRight, Check, Dumbbell, Heart, Flame, Trophy, ArrowRight, Phone, Mail, MapPin, User } from 'lucide-react';
import UserDashboard from './components/UserDashboard';

const NAV_LINKS = [['timer', 'Timer'], ['treningsabonnement', 'Abonnement'], ['trenere', 'Trenere'], ['timeplan', 'Timeplan'], ['kontakt', 'Kontakt']];

const STATS = [
  { value: '2.400+', label: 'Aktive Medlemmer' },
  { value: '48', label: 'Ukentlige Timer' },
  { value: '12', label: 'Eksperttrenere' },
  { value: '97%', label: 'Fornoydhetsrate' },
];

const KLASSER = [
  {
    day: 'Mandag',
    schedule: [
      { time: '06:00', name: 'HIIT-Okt', trainer: 'Erik Hansen', duration: '45 min', spots: 3, icon: Flame },
      { time: '09:00', name: 'Yoga', trainer: 'Lise Dahl', duration: '60 min', spots: 8, icon: Heart },
      { time: '12:00', name: 'Styrkesirkel', trainer: 'Mads Berg', duration: '50 min', spots: 0, icon: Dumbbell },
      { time: '18:00', name: 'Spinning', trainer: 'Sara Moe', duration: '45 min', spots: 5, icon: Zap },
      { time: '19:30', name: 'Boksing', trainer: 'Erik Hansen', duration: '60 min', spots: 2, icon: Trophy },
    ],
  },
  {
    day: 'Tirsdag',
    schedule: [
      { time: '07:00', name: 'Morgenokt', trainer: 'Mads Berg', duration: '60 min', spots: 6, icon: Flame },
      { time: '10:00', name: 'Pilates', trainer: 'Lise Dahl', duration: '50 min', spots: 4, icon: Heart },
      { time: '12:30', name: 'CrossFit', trainer: 'Erik Hansen', duration: '60 min', spots: 0, icon: Dumbbell },
      { time: '17:30', name: 'HIIT-Okt', trainer: 'Sara Moe', duration: '45 min', spots: 7, icon: Zap },
      { time: '19:00', name: 'Yoga', trainer: 'Lise Dahl', duration: '60 min', spots: 12, icon: Heart },
    ],
  },
  {
    day: 'Onsdag',
    schedule: [
      { time: '06:00', name: 'Spinning', trainer: 'Sara Moe', duration: '45 min', spots: 2, icon: Zap },
      { time: '09:30', name: 'Styrkesirkel', trainer: 'Mads Berg', duration: '50 min', spots: 5, icon: Dumbbell },
      { time: '12:00', name: 'Boksing', trainer: 'Erik Hansen', duration: '60 min', spots: 1, icon: Flame },
      { time: '18:00', name: 'CrossFit', trainer: 'Mads Berg', duration: '60 min', spots: 3, icon: Trophy },
      { time: '19:30', name: 'Pilates', trainer: 'Lise Dahl', duration: '50 min', spots: 9, icon: Heart },
    ],
  },
];

const PLANER = [
  {
    name: 'Aktiv',
    subtitle: 'For deg som trener 1-2 ganger i uka',
    price: 249,
    period: '/mnd',
    desc: 'Kom deg i gang og hold deg aktiv',
    highlight: false,
    badge: null as string | null,
    features: [
      'Tilgang til treningsgulv',
      'Garderobe og dusj',
      'Fitness-app med treningslogg',
      'Tilgang 06:00-22:00',
    ],
    cta: 'Kom i gang',
  },
  {
    name: 'Trening',
    subtitle: 'For faste mosjonister 3-4 ganger i uka',
    price: 449,
    period: '/mnd',
    desc: 'Det komplette treningsopplegget',
    highlight: false,
    badge: null as string | null,
    features: [
      'Alt i Aktiv',
      'Ubegrenset gruppetimer',
      'Tilgang 24/7',
      '1 PT-introduksjonsokt',
      'Kostholdsguide (digital)',
      'Gjestekort x1/mnd',
    ],
    cta: 'Start treningen',
  },
  {
    name: 'Performance',
    subtitle: 'For seriose utovere med mal',
    price: 699,
    period: '/mnd',
    desc: 'Vart mest populaere alternativ',
    highlight: true,
    badge: 'Mest Populaer',
    features: [
      'Alt i Trening',
      '4 PT-okter/mnd',
      'Naerings- og kostholdscoaching',
      'Prioritert timebooking',
      'Restitusjonssuite (badstue + isokar)',
      'Gjestekort x3/mnd',
      'Manedsvis kroppsanalyse',
    ],
    cta: 'Bli Performance',
  },
  {
    name: 'Elite',
    subtitle: 'For konkurranseutovere og profesjonelle',
    price: 999,
    period: '/mnd',
    desc: 'Alt du trenger for toppprestasjon',
    highlight: false,
    badge: null as string | null,
    features: [
      'Alt i Performance',
      'Ubegrenset PT-okter',
      'Personlig treningsprogram',
      'Konkurranse- og sesongplanlegging',
      'Ubegrenset gjestekort',
      'Prioritert locker i garderobe',
      'Direkte tilgang til sjefstrener',
    ],
    cta: 'Ga Elite',
  },
];

const TRENERE = [
  {
    name: 'Erik Hansen',
    role: 'Sjefstrener',
    specialty: 'HIIT & Boksing',
    experience: '10 ars erfaring',
    bio: 'Tidligere norsk boksemester og NFIF-sertifisert funksjonell trener. Eriks okter er designet for deg som vil ha resultater — fort. Han kombinerer kampsport-presisjon med moderne HIIT-metoder for a maksimere fettforbrenning og atletisk kapasitet.',
    quote: '"Du trenger ikke vaere i form for a begynne. Du begynner for a komme i form."',
    certifications: ['NFIF Pt. 3', 'Boksing Niva 2', 'Funksjonell Trening'],
    bestFor: 'Intensiv trening, vekttap, atletisk utvikling',
    img: 'https://images.pexels.com/photos/5209197/pexels-photo-5209197.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    tags: ['HIIT', 'Boksing', 'Funksjonell trening'],
  },
  {
    name: 'Lise Dahl',
    role: 'Yoga & Pilates-instruktor',
    specialty: 'Bevisst bevegelse',
    experience: '8 ars erfaring',
    bio: 'Sertifisert i Hatha, Vinyasa og restorativ yoga. Lise hjelper deg a finne balansen mellom styrke og mykhet — ideell for dem som sliter med stress, ryggproblemer eller onsker a forbedre fleksibilitet og kroppsholdning gjennom bevisst bevegelse.',
    quote: '"Yoga er ikke en prestasjon. Det er en praksis."',
    certifications: ['Yoga Alliance RYT 500', 'Pilates Foundation', 'Prenatal Yoga'],
    bestFor: 'Stressmestring, fleksibilitet, kjernerehabiltering',
    img: 'https://images.pexels.com/photos/6916300/pexels-photo-6916300.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    tags: ['Yoga', 'Pilates', 'Rehabilitering'],
  },
  {
    name: 'Mads Berg',
    role: 'Styrke & CrossFit-trener',
    specialty: 'Olympisk lofting',
    experience: '7 ars erfaring',
    bio: 'CrossFit Level 3-sertifisert med bakgrunn fra olympisk vektlofting pa nasjonalt niva. Mads laerer deg a lofte riktig, bygge eksplosiv styrke og unnga skader. Hans trening kombinerer teknikkdrill med progressiv overbelastning for langsiktig utvikling.',
    quote: '"Teknikk forst, tyngde etterpa."',
    certifications: ['CrossFit L3', 'NSCA-CSCS', 'Olympisk Vektlofting Trener'],
    bestFor: 'Styrkebygging, CrossFit, eksplosiv atletisme',
    img: 'https://images.pexels.com/photos/14762174/pexels-photo-14762174.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    tags: ['CrossFit', 'Styrketrening', 'Olympisk lofting'],
  },
  {
    name: 'Sara Moe',
    role: 'Kondisjon & Spinning-spesialist',
    specialty: 'Intervallsykling',
    experience: '7 ars erfaring',
    bio: 'Indoor cycling-instruktor med bakgrunn som konkurransesyklist. Sara designer okter som passer alle — fra mosjonister som vil forbedre kondisen til syklister som vil ta prestasjonen til neste niva. Hennes musikk-drevne klasser er kjent for a vaere bade krevende og morsomt.',
    quote: '"Hvert pedaltrak er et skritt naermere malet ditt."',
    certifications: ['Spinning Master Instructor', 'NFIF Kondisjon', 'WATTBIKE Coach'],
    bestFor: 'Kondisjonstrening, kalorieforbruk, sykkelprestasjon',
    img: 'https://images.pexels.com/photos/5669172/pexels-photo-5669172.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
    tags: ['Spinning', 'Kondisjon', 'Intervalltrening'],
  },
];

export default function BergenFitness() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [bookingClass, setBookingClass] = useState<string | null>(null);
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [authModal, setAuthModal] = useState(false);
  useEffect(() => { setHydrated(true); try { const u = sessionStorage.getItem('bf_user'); if (u) setLoggedInUser(JSON.parse(u)); } catch {} }, []);
  const [authMode, setAuthMode] = useState<'join' | 'signin'>('join');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDone, setAuthDone] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [authErrors, setAuthErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerErrors, setTrainerErrors] = useState<{ name?: string; email?: string }>({});
  const [classBookName, setClassBookName] = useState('');
  const [classBookEmail, setClassBookEmail] = useState('');
  const [classBookErrors, setClassBookErrors] = useState<{ name?: string; email?: string }>({});
  const [trainerModal, setTrainerModal] = useState<typeof TRENERE[0] | null>(null);
  const [trainerBooked, setTrainerBooked] = useState(false);
  const [toast, setToast] = useState('');
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openAuth = (mode: 'join' | 'signin' = 'join') => {
    setAuthMode(mode); setAuthDone(false); setAuthName(''); setAuthEmail(''); setAuthPassword(''); setAuthErrors({});
    setForgotMode(false); setForgotSent(false); setForgotEmail('');
    setAuthModal(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { name?: string; email?: string; password?: string } = {};
    if (authMode === 'join' && !authName.trim()) errs.name = 'Feltet er obligatorisk';
    if (!authEmail.trim()) errs.email = 'Feltet er obligatorisk';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail.trim())) errs.email = 'Ugyldig e-postadresse';
    if (!authPassword.trim()) errs.password = 'Feltet er obligatorisk';
    if (Object.keys(errs).length) { setAuthErrors(errs); return; }
    setAuthErrors({});
    setAuthDone(true);
    const user = { name: authMode === 'join' ? authName.trim() : authEmail.split('@')[0], email: authEmail.trim() };
    setLoggedInUser(user);
    try { sessionStorage.setItem('bf_user', JSON.stringify(user)); } catch {}
    showToast(`Logget inn som ${user.name}`);
    setTimeout(() => setAuthModal(false), 1500);
  };

  const handleBook = (cls: { name: string; trainer: string; time: string; spots: number }) => {
    if (cls.spots === 0) return;
    setBookingClass(`${cls.name} kl. ${cls.time} med ${cls.trainer}`);
  };

  const confirmBook = () => {
    if (!bookingClass) return;
    setBookedClasses(prev => [...prev, bookingClass]);
    showToast(`Bestilt: ${bookingClass}`);
    setBookingClass(null);
  };

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  return (
    <div style={{ background: 'var(--navy)', color: '#fff', minHeight: '100vh' }}>

      {/* AUTH MODAL */}
      {authModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && setAuthModal(false)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', position: 'relative' }}>
            <button onClick={() => setAuthModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px' }}>x</button>
            {authDone ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(232,93,4,0.12)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={24} color="var(--orange)" />
                </div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                  {authMode === 'join' ? `Velkommen, ${authName || 'mester'}!` : 'Velkommen tilbake!'}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.65 }}>
                  {authMode === 'join'
                    ? 'Demo: I produksjon opprettes kontoen din, 7-dagers gratisproven starter og du logges inn.'
                    : 'Demo: I produksjon godkjennes kontoen din og du logges inn.'}
                </p>
                <div style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Lukker automatisk...</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                  {(['join', 'signin'] as const).map(m => (
                    <button key={m} onClick={() => { setAuthMode(m); setAuthErrors({}); }}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: authMode === m ? 'var(--orange)' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      {m === 'join' ? 'Bli Medlem' : 'Logg inn'}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {authMode === 'join' && (
                    <div>
                      <input type="text" placeholder="Ditt navn" value={authName} onChange={e => { setAuthName(e.target.value); setAuthErrors(prev => ({ ...prev, name: undefined })); }}
                        style={{ background: 'rgba(255,255,255,0.05)', border: authErrors.name ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
                      {authErrors.name && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{authErrors.name}</p>}
                    </div>
                  )}
                  <div>
                    <input type="email" placeholder="E-postadresse" value={authEmail} onChange={e => { setAuthEmail(e.target.value); setAuthErrors(prev => ({ ...prev, email: undefined })); }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: authErrors.email ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
                    {authErrors.email && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{authErrors.email}</p>}
                  </div>
                  <div>
                    <input type="password" placeholder="Passord" value={authPassword} onChange={e => { setAuthPassword(e.target.value); setAuthErrors(prev => ({ ...prev, password: undefined })); }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: authErrors.password ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
                    {authErrors.password && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{authErrors.password}</p>}
                  </div>
                  <button type="submit" style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '15px', marginTop: '6px', border: 'none', cursor: 'pointer' }}>
                    {authMode === 'join' ? 'Start gratis proveperiode' : 'Logg inn'}
                  </button>
                </form>
                {authMode === 'signin' && !forgotMode && (
                  <button type="button" onClick={() => setForgotMode(true)} style={{ color: 'var(--orange-light)', fontSize: '12px', fontWeight: 500, textAlign: 'center', marginTop: '6px', display: 'block', width: '100%' }}>Glemt passord?</button>
                )}
                {authMode === 'join' && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>7 dager gratis - Ingen bindingstid</p>}
                {forgotMode && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                    {forgotSent ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#86efac', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>E-post sendt!</div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Demo: Sjekk innboksen din for tilbakestillingslenke.</p>
                        <button type="button" onClick={() => { setForgotMode(false); setForgotSent(false); }} style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>Tilbake til innlogging</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Tilbakestill passord</div>
                        <input type="email" placeholder="Din e-postadresse" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const, marginBottom: '10px' }} />
                        <button type="button" onClick={() => { if (forgotEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) { setForgotSent(true); showToast('Tilbakestillingslenke sendt!'); } }}
                          style={{ width: '100%', background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '11px', fontWeight: 700, fontSize: '14px' }}>Send tilbakestillingslenke</button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TRAINER MODAL */}
      {trainerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && (setTrainerModal(null), setTrainerBooked(false), setTrainerName(''), setTrainerEmail(''), setTrainerErrors({}))}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button onClick={() => { setTrainerModal(null); setTrainerBooked(false); setTrainerName(''); setTrainerEmail(''); setTrainerErrors({}); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px' }}>x</button>
            {trainerBooked ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(232,93,4,0.12)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={24} color="var(--orange)" />
                </div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Time forespurt!</div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.65 }}>
                  Demo: Din PT-time med <strong>{trainerModal.name}</strong> er forespurt. I produksjon bekreftes den via e-post innen 2 timer.
                </p>
                <button onClick={() => { setTrainerModal(null); setTrainerBooked(false); setTrainerName(''); setTrainerEmail(''); setTrainerErrors({}); }}
                  style={{ marginTop: '20px', background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '10px 28px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Lukk</button>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Bestill en time</div>
                <div style={{ color: 'var(--orange-light)', fontSize: '13px', marginBottom: '24px' }}>med {trainerModal.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <input type="text" placeholder="Ditt navn" value={trainerName} onChange={e => { setTrainerName(e.target.value); setTrainerErrors(prev => ({ ...prev, name: undefined })); }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: trainerErrors.name ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
                    {trainerErrors.name && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{trainerErrors.name}</p>}
                  </div>
                  <div>
                    <input type="email" placeholder="Din e-post" value={trainerEmail} onChange={e => { setTrainerEmail(e.target.value); setTrainerErrors(prev => ({ ...prev, email: undefined })); }}
                      style={{ background: 'rgba(255,255,255,0.05)', border: trainerErrors.email ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
                    {trainerErrors.email && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{trainerErrors.email}</p>}
                  </div>
                  <select style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}>
                    <option>Foretrukket tid: Morgen (6-12)</option>
                    <option>Foretrukket tid: Ettermiddag (12-17)</option>
                    <option>Foretrukket tid: Kveld (17-22)</option>
                  </select>
                  <select style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}>
                    <option>Timetype: Personlig trening (60 min)</option>
                    <option>Timetype: Kartlegging + Program (90 min)</option>
                    <option>Timetype: Kostholdsradgivning (45 min)</option>
                  </select>
                  <button onClick={() => {
                    const errs: { name?: string; email?: string } = {};
                    if (!trainerName.trim()) errs.name = 'Feltet er obligatorisk';
                    if (!trainerEmail.trim()) errs.email = 'Feltet er obligatorisk';
                    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainerEmail.trim())) errs.email = 'Ugyldig e-postadresse';
                    if (Object.keys(errs).length) { setTrainerErrors(errs); return; }
                    setTrainerErrors({}); setTrainerName(''); setTrainerEmail('');
                    setTrainerBooked(true);
                  }}
                    style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '15px', marginTop: '4px', cursor: 'pointer', border: 'none' }}>
                    Send forespursel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CLASS BOOKING MODAL */}
      {bookingClass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && (setBookingClass(null), setClassBookName(''), setClassBookEmail(''), setClassBookErrors({}))}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '420px', position: 'relative' }}>
            <button onClick={() => { setBookingClass(null); setClassBookName(''); setClassBookEmail(''); setClassBookErrors({}); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px' }}>x</button>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Bekreft bestilling</div>
            <div style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{bookingClass}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="Ditt navn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              <input type="email" placeholder="Din e-post" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>
            <button onClick={() => {
              const errs: { name?: string; email?: string } = {};
              if (!classBookName.trim()) errs.name = 'Feltet er obligatorisk';
              if (!classBookEmail.trim()) errs.email = 'Feltet er obligatorisk';
              else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(classBookEmail.trim())) errs.email = 'Ugyldig e-postadresse';
              if (Object.keys(errs).length) { setClassBookErrors(errs); return; }
              setClassBookErrors({}); setClassBookName(''); setClassBookEmail('');
              confirmBook();
            }} style={{ width: '100%', background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}>
              Bekreft bestilling
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(232,93,4,0.35)', borderRadius: '10px', padding: '12px 24px', color: 'var(--orange-light)', fontSize: '14px', fontWeight: 600, zIndex: 300, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* BANNER */}
      {bannerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '44px', background: '#0D0D0D', borderBottom: '1px solid rgba(255,255,255,0.07)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 52px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', textAlign: 'center', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.1em' }}>DEMO</span>
            Vil du ha noe lignende for din bedrift?{' '}
            <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>Fa tilbud &rarr;</a>
          </p>
          <button onClick={() => setBannerOpen(false)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '16px', padding: '4px 8px', borderRadius: '4px' }}>x</button>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: 'rgba(13,27,42,0.97)', borderBottom: '1px solid rgba(255,255,255,0.05)', top: bannerOpen ? '44px' : '0', transition: 'top 0.2s', backdropFilter: 'blur(16px)' }}
        className="fixed left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ background: 'var(--orange)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: '#fff' }}>
              Bergen<span style={{ color: 'var(--orange)' }}>Fitness</span>
            </span>
          </button>
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13.5px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.01em' }}
                className="hover:text-white transition-colors">{label}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            {hydrated && loggedInUser ? (
              <button onClick={() => setDashboardOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(232,93,4,0.1)', border: '1px solid rgba(232,93,4,0.3)', borderRadius: '100px', padding: '6px 14px 6px 6px', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{loggedInUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{loggedInUser.name}</span>
              </button>
            ) : (
              <>
                <button onClick={() => openAuth('signin')} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13.5px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Logg inn</button>
                <button onClick={() => openAuth('join')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '6px', padding: '8px 20px', fontSize: '14px', fontWeight: 700 }}
                  className="hover:opacity-90 transition-opacity">Bli Medlem</button>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: 'var(--navy-mid)', borderTop: '1px solid rgba(255,255,255,0.05)' }} className="md:hidden px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>{label}</button>
            ))}
            {hydrated && loggedInUser ? (
              <button onClick={() => { setDashboardOpen(true); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(232,93,4,0.1)', border: '1px solid rgba(232,93,4,0.3)', borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{loggedInUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Min konto</span>
              </button>
            ) : (
              <button onClick={() => { openAuth('join'); setMenuOpen(false); }} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 700, border: 'none' }}>Bli Medlem</button>
            )}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="timer" className="relative min-h-screen flex items-end" style={{ paddingTop: bannerOpen ? '108px' : '64px' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop"
            alt="Bergen Fitness treningssenter" fill style={{ objectFit: 'cover', objectPosition: 'center 30%' }} priority />
          <div style={{ background: 'linear-gradient(to top, rgba(13,27,42,1) 0%, rgba(13,27,42,0.6) 50%, rgba(13,27,42,0.1) 100%)' }} className="absolute inset-0" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20">
          <div className="max-w-3xl">
            <p style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '28px', height: '2px', background: 'var(--orange)' }} />
              Bergens fremste treningssenter
            </p>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: '28px' }}>
              Trening<br />uten<br /><span style={{ color: 'var(--orange)' }}>kompromiss.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: 1.7, maxWidth: '480px', fontWeight: 300, marginBottom: '36px' }}>
              Toppmoderne fasiliteter, dedikerte trenere og et fellesskap som driver deg fremover. Resultatene dine starter her.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => openAuth('join')}
                style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '15px 32px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
                className="hover:opacity-90 transition-opacity">
                Start gratis proveperiode <ArrowRight size={17} />
              </button>
              <button onClick={() => scrollTo('timeplan')}
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '15px 28px', fontSize: '15px', fontWeight: 500, background: 'none', cursor: 'pointer' }}
                className="hover:bg-white/5 transition-colors">
                Se timeplan
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '14px', letterSpacing: '0.03em' }}>7 dager gratis &mdash; ingen bindingstid, ingen kredittkort</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#111318', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0' }}>
        <div className="stats-grid max-w-7xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{ padding: '32px 28px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '36px', fontWeight: 800, color: 'var(--orange)', lineHeight: 1, letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMEPLAN */}
      <section id="timeplan" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-12">
            <div>
              <div style={{ color: 'var(--orange)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Timeplan</div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em' }}>Finn din time</h2>
            </div>
            <span className="demo-badge">Interaktiv demo</span>
          </div>
          <div className="day-tabs" style={{ marginBottom: '10px' }}>
            {KLASSER.map((day, i) => (
              <button key={day.day} onClick={() => setActiveDay(i)}
                style={{ background: activeDay === i ? 'var(--orange)' : 'var(--navy-mid)', border: activeDay === i ? 'none' : '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', padding: '9px 20px', fontSize: '13.5px', fontWeight: activeDay === i ? 700 : 400, cursor: 'pointer', flexShrink: 0 }}
                className="transition-all">{day.day}</button>
            ))}
          </div>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', marginTop: '16px' }}>
            {KLASSER[activeDay].schedule.map((cls, i) => {
              const Icon = cls.icon;
              const isFull = cls.spots === 0;
              const isBooked = bookedClasses.some(b => b.includes(cls.name));
              return (
                <div key={i} className="schedule-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', flexWrap: 'wrap', gap: '12px', borderBottom: i < KLASSER[activeDay].schedule.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: '14px', minWidth: '52px', fontFamily: 'var(--font-syne)' }}>{cls.time}</div>
                    <div style={{ width: '36px', height: '36px', background: isFull ? 'rgba(255,255,255,0.04)' : 'rgba(232,93,4,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={isFull ? 'rgba(255,255,255,0.25)' : 'var(--orange)'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{cls.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{cls.trainer} &middot; {cls.duration}</div>
                    </div>
                  </div>
                  <div className="schedule-row-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '13px', color: isFull ? '#f87171' : cls.spots <= 3 ? '#fb923c' : 'rgba(255,255,255,0.4)' }}>
                      {isFull ? 'Fullt' : `${cls.spots} plasser igjen`}
                    </span>
                    <button onClick={() => isFull ? showToast('Timen er full — du er satt pa ventelisten!') : handleBook(cls)}
                      style={{ background: isBooked ? 'rgba(74,222,128,0.12)' : isFull ? 'transparent' : 'var(--orange)', border: isBooked ? '1px solid rgba(74,222,128,0.35)' : isFull ? '1px solid rgba(255,255,255,0.12)' : 'none', color: isBooked ? '#86efac' : isFull ? 'rgba(255,255,255,0.35)' : '#fff', borderRadius: '6px', padding: '7px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                      className="transition-opacity hover:opacity-80">
                      {isBooked ? 'Bestilt' : isFull ? 'Venteliste' : 'Bestill'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRENINGSABONNEMENT */}
      <section id="treningsabonnement" style={{ background: '#0A1220', padding: '96px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ color: 'var(--orange)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Priser</div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>Treningsabonnement</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Ingen bindingstid. Avbestill nar som helst. De forste 7 dagene er alltid gratis.</p>
          </div>
          <div className="plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '1100px', margin: '0 auto' }}>
            {PLANER.map(plan => (
              <div key={plan.name}
                style={{ background: plan.highlight ? 'var(--navy-mid)' : 'var(--navy-mid)', border: plan.highlight ? '2px solid var(--orange)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px', position: 'relative', boxShadow: plan.highlight ? '0 24px 60px rgba(232,93,4,0.15)' : 'none' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--orange)', color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{plan.badge}</div>
                )}
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '4px' }}>{plan.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginBottom: '20px' }}>{plan.subtitle}</div>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-syne)', fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em' }}>kr {plan.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{plan.period}</span>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'rgba(255,255,255,0.65)' }}>
                      <Check size={14} color="var(--orange)" strokeWidth={3} style={{ flexShrink: 0 }} />{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { if (loggedInUser) { setDashboardOpen(true); } else { openAuth('join'); } }}
                  style={{ width: '100%', padding: '13px', background: plan.highlight ? 'var(--orange)' : 'rgba(232,93,4,0.9)', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  className="hover:opacity-90 transition-opacity">
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENERE */}
      <section id="trenere" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ marginBottom: '56px' }}>
            <div style={{ color: 'var(--orange)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Vart team</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em' }}>Eksperttrenere</h2>
              <button onClick={() => showToast('Alle 12 trenere pa det fullstendige nettstedet!')} style={{ color: 'var(--orange)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                Mot alle trenere <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="trainer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {TRENERE.map(trainer => (
              <div key={trainer.name} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}
                className="hover:scale-[1.02] hover:shadow-xl transition-all">
                <div style={{ position: 'relative', height: '240px' }}>
                  <Image src={trainer.img} alt={trainer.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.95) 0%, transparent 55%)' }} />
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '16px', fontWeight: 700, marginBottom: '3px' }}>{trainer.name}</div>
                  <div style={{ color: 'var(--orange-light)', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>{trainer.role}</div>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', background: 'rgba(232,93,4,0.2)', border: '1px solid rgba(232,93,4,0.3)', borderRadius: '4px', padding: '3px 8px', letterSpacing: '0.04em' }}>{trainer.specialty}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '10px' }}>{trainer.quote}</p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12.5px', lineHeight: 1.65, marginBottom: '10px' }}>{trainer.bio}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}><span style={{ fontWeight: 600 }}>Best for:</span> {trainer.bestFor}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                    {trainer.certifications.map(cert => (
                      <span key={cert} style={{ fontSize: '10px', fontWeight: 600, color: 'var(--orange)', background: 'rgba(232,93,4,0.1)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '4px', padding: '3px 7px', letterSpacing: '0.04em' }}>{cert}</span>
                    ))}
                  </div>
                  <button onClick={() => { setTrainerModal(trainer); setTrainerBooked(false); }}
                    style={{ width: '100%', padding: '9px', border: '1px solid rgba(232,93,4,0.35)', borderRadius: '6px', color: 'var(--orange)', fontSize: '13px', fontWeight: 600, background: 'none', cursor: 'pointer' }}
                    className="hover:bg-orange-500/10 transition-colors">
                    Bestill time
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" style={{ background: 'linear-gradient(135deg, #C44B00 0%, #E85D04 60%, #F08030 100%)', padding: '80px 0' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(26px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Klar til a na dine mal?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px', maxWidth: '460px', margin: '0 auto 36px', lineHeight: 1.65 }}>
            Start med 7 dager gratis. Ingen bindingstid. Avbestill nar som helst.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => openAuth('join')}
              style={{ background: '#fff', color: 'var(--orange)', borderRadius: '8px', padding: '15px 32px', fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
              className="hover:opacity-90 transition-opacity">
              Start gratis proveperiode
            </button>
            <button onClick={() => scrollTo('timeplan')}
              style={{ border: '2px solid rgba(255,255,255,0.45)', color: '#fff', borderRadius: '8px', padding: '15px 28px', fontSize: '15px', fontWeight: 600, background: 'none', cursor: 'pointer' }}
              className="hover:bg-white/10 transition-colors">
              Se timeplan
            </button>
          </div>
        </div>
      </section>

      {/* PAYMENT METHODS */}
      <section style={{ padding: '64px 0', background: 'var(--navy)' }}>
        <div className="max-w-5xl mx-auto px-6" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--orange)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Betaling</div>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Fleksible betalingsalternativer</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '40px', maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }}>Vi aksepterer alle de mest populaere betalingsmetodene slik at du kan betale slik det passer deg.</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { src: '/icons/Visa.png', alt: 'Visa', w: 100 },
              { src: '/icons/MasterCard.png', alt: 'Mastercard', w: 90 },
              { src: '/icons/KlarnaLogo.png', alt: 'Klarna', w: 110 },
              { src: '/icons/ApplePay.png', alt: 'Apple Pay', w: 110 },
              { src: '/icons/GooglePay.png', alt: 'Google Pay', w: 110 },
              { src: '/icons/PayPal.png', alt: 'PayPal', w: 110 },
            ].map(pm => (
              <div key={pm.alt} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '140px', minHeight: '80px' }}>
                <Image src={pm.src} alt={pm.alt} width={pm.w} height={64} style={{ objectFit: 'contain', filter: 'brightness(1.1)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--navy-mid)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 0 32px' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'var(--orange)', borderRadius: '6px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dumbbell size={13} color="#fff" /></div>
                <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '15px' }}>Bergen<span style={{ color: 'var(--orange)' }}>Fitness</span></span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>Bergens fremste treningsmiljo. Apent 24/7, 365 dager i aret.</p>
              <span className="demo-badge">Demo</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, marginBottom: '14px', fontSize: '13px', letterSpacing: '0.02em' }}>Hurtiglenker</div>
              {[['timer', 'Timer'], ['treningsabonnement', 'Abonnement'], ['trenere', 'Trenere'], ['timeplan', 'Timeplan']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{label}</button>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, marginBottom: '14px', fontSize: '13px', letterSpacing: '0.02em' }}>Kontakt</div>
              {[{ icon: MapPin, text: 'Bryggen 14, Bergen' }, { icon: Phone, text: '+47 555 01 234' }, { icon: Mail, text: 'info@bergenfitness.no' }].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><Icon size={13} color="var(--orange)" /><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{text}</span></div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, marginBottom: '14px', fontSize: '13px', letterSpacing: '0.02em' }}>Apningstider</div>
              {[['Man-Fre', '05:30-23:00'], ['Lor-Son', '07:00-21:00'], ['Helligdager', '08:00-20:00']].map(([day, hours]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{day}</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 500 }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center' }}>
            2025 BergenFitness &middot; Demo-side av Sloth Studio &middot;{' '}
            <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange-light)', textDecoration: 'none', fontWeight: 600 }}>Vil du ha dette for din bedrift? Fa tilbud</a>
          </div>
        </div>
      </footer>

      {/* USER DASHBOARD */}
      {dashboardOpen && loggedInUser && (
        <UserDashboard
          user={loggedInUser}
          onClose={() => setDashboardOpen(false)}
          onLogout={() => {
            setLoggedInUser(null);
            setDashboardOpen(false);
            try { sessionStorage.removeItem('bf_user'); } catch {}
            showToast('Logget ut!');
          }}
        />
      )}

      {/* FLOATING BUILT BY */}
      <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--orange)', color: '#fff', borderRadius: '100px', padding: '12px 20px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 24px rgba(232,93,4,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
        Bygget av Sloth Studio &rarr;
      </a>
    </div>
  );
}
