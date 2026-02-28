'use client';

import { useState, useRef } from 'react';
import { User, CreditCard, Calendar, Settings, LogOut, Check, ChevronRight, Camera, Shield, Bell, X, Dumbbell, Heart, Flame, Zap, Trophy } from 'lucide-react';

const PLANER = [
  { name: 'Aktiv', price: 249, period: '/mnd', features: ['Tilgang til treningsgulv', 'Garderobe og dusj', 'Fitness-app med treningslogg', 'Tilgang 06:00-22:00'] },
  { name: 'Trening', price: 449, period: '/mnd', features: ['Alt i Aktiv', 'Ubegrenset gruppetimer', 'Tilgang 24/7', '1 PT-introduksjonsokt', 'Kostholdsguide (digital)', 'Gjestekort x1/mnd'], popular: false },
  { name: 'Performance', price: 699, period: '/mnd', features: ['Alt i Trening', '4 PT-okter/mnd', 'Naerings- og kostholdscoaching', 'Prioritert timebooking', 'Restitusjonssuite (badstue + isokar)', 'Gjestekort x3/mnd', 'Manedsvis kroppsanalyse'], popular: true },
  { name: 'Elite', price: 999, period: '/mnd', features: ['Alt i Performance', 'Ubegrenset PT-okter', 'Personlig treningsprogram', 'Konkurranse- og sesongplanlegging', 'Ubegrenset gjestekort', 'Prioritert locker i garderobe', 'Direkte tilgang til sjefstrener'] },
];

const UPCOMING_CLASSES = [
  { name: 'HIIT-Okt', trainer: 'Erik Hansen', time: 'Man 06:00', duration: '45 min', icon: Flame, color: '#EF4444' },
  { name: 'Yoga', trainer: 'Lise Dahl', time: 'Tir 10:00', duration: '60 min', icon: Heart, color: '#8B5CF6' },
  { name: 'Spinning', trainer: 'Sara Moe', time: 'Ons 18:00', duration: '45 min', icon: Zap, color: '#06B6D4' },
];

const PAST_CLASSES = [
  { name: 'CrossFit', trainer: 'Mads Berg', date: '12. jan 2025', duration: '60 min', icon: Trophy },
  { name: 'Boksing', trainer: 'Erik Hansen', date: '10. jan 2025', duration: '60 min', icon: Flame },
  { name: 'Pilates', trainer: 'Lise Dahl', date: '8. jan 2025', duration: '50 min', icon: Heart },
  { name: 'Styrketrening', trainer: 'Mads Berg', date: '6. jan 2025', duration: '50 min', icon: Dumbbell },
];

interface UserDashboardProps {
  user: { name: string; email: string };
  onClose: () => void;
  onLogout: () => void;
}

export default function UserDashboard({ user, onClose, onLogout }: UserDashboardProps) {
  const [tab, setTab] = useState<'oversikt' | 'abonnement' | 'bestillinger' | 'profil' | 'innstillinger'>('oversikt');
  const [currentPlan, setCurrentPlan] = useState('Aktiv');
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBirthdate, setProfileBirthdate] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true, marketing: false });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'oversikt' as const, label: 'Oversikt', icon: User },
    { id: 'abonnement' as const, label: 'Abonnement', icon: CreditCard },
    { id: 'bestillinger' as const, label: 'Mine timer', icon: Calendar },
    { id: 'profil' as const, label: 'Profil', icon: User },
    { id: 'innstillinger' as const, label: 'Innstillinger', icon: Settings },
  ];

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
    else {
      const m = parseInt(exp.slice(0, 2));
      if (m < 1 || m > 12) errs.cardExpiry = 'Ugyldig maned';
    }
    if (cardCvc.length < 3) errs.cardCvc = 'CVC ma vaere 3 siffer';
    if (Object.keys(errs).length) { setCardErrors(errs); return; }
    setCardErrors({});
    setPaymentSuccess(true);
    setCurrentPlan(buyingPlan!);
    setTimeout(() => { setPaymentSuccess(false); setBuyingPlan(null); setCardNumber(''); setCardExpiry(''); setCardCvc(''); setCardName(''); }, 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setProfileImage(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const inputStyle = (error?: string): React.CSSProperties => ({
    background: 'rgba(255,255,255,0.05)',
    border: error ? '1px solid #DC2626' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: profileImage ? 'none' : 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid rgba(232,93,4,0.4)' }}>
              {profileImage ? <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>{user.name.charAt(0).toUpperCase()}</span>}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '18px' }}>{profileName || user.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{currentPlan}-medlem</div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', padding: '4px 8px' }}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '16px 28px 0', display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflowX: 'auto' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '10px 16px', fontSize: '13px', fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? 'var(--orange)' : 'rgba(255,255,255,0.5)', borderBottom: tab === t.id ? '2px solid var(--orange)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginBottom: '-1px' }}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>

          {/* OVERSIKT */}
          {tab === 'oversikt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Current plan card */}
              <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(232,93,4,0.25)', borderRadius: '14px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Ditt abonnement</div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{currentPlan}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '28px', fontWeight: 800, color: 'var(--orange)' }}>kr {PLANER.find(p => p.name === currentPlan)?.price}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>/maned</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => setTab('abonnement')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}>
                    Oppgrader plan <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                  </button>
                  <span style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} /> Aktiv
                  </span>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Treningsokter', value: '24', sub: 'denne maneden' },
                  { label: 'Neste time', value: 'Man 06:00', sub: 'HIIT-Okt' },
                  { label: 'Medlem siden', value: 'Jan 2025', sub: '14 dager' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px' }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800 }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Upcoming classes */}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-syne)' }}>Kommende timer</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {UPCOMING_CLASSES.map(cls => {
                    const Icon = cls.icon;
                    return (
                      <div key={cls.name + cls.time} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '36px', height: '36px', background: `${cls.color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={16} color={cls.color} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{cls.name}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{cls.trainer} - {cls.duration}</div>
                          </div>
                        </div>
                        <div style={{ color: 'var(--orange)', fontSize: '13px', fontWeight: 600 }}>{cls.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logout */}
              <button onClick={onLogout} style={{ color: '#f87171', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <LogOut size={15} /> Logg ut
              </button>
            </div>
          )}

          {/* ABONNEMENT */}
          {tab === 'abonnement' && !buyingPlan && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>Velg abonnement</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Oppgrader eller endre planen din. Ingen bindingstid.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {PLANER.map(plan => {
                  const isCurrent = plan.name === currentPlan;
                  return (
                    <div key={plan.name} style={{ background: 'var(--navy-mid)', border: plan.popular ? '2px solid var(--orange)' : isCurrent ? '2px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', position: 'relative' }}>
                      {plan.popular && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--orange)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Mest Populaer</div>}
                      {isCurrent && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Din plan</div>}
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{plan.name}</div>
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontFamily: 'var(--font-syne)', fontSize: '32px', fontWeight: 800 }}>kr {plan.price}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{plan.period}</span>
                      </div>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px' }}>
                        {plan.features.map(f => (
                          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'rgba(255,255,255,0.6)' }}>
                            <Check size={12} color="var(--orange)" strokeWidth={3} style={{ flexShrink: 0 }} />{f}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => !isCurrent && setBuyingPlan(plan.name)}
                        style={{ width: '100%', padding: '11px', background: isCurrent ? 'rgba(74,222,128,0.1)' : plan.popular ? 'var(--orange)' : 'rgba(232,93,4,0.9)', color: isCurrent ? '#86efac' : '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer', opacity: isCurrent ? 0.8 : 1 }}>
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
            <div style={{ maxWidth: '440px', margin: '0 auto' }}>
              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(74,222,128,0.12)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={28} color="#86efac" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Betaling gjennomfort!</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Du er na oppgradert til <strong>{buyingPlan}</strong>-planen.</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '12px' }}>Demo: ingen ekte betaling er prosessert</p>
                </div>
              ) : (
                <>
                  <button onClick={() => setBuyingPlan(null)} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    &larr; Tilbake til planer
                  </button>
                  <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(232,93,4,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Oppgraderer til</div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{buyingPlan}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '24px', fontWeight: 800, color: 'var(--orange)' }}>kr {PLANER.find(p => p.name === buyingPlan)?.price}/mnd</div>
                    </div>
                  </div>

                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Kortdetaljer</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Navn pa kortet</label>
                      <input type="text" placeholder="Fullt navn" value={cardName} onChange={e => { setCardName(e.target.value); setCardErrors(prev => ({ ...prev, cardName: '' })); }} style={inputStyle(cardErrors.cardName)} />
                      {cardErrors.cardName && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{cardErrors.cardName}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Kortnummer</label>
                      <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => { setCardNumber(formatCard(e.target.value)); setCardErrors(prev => ({ ...prev, cardNumber: '' })); }} style={inputStyle(cardErrors.cardNumber)} maxLength={19} />
                      {cardErrors.cardNumber && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{cardErrors.cardNumber}</p>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Utloper</label>
                        <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => { setCardExpiry(formatExpiry(e.target.value)); setCardErrors(prev => ({ ...prev, cardExpiry: '' })); }} style={inputStyle(cardErrors.cardExpiry)} maxLength={5} />
                        {cardErrors.cardExpiry && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{cardErrors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>CVC</label>
                        <input type="text" placeholder="123" value={cardCvc} onChange={e => { setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3)); setCardErrors(prev => ({ ...prev, cardCvc: '' })); }} style={inputStyle(cardErrors.cardCvc)} maxLength={3} />
                        {cardErrors.cardCvc && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{cardErrors.cardCvc}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>
                      <Shield size={13} /> Kryptert og sikker betaling
                    </div>
                    <button onClick={handlePurchase} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, marginTop: '8px' }}>
                      Betal kr {PLANER.find(p => p.name === buyingPlan)?.price}/mnd
                    </button>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center' }}>Demo: ingen ekte betaling prosesseres</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MINE TIMER (BOOKINGS) */}
          {tab === 'bestillinger' && (
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Mine timer</div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Kommende</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
                {UPCOMING_CLASSES.map(cls => {
                  const Icon = cls.icon;
                  return (
                    <div key={cls.name + cls.time} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '38px', height: '38px', background: `${cls.color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={17} color={cls.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{cls.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{cls.trainer} - {cls.duration}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--orange)', fontSize: '13px', fontWeight: 600 }}>{cls.time}</span>
                        <button style={{ color: '#f87171', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px', padding: '5px 10px' }}>Avbestill</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Historikk</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {PAST_CLASSES.map(cls => {
                  const Icon = cls.icon;
                  return (
                    <div key={cls.name + cls.date} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon size={15} color="rgba(255,255,255,0.3)" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{cls.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{cls.trainer}</div>
                        </div>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{cls.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROFIL */}
          {tab === 'profil' && (
            <div style={{ maxWidth: '440px' }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Min profil</div>

              {/* Profile image */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: profileImage ? 'none' : 'linear-gradient(135deg, var(--orange), var(--orange-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid rgba(232,93,4,0.4)' }}>
                    {profileImage ? <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: '32px' }}>{user.name.charAt(0).toUpperCase()}</span>}
                  </div>
                  <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '28px', height: '28px', background: 'var(--orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--navy)' }}>
                    <Camera size={13} color="#fff" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{profileName || user.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{currentPlan}-medlem</div>
                  <button onClick={() => fileRef.current?.click()} style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Endre bilde</button>
                </div>
              </div>

              {profileSaved && (
                <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#86efac', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} /> Profilen er oppdatert
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Fullt navn</label>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>E-post</label>
                  <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Telefonnummer</label>
                  <input type="tel" placeholder="+47 000 00 000" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Fodselsdato</label>
                  <input type="date" value={profileBirthdate} onChange={e => setProfileBirthdate(e.target.value)} style={{ ...inputStyle(), colorScheme: 'dark' }} />
                </div>
                <button onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500); }}
                  style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, marginTop: '8px' }}>
                  Lagre endringer
                </button>
              </div>
            </div>
          )}

          {/* INNSTILLINGER */}
          {tab === 'innstillinger' && (
            <div style={{ maxWidth: '440px' }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Innstillinger</div>

              {settingsSaved && (
                <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#86efac', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} /> Innstillinger lagret
                </div>
              )}

              {/* Notifications */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={15} color="var(--orange)" /> Varsler
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'email' as const, label: 'E-postvarsler', desc: 'Bestillingsbekreftelser og paminneringer' },
                    { key: 'sms' as const, label: 'SMS-varsler', desc: 'Timepaminneringer 1 time for' },
                    { key: 'push' as const, label: 'Push-varsler', desc: 'Appen sender deg varsler i sanntid' },
                    { key: 'marketing' as const, label: 'Nyhetsbrev', desc: 'Tilbud, nyheter og treningstips' },
                  ].map(n => (
                    <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{n.label}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{n.desc}</div>
                      </div>
                      <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                        style={{ width: '44px', height: '24px', borderRadius: '12px', background: notifications[n.key] ? 'var(--orange)' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: notifications[n.key] ? '23px' : '3px', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={15} color="var(--orange)" /> Personvern og sikkerhet
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Endre passord</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Oppdater passordet ditt jevnlig</div>
                    </div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
                  </button>
                  <button style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>To-faktor autentisering</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Ekstra sikkerhet for kontoen din</div>
                    </div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
                  </button>
                  <button style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Last ned mine data</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Eksporter alle dine opplysninger (GDPR)</div>
                    </div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
                  </button>
                </div>
              </div>

              <button onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2500); }}
                style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, width: '100%' }}>
                Lagre innstillinger
              </button>

              {/* Danger zone */}
              <div style={{ marginTop: '32px', padding: '20px', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171', marginBottom: '8px' }}>Faresone</div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '14px' }}>Avslutter du kontoen, slettes alle dine data permanent.</p>
                <button onClick={onLogout} style={{ color: '#f87171', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '10px 20px' }}>
                  Slett konto
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
