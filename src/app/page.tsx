'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Menu, X, Zap, Clock, Users, Star, ChevronRight, Check, Dumbbell, Heart, Flame, Trophy, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

const NAV_LINKS = ['Classes', 'Membership', 'Trainers', 'Schedule', 'Contact'];

const STATS = [
  { value: '2,400+', label: 'Active Members' },
  { value: '48', label: 'Weekly Classes' },
  { value: '12', label: 'Expert Trainers' },
  { value: '97%', label: 'Satisfaction Rate' },
];

const CLASSES = [
  {
    day: 'Monday',
    schedule: [
      { time: '06:00', name: 'HIIT Blast', trainer: 'Erik Hansen', duration: '45 min', spots: 3, icon: Flame },
      { time: '09:00', name: 'Yoga Flow', trainer: 'Lise Dahl', duration: '60 min', spots: 8, icon: Heart },
      { time: '12:00', name: 'Strength Circuit', trainer: 'Mads Berg', duration: '50 min', spots: 0, icon: Dumbbell },
      { time: '18:00', name: 'Spin Class', trainer: 'Sara Moe', duration: '45 min', spots: 5, icon: Zap },
      { time: '19:30', name: 'Boxing', trainer: 'Erik Hansen', duration: '60 min', spots: 2, icon: Trophy },
    ],
  },
  {
    day: 'Tuesday',
    schedule: [
      { time: '07:00', name: 'Morning Run Club', trainer: 'Mads Berg', duration: '60 min', spots: 6, icon: Flame },
      { time: '10:00', name: 'Pilates Core', trainer: 'Lise Dahl', duration: '50 min', spots: 4, icon: Heart },
      { time: '12:30', name: 'CrossFit', trainer: 'Erik Hansen', duration: '60 min', spots: 0, icon: Dumbbell },
      { time: '17:30', name: 'HIIT Blast', trainer: 'Sara Moe', duration: '45 min', spots: 7, icon: Zap },
      { time: '19:00', name: 'Yoga Flow', trainer: 'Lise Dahl', duration: '60 min', spots: 12, icon: Trophy },
    ],
  },
  {
    day: 'Wednesday',
    schedule: [
      { time: '06:00', name: 'Spin Class', trainer: 'Sara Moe', duration: '45 min', spots: 2, icon: Zap },
      { time: '09:30', name: 'Strength Circuit', trainer: 'Mads Berg', duration: '50 min', spots: 5, icon: Dumbbell },
      { time: '12:00', name: 'Boxing', trainer: 'Erik Hansen', duration: '60 min', spots: 1, icon: Flame },
      { time: '18:00', name: 'CrossFit', trainer: 'Mads Berg', duration: '60 min', spots: 3, icon: Trophy },
      { time: '19:30', name: 'Pilates Core', trainer: 'Lise Dahl', duration: '50 min', spots: 9, icon: Heart },
    ],
  },
];

const PLANS = [
  {
    name: 'Starter', price: 299, period: 'month', desc: 'Perfect for getting started',
    features: ['Gym floor access', '2 group classes/week', 'Locker room access', 'App tracking'],
    cta: 'Get Started', highlight: false,
  },
  {
    name: 'Elite', price: 549, period: 'month', desc: 'Our most popular plan',
    features: ['Unlimited gym access', 'Unlimited group classes', '1 PT session/month', 'Nutrition guidance', 'Priority booking', 'Guest passes ×2'],
    cta: 'Join Elite', highlight: true,
  },
  {
    name: 'Pro', price: 899, period: 'month', desc: 'For serious athletes',
    features: ['Everything in Elite', '4 PT sessions/month', 'Body composition analysis', 'Custom training plan', 'Recovery suite access', 'Unlimited guest passes'],
    cta: 'Go Pro', highlight: false,
  },
];

const TRAINERS = [
  { name: 'Erik Hansen', role: 'Head Trainer · HIIT & Boxing', bio: '10 years experience. Former Norwegian boxing champion. Specialises in high-intensity functional training.', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop&crop=face', rating: 4.9, clients: 280 },
  { name: 'Lise Dahl', role: 'Yoga & Pilates Instructor', bio: 'Certified in Hatha and Vinyasa yoga. Expert in mindful movement and core rehabilitation.', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop&crop=face', rating: 4.8, clients: 195 },
  { name: 'Mads Berg', role: 'Strength & CrossFit Coach', bio: 'CrossFit Level 3 Trainer. Powerlifting background. Helping athletes build raw strength and endurance.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop', rating: 4.9, clients: 312 },
  { name: 'Sara Moe', role: 'Spin & Cardio Specialist', bio: 'Indoor cycling certified, 7 years coaching competitive cyclists and recreational riders.', img: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop&crop=face', rating: 4.7, clients: 224 },
];

export default function BergenFitness() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [activePlan, setActivePlan] = useState(1);
  const [bookingClass, setBookingClass] = useState<string | null>(null);
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'join' | 'signin'>('join');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDone, setAuthDone] = useState(false);
  const [trainerModal, setTrainerModal] = useState<typeof TRAINERS[0] | null>(null);
  const [trainerBooked, setTrainerBooked] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openAuth = (mode: 'join' | 'signin' = 'join') => {
    setAuthMode(mode); setAuthDone(false); setAuthName(''); setAuthEmail(''); setAuthPassword('');
    setAuthModal(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthDone(true);
  };

  const handleBook = (cls: { name: string; trainer: string; time: string; spots: number }) => {
    if (cls.spots === 0) return;
    setBookingClass(`${cls.name} at ${cls.time} with ${cls.trainer}`);
  };

  const confirmBook = () => {
    if (!bookingClass) return;
    setBookedClasses(prev => [...prev, bookingClass]);
    showToast(`✓ Booked: ${bookingClass}`);
    setBookingClass(null);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div style={{ background: 'var(--navy)', color: '#fff', minHeight: '100vh' }}>

      {/* AUTH MODAL */}
      {authModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && setAuthModal(false)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', position: 'relative' }}>
            <button onClick={() => setAuthModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            {authDone ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                  {authMode === 'join' ? `Welcome, ${authName || 'Champion'}!` : 'Welcome back!'}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.6 }}>
                  {authMode === 'join'
                    ? 'Demo: In production this creates your account, starts your 7-day free trial, and logs you in.'
                    : 'Demo: In production this authenticates your account and logs you in.'}
                </p>
                <button onClick={() => setAuthModal(false)}
                  style={{ marginTop: '24px', background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '12px 32px', fontWeight: 700, fontSize: '15px' }}>
                  Continue Exploring →
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                  {(['join', 'signin'] as const).map(m => (
                    <button key={m} onClick={() => setAuthMode(m)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: authMode === m ? 'var(--orange)' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      {m === 'join' ? 'Join Now' : 'Sign In'}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {authMode === 'join' && (
                    <input type="text" placeholder="Your name" value={authName} onChange={e => setAuthName(e.target.value)} required
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  )}
                  <input type="email" placeholder="Email address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  <button type="submit" style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '15px', marginTop: '4px' }}>
                    {authMode === 'join' ? 'Start Free Trial' : 'Sign In'}
                  </button>
                </form>
                {authMode === 'join' && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>7-day free trial · No credit card required</p>}
              </>
            )}
          </div>
        </div>
      )}

      {/* TRAINER BOOKING MODAL */}
      {trainerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && (setTrainerModal(null), setTrainerBooked(false))}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button onClick={() => { setTrainerModal(null); setTrainerBooked(false); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            {trainerBooked ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Session Requested!</div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.6 }}>
                  Demo: Your PT session with <strong>{trainerModal.name}</strong> has been requested. In production they&apos;d confirm via email within 2 hours.
                </p>
                <button onClick={() => { setTrainerModal(null); setTrainerBooked(false); }}
                  style={{ marginTop: '20px', background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '10px 28px', fontWeight: 700 }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Book a Session</div>
                <div style={{ color: 'var(--orange-light)', fontSize: '13px', marginBottom: '24px' }}>with {trainerModal.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Your name" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  <input type="email" placeholder="Your email" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  <select style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}>
                    <option>Preferred time: Morning (6–12)</option>
                    <option>Preferred time: Afternoon (12–17)</option>
                    <option>Preferred time: Evening (17–22)</option>
                  </select>
                  <select style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}>
                    <option>Session type: Personal Training (60 min)</option>
                    <option>Session type: Assessment + Program (90 min)</option>
                    <option>Session type: Nutrition Consult (45 min)</option>
                  </select>
                  <button onClick={() => setTrainerBooked(true)}
                    style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '15px', marginTop: '4px', cursor: 'pointer', border: 'none' }}>
                    Request Session
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CLASS BOOKING MODAL */}
      {bookingClass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => e.target === e.currentTarget && setBookingClass(null)}>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '420px', position: 'relative' }}>
            <button onClick={() => setBookingClass(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Confirm Booking</div>
            <div style={{ background: 'rgba(232,93,4,0.1)', border: '1px solid rgba(232,93,4,0.25)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{bookingClass}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="Your name" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              <input type="email" placeholder="Your email" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>
            <button onClick={confirmBook} style={{ width: '100%', background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}>
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,27,42,0.95)', border: '1px solid rgba(232,93,4,0.4)', borderRadius: '10px', padding: '12px 24px', color: 'var(--orange-light)', fontSize: '14px', fontWeight: 600, zIndex: 300, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* STICKY PROMO BANNER */}
      {bannerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '44px', background: 'var(--orange)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 52px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', textAlign: 'center', margin: 0, letterSpacing: '0.01em' }}>
            ⚡ DEMO SITE — Like what you see? This can be built for your business →{' '}
            <a href="https://www.fiverr.com/sloth3932" target="_blank" rel="noopener noreferrer"
              style={{ color: '#fff', fontWeight: 800, textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.6)' }}>
              Get a quote on Fiverr
            </a>
          </p>
          <button onClick={() => setBannerOpen(false)} aria-label="Dismiss banner"
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '4px 8px', borderRadius: '4px' }}>
            ×
          </button>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: 'rgba(13,27,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', top: bannerOpen ? '44px' : '0', transition: 'top 0.2s' }}
        className="fixed left-0 right-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div style={{ background: 'var(--orange)', borderRadius: '6px' }} className="w-7 h-7 flex items-center justify-center">
              <Dumbbell size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
              Bergen<span style={{ color: 'var(--orange)' }}>Fitness</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase())}
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                className="hover:text-white transition-colors">{link}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="demo-badge">Demo Site</span>
            <button onClick={() => openAuth('join')} style={{ background: 'var(--orange)', color: '#fff', borderRadius: '6px', padding: '8px 20px', fontSize: '14px', fontWeight: 600 }}
              className="hover:opacity-90 transition-opacity">Join Now</button>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: 'var(--navy-mid)', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="md:hidden px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase())}
                style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                {link}
              </button>
            ))}
            <button onClick={() => { openAuth('join'); setMenuOpen(false); }}
              style={{ background: 'var(--orange)', color: '#fff', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 600 }}>
              Join Now
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="classes" className="relative min-h-screen flex items-center" style={{ paddingTop: bannerOpen ? '108px' : '64px', transition: 'padding-top 0.2s' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop"
            alt="Bergen Fitness gym interior" fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
          <div style={{ background: 'linear-gradient(105deg, rgba(13,27,42,0.95) 45%, rgba(13,27,42,0.5) 100%)' }} className="absolute inset-0" />
          <div style={{ background: 'linear-gradient(to top, rgba(13,27,42,1) 0%, transparent 40%)' }} className="absolute inset-0" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div style={{ background: 'var(--orange)', height: '2px', width: '32px' }} />
              <span style={{ color: 'var(--orange-light)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Bergen&apos;s Premier Gym</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em' }}>
              Train Harder.<br /><span style={{ color: 'var(--orange)' }}>Live Stronger.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', lineHeight: 1.7, marginTop: '24px', fontWeight: 300 }}>
              State-of-the-art facilities, world-class trainers, and a community that pushes you to your limits. Your best performance starts here.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-10">
              <button onClick={() => openAuth('join')}
                style={{ background: 'var(--orange)', color: '#fff', borderRadius: '8px', padding: '14px 32px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                className="hover:opacity-90 transition-opacity">
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button onClick={() => scrollTo('schedule')}
                style={{ border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '8px', padding: '14px 28px', fontSize: '16px', fontWeight: 500 }}
                className="hover:bg-white/5 transition-colors">
                View Classes
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '12px' }}>7-day free trial · No credit card required</p>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: 'var(--orange)', padding: '32px 0' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '40px', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CLASS SCHEDULE */}
      <section id="schedule" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-12">
            <div>
              <div style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Weekly Schedule</div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>Find Your Perfect Class</h2>
            </div>
            <span className="demo-badge">Interactive Demo</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {CLASSES.map((day, i) => (
              <button key={day.day} onClick={() => setActiveDay(i)}
                style={{ background: activeDay === i ? 'var(--orange)' : 'var(--navy-mid)', border: activeDay === i ? 'none' : '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: activeDay === i ? 700 : 400 }}
                className="transition-all hover:opacity-90">{day.day}</button>
            ))}
          </div>
          <div style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
            {CLASSES[activeDay].schedule.map((cls, i) => {
              const Icon = cls.icon;
              const isFull = cls.spots === 0;
              const isBooked = bookedClasses.some(b => b.includes(cls.name));
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap', gap: '12px', borderBottom: i < CLASSES[activeDay].schedule.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div className="flex items-center gap-4">
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500, fontSize: '14px', minWidth: '52px' }}>{cls.time}</div>
                    <div style={{ width: '36px', height: '36px', background: isFull ? 'rgba(255,255,255,0.05)' : 'rgba(232,93,4,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={isFull ? 'rgba(255,255,255,0.3)' : 'var(--orange)'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{cls.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{cls.trainer} · {cls.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: '13px', color: isFull ? '#ff6b6b' : cls.spots <= 3 ? '#ffa500' : 'rgba(255,255,255,0.5)' }}>
                      {isFull ? 'Full' : `${cls.spots} spots left`}
                    </span>
                    <button onClick={() => isFull ? showToast('Class is full — you\'ve been added to the waitlist!') : handleBook(cls)}
                      style={{ background: isBooked ? 'rgba(34,197,94,0.2)' : isFull ? 'transparent' : 'var(--orange)', border: isFull ? '1px solid rgba(255,255,255,0.15)' : isBooked ? '1px solid rgba(34,197,94,0.4)' : 'none', color: isBooked ? '#86efac' : isFull ? 'rgba(255,255,255,0.4)' : '#fff', borderRadius: '6px', padding: '7px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                      className="transition-opacity hover:opacity-80">
                      {isBooked ? '✓ Booked' : isFull ? 'Waitlist' : 'Book'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section id="membership" style={{ background: 'var(--navy-mid)', padding: '96px 0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Pricing</div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>Membership Plans</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginTop: '12px' }}>No contracts. Cancel anytime. First 7 days always free.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <div key={plan.name} onClick={() => setActivePlan(i)} className="clickable"
                style={{ background: plan.highlight ? 'var(--orange)' : 'var(--navy)', border: activePlan === i && !plan.highlight ? '2px solid var(--orange)' : plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', cursor: 'pointer', transform: plan.highlight ? 'scale(1.03)' : 'scale(1)', boxShadow: plan.highlight ? '0 20px 60px rgba(232,93,4,0.35)' : 'none', transition: 'all 0.2s' }}>
                {plan.highlight && <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>Most Popular</div>}
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '22px', fontWeight: 700 }}>{plan.name}</div>
                <div style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>{plan.desc}</div>
                <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-syne)', fontSize: '48px', fontWeight: 800 }}>kr {plan.price}</span>
                  <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)', fontSize: '14px' }}>/month</span>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: plan.highlight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)' }}>
                      <Check size={15} color={plan.highlight ? '#fff' : 'var(--orange)'} strokeWidth={3} />{f}
                    </li>
                  ))}
                </ul>
                <button onClick={e => { e.stopPropagation(); openAuth('join'); }}
                  style={{ width: '100%', padding: '13px', background: plan.highlight ? '#fff' : 'var(--orange)', color: plan.highlight ? 'var(--orange)' : '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  className="hover:opacity-90 transition-opacity">
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section id="trainers" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <div style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Our Team</div>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>World-Class Trainers</h2>
              <button onClick={() => showToast('All 12 trainers available on the full site!')} style={{ color: 'var(--orange)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                Meet all trainers <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRAINERS.map(trainer => (
              <div key={trainer.name} style={{ background: 'var(--navy-mid)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                className="hover:scale-[1.02] hover:shadow-xl">
                <div style={{ position: 'relative', height: '260px' }}>
                  <Image src={trainer.img} alt={trainer.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                    <div className="flex items-center gap-4">
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>{trainer.rating}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>{trainer.clients} clients</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '17px', fontWeight: 700 }}>{trainer.name}</div>
                  <div style={{ color: 'var(--orange-light)', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>{trainer.role}</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6, marginTop: '10px' }}>{trainer.bio}</p>
                  <button onClick={() => { setTrainerModal(trainer); setTrainerBooked(false); }}
                    style={{ marginTop: '14px', width: '100%', padding: '9px', border: '1px solid rgba(232,93,4,0.4)', borderRadius: '6px', color: 'var(--orange)', fontSize: '13px', fontWeight: 600, background: 'none', cursor: 'pointer' }}
                    className="hover:bg-orange-500/10 transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section id="contact" style={{ background: 'var(--orange)', padding: '80px 0' }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1 }}>Ready to Transform Your Life?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginTop: '16px', maxWidth: '480px', margin: '16px auto 0' }}>
            Start with 7 days free. No commitments. Cancel anytime.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <button onClick={() => openAuth('join')}
              style={{ background: '#fff', color: 'var(--orange)', borderRadius: '8px', padding: '14px 32px', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              className="hover:opacity-90 transition-opacity">
              Start Free Trial
            </button>
            <button onClick={() => scrollTo('schedule')}
              style={{ border: '2px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '8px', padding: '14px 28px', fontSize: '16px', fontWeight: 600, background: 'none', cursor: 'pointer' }}
              className="hover:bg-white/10 transition-colors">
              Take a Tour
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--navy-mid)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 0 32px' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ background: 'var(--orange)', borderRadius: '6px' }} className="w-7 h-7 flex items-center justify-center"><Dumbbell size={14} color="#fff" /></div>
                <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '16px' }}>Bergen<span style={{ color: 'var(--orange)' }}>Fitness</span></span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.7 }}>Bergen&apos;s premier fitness destination. Open 24/7, 365 days a year.</p>
              <span className="demo-badge mt-4 inline-block">Fictional Demo Site</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, marginBottom: '16px', fontSize: '14px' }}>Quick Links</div>
              {['Classes', 'Membership', 'Trainers', 'Nutrition', 'Blog'].map(l => (
                <button key={l} onClick={() => scrollTo(l.toLowerCase())} style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{l}</button>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, marginBottom: '16px', fontSize: '14px' }}>Contact</div>
              {[{ icon: MapPin, text: 'Bryggen 14, Bergen' }, { icon: Phone, text: '+47 555 01 234' }, { icon: Mail, text: 'info@bergenfitness.no' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 mb-3"><Icon size={14} color="var(--orange)" /><span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{text}</span></div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, marginBottom: '16px', fontSize: '14px' }}>Hours</div>
              {[['Mon–Fri', '05:30–23:00'], ['Sat–Sun', '07:00–21:00'], ['Holidays', '08:00–20:00']].map(([day, hours]) => (
                <div key={day} className="flex justify-between mb-2">
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{day}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500 }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'center' }}>
            © 2025 BergenFitness · Demo site by Sloth Studio ·{' '}
            <a href="https://www.fiverr.com/sloth3932" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange-light)', textDecoration: 'none', fontWeight: 600 }}>Want this for your business? Get a quote →</a>
          </div>
        </div>
      </footer>

      {/* FLOATING HIRE ME */}
      <a href="https://www.fiverr.com/sloth3932" target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--orange)', color: '#fff', borderRadius: '100px', padding: '12px 20px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 24px rgba(232,93,4,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
        🛠 Built by Sloth Studio →
      </a>
    </div>
  );
}
