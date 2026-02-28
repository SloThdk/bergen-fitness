"use client";
import { useState, useEffect, useRef, useMemo } from "react";

/* ─── Data ─── */
const TRAINERS: Record<string, { name: string; role: string; spec: string; email: string; phone: string; photo: string; accent: string }> = {
  "Erik Hansen":  { name: "Erik Hansen",  role: "Sjefstrener", spec: "HIIT & Boksing", email: "erik@bergenfitness.no", phone: "+47 901 23 456", photo: "https://images.pexels.com/photos/5209197/pexels-photo-5209197.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#EF4444" },
  "Lise Dahl":    { name: "Lise Dahl",    role: "Yoga & Pilates", spec: "Yoga & Pilates", email: "lise@bergenfitness.no", phone: "+47 902 34 567", photo: "https://images.pexels.com/photos/6916300/pexels-photo-6916300.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#8B5CF6" },
  "Mads Berg":    { name: "Mads Berg",    role: "Styrke & CrossFit", spec: "Styrke & CrossFit", email: "mads@bergenfitness.no", phone: "+47 903 45 678", photo: "https://images.pexels.com/photos/14762174/pexels-photo-14762174.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#F97316" },
  "Sara Moe":     { name: "Sara Moe",     role: "Spinning & Kondisjon", spec: "Spinning & Kondisjon", email: "sara@bergenfitness.no", phone: "+47 904 56 789", photo: "https://images.pexels.com/photos/5669172/pexels-photo-5669172.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#06B6D4" },
};

const MEMBER_NAMES = ["Anna Hansen","Kari Johansen","Lars Olsen","Emma Berg","Ole Andersen","Ingrid Larsen","Thomas Eriksen","Sofie Dahl","Magnus Christensen","Marte Pedersen","Henrik Nielsen","Nina Svensson","Andreas Haugen","Ida Krog","Jonas Solberg","Hilde Bakke","Martin Strand","Camilla Lie","Sander Lund","Line Vold","Kristian Holm","Silje Boe","Daniel Aas","Eva Hagen","Fredrik Moe","Julie Vik","Robert Haug","Thea Lien","Oscar Myhre","Emilie Roth"];

function seededRandom(seed: number) { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; }; }

interface ClassEntry { id: string; name: string; time: string; duration: number; category: string; color: string; maxSpots: number; attendees: string[]; date: string; }

const CLASS_TYPES: Record<string, { name: string; cat: string; col: string; dur: number; max: number }[]> = {
  "Erik Hansen":  [{ name: "HIIT-Okt", cat: "HIIT", col: "#EF4444", dur: 45, max: 20 }, { name: "Boksing", cat: "Boksing", col: "#DC2626", dur: 60, max: 14 }, { name: "Funksjonell trening", cat: "Funksjonell", col: "#F59E0B", dur: 50, max: 16 }],
  "Lise Dahl":    [{ name: "Morgen-Yoga", cat: "Yoga", col: "#8B5CF6", dur: 60, max: 18 }, { name: "Pilates", cat: "Pilates", col: "#EC4899", dur: 50, max: 16 }, { name: "Restorativ Yoga", cat: "Yoga", col: "#A78BFA", dur: 75, max: 12 }],
  "Mads Berg":    [{ name: "Styrkesirkel", cat: "Styrke", col: "#F97316", dur: 50, max: 16 }, { name: "CrossFit", cat: "CrossFit", col: "#EAB308", dur: 60, max: 18 }, { name: "Olympisk lofting", cat: "Styrke", col: "#FB923C", dur: 45, max: 10 }],
  "Sara Moe":     [{ name: "Spinning", cat: "Spinning", col: "#06B6D4", dur: 45, max: 22 }, { name: "Kondisjon", cat: "Kondisjon", col: "#14B8A6", dur: 40, max: 20 }, { name: "Intervall-sykling", cat: "Spinning", col: "#0891B2", dur: 50, max: 18 }],
};

const TIMES = ["06:00","07:00","07:30","09:00","10:00","10:30","12:00","14:00","16:00","17:00","17:30","18:00","18:30","19:00","19:30","20:00"];

function generateDayClasses(trainer: string, date: Date): ClassEntry[] {
  const dow = date.getDay();
  if (dow === 0) return []; // Sunday
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + trainer.charCodeAt(0) * 31;
  const rng = seededRandom(seed);
  const types = CLASS_TYPES[trainer] || [];
  if (!types.length) return [];
  const count = dow === 6 ? 2 + Math.floor(rng() * 2) : 3 + Math.floor(rng() * 3);
  const classes: ClassEntry[] = [];
  const usedTimes = new Set<string>();
  const dateStr = date.toISOString().split('T')[0];
  for (let i = 0; i < count; i++) {
    const t = types[Math.floor(rng() * types.length)];
    let time = TIMES[Math.floor(rng() * TIMES.length)];
    let att = 0;
    while (usedTimes.has(time) && att < 12) { time = TIMES[Math.floor(rng() * TIMES.length)]; att++; }
    if (usedTimes.has(time)) continue;
    usedTimes.add(time);
    const numAtt = Math.floor(rng() * (t.max + 3));
    const attendees = MEMBER_NAMES.slice(0, Math.min(numAtt, t.max)).sort(() => rng() - 0.5);
    classes.push({ id: `${dateStr}-${time}-${t.name}`, name: t.name, time, duration: t.dur, category: t.cat, color: t.col, maxSpots: t.max, attendees: attendees.slice(0, Math.min(numAtt, t.max)), date: dateStr });
  }
  return classes.sort((a, b) => a.time.localeCompare(b.time));
}

const DAYS_SHORT = ["Man","Tir","Ons","Tor","Fre","Lor","Son"];
const MONTHS_NO = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];

function getMonday(d: Date) { const r = new Date(d); const day = r.getDay(); const diff = r.getDate() - day + (day === 0 ? -6 : 1); r.setDate(diff); r.setHours(0,0,0,0); return r; }

/* ─── Icons (inline SVG) ─── */
function IconCalendar() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconUsers() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconChart() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function IconLogout() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconMonth() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="4" x2="9" y2="22"/><line x1="15" y1="4" x2="15" y2="22"/><line x1="3" y1="16" x2="21" y2="16"/></svg>; }
function IconX() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IconChevL() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function IconChevR() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }

/* ─── Login ─── */
function TrainerLogin({ onLogin }: { onLogin: (name: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const trainers = Object.values(TRAINERS);
  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: 800, color: "#fff" }}>Bergen Fitness</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", background: "rgba(232,93,4,0.1)", border: "1px solid rgba(232,93,4,0.25)", borderRadius: "4px", padding: "3px 10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--orange)" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--orange)" }}>Trenerportal</span>
          </div>
        </div>
        <div style={{ background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "28px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Logg inn som trener</h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>Velg ditt navn og skriv pinkoden din.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "18px" }}>
            {trainers.map(t => (
              <button key={t.name} onClick={() => setSel(t.name)} style={{ padding: "12px 8px", borderRadius: "10px", cursor: "pointer", background: sel === t.name ? `${t.accent}15` : "transparent", border: `1px solid ${sel === t.name ? t.accent + "55" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", gap: "10px", transition: "all 0.12s" }}>
                <img src={t.photo} alt={t.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${sel === t.name ? t.accent : "rgba(255,255,255,0.1)"}`, opacity: sel === t.name ? 1 : 0.6 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "12px", fontWeight: sel === t.name ? 700 : 500, color: sel === t.name ? "#fff" : "rgba(255,255,255,0.6)" }}>{t.name}</div>
                  <div style={{ fontSize: "10px", color: t.accent, opacity: sel === t.name ? 1 : 0.5 }}>{t.role}</div>
                </div>
              </button>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (!sel) return; setLoading(true); setTimeout(() => { setLoading(false); onLogin(sel); }, 600); }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="password" placeholder="Pinkode" value={pin} onChange={e => setPin(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "16px", letterSpacing: "0.3em", outline: "none", boxSizing: "border-box" as const }} />
            <button type="submit" disabled={!sel || loading} style={{ background: !sel ? "rgba(255,255,255,0.05)" : "var(--orange)", color: !sel ? "rgba(255,255,255,0.3)" : "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: !sel ? "default" : "pointer" }}>{loading ? "Logger inn..." : "Logg inn"}</button>
          </form>
          <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(232,93,4,0.05)", border: "1px solid rgba(232,93,4,0.12)", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", margin: 0 }}><span style={{ color: "var(--orange)", fontWeight: 600 }}>Demo</span> -- velg et navn og skriv en vilkarlig pinkode. Alt kan tilpasses etter behov.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
function TrainerDashboard({ trainerName }: { trainerName: string }) {
  type Tab = "uke" | "maned" | "klienter" | "statistikk";
  const [tab, setTab] = useState<Tab>("uke");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; }); // Mon=0
  const [toast, setToast] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState<{ classId: string; attendee: string } | null>(null);
  const [removedAttendees, setRemovedAttendees] = useState<Record<string, string[]>>({});
  const [monthDate, setMonthDate] = useState(new Date());
  const loginShown = useRef(false);

  useEffect(() => { if (!loginShown.current) { loginShown.current = true; setToast(`Logget inn som ${trainerName}`); setTimeout(() => setToast(""), 2500); } }, [trainerName]);

  const trainer = TRAINERS[trainerName]!;
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Week days
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  }), [weekStart]);

  const selectedDate = weekDays[selectedDay];

  // Get classes for a date with removals applied
  const getClasses = (date: Date) => {
    const raw = generateDayClasses(trainerName, date);
    return raw.map(c => ({
      ...c,
      attendees: c.attendees.filter(a => !(removedAttendees[c.id] || []).includes(a)),
    }));
  };

  const dayClasses = useMemo(() => getClasses(selectedDate), [selectedDate, trainerName, removedAttendees]);

  // Week stats
  const weekClasses = useMemo(() => weekDays.flatMap(d => getClasses(d)), [weekDays, trainerName, removedAttendees]);
  const totalClients = weekClasses.reduce((sum, c) => sum + c.attendees.length, 0);
  const totalClassCount = weekClasses.length;
  const avgOccupancy = weekClasses.length > 0 ? Math.round((weekClasses.reduce((sum, c) => sum + (c.attendees.length / c.maxSpots), 0) / weekClasses.length) * 100) : 0;
  const allClients = [...new Set(weekClasses.flatMap(c => c.attendees))].sort();

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "uke", label: "Ukeoversikt", icon: <IconCalendar /> },
    { key: "maned", label: "Kalender", icon: <IconMonth /> },
    { key: "klienter", label: "Klienter", icon: <IconUsers /> },
    { key: "statistikk", label: "Statistikk", icon: <IconChart /> },
  ];

  function handleLogout() { try { sessionStorage.removeItem("bf_trainer"); } catch {} window.location.href = "https://bergen-fitness.pages.dev"; }

  function removeAttendee(classId: string, attendee: string) {
    setRemovedAttendees(prev => ({ ...prev, [classId]: [...(prev[classId] || []), attendee] }));
    showToast(`${attendee} fjernet fra timen`);
    setCancelConfirm(null);
  }

  // Month calendar
  const monthDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday start
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [monthDate]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", display: "flex" }}>
      {/* Cancel confirmation */}
      {cancelConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={e => e.target === e.currentTarget && setCancelConfirm(null)}>
          <div style={{ background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px", fontFamily: "var(--font-syne)" }}>Fjerne deltaker?</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "20px" }}>
              Fjern <strong style={{ color: "#fff" }}>{cancelConfirm.attendee}</strong> fra timen?
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setCancelConfirm(null)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: "13px", fontWeight: 600 }}>Avbryt</button>
              <button onClick={() => removeAttendee(cancelConfirm.classId, cancelConfirm.attendee)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: "13px", fontWeight: 700 }}>Fjern</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="bf-sidebar" style={{ width: "220px", flexShrink: 0, background: "var(--navy-mid)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: 800, color: "#fff" }}>Bergen Fitness</span>
          <img src={trainer.photo} alt={trainerName} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${trainer.accent}` }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{trainer.name}</div>
            <div style={{ fontSize: "11px", color: trainer.accent }}>{trainer.role}</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {tabs.map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: active ? `${trainer.accent}18` : "transparent", border: `1px solid ${active ? trainer.accent + "44" : "transparent"}`, cursor: "pointer", width: "100%", textAlign: "left", color: active ? "#fff" : "rgba(255,255,255,0.5)", transition: "all 0.1s" }}>
                <span style={{ color: active ? trainer.accent : "rgba(255,255,255,0.4)", display: "flex" }}>{t.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: active ? 700 : 400 }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#ef4444", fontSize: "13px", fontWeight: 600 }}><IconLogout /> Logg ut</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: "220px", minWidth: 0 }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "28px 24px 80px" }}>
          {/* Demo badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "18px", padding: "6px 12px", background: "rgba(232,93,4,0.06)", border: "1px solid rgba(232,93,4,0.15)", borderRadius: "8px" }}>
            <span style={{ background: "var(--orange)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "100px", letterSpacing: "0.06em" }}>DEMO</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Alt kan tilpasses, utvides og integreres etter behov</span>
          </div>

          {/* ── UKEOVERSIKT ── */}
          {tab === "uke" && (
            <div>
              <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "3px" }}>Hei, {trainerName.split(" ")[0]}</h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "18px" }}>{selectedDate.toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>

              {/* KPI cards */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
                {[{ label: "Timer denne uka", val: totalClassCount }, { label: "Totalt deltakere", val: totalClients }, { label: "Snitt belegg", val: avgOccupancy + "%" }].map(({ label, val }) => (
                  <div key={label} style={{ flex: 1, minWidth: "100px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "14px 16px" }}>
                    <div style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 800, color: trainer.accent, lineHeight: 1, marginBottom: "3px" }}>{val}</div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Week navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); setSelectedDay(0); }}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <IconChevL />
                </button>
                <button onClick={() => { setWeekStart(getMonday(new Date())); const d = new Date().getDay(); setSelectedDay(d === 0 ? 6 : d - 1); }}
                  style={{ fontSize: "11px", color: trainer.accent, fontWeight: 600, padding: "6px 14px", borderRadius: "6px", background: `${trainer.accent}10`, border: `1px solid ${trainer.accent}30` }}>
                  I dag
                </button>
                <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); setSelectedDay(0); }}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <IconChevR />
                </button>
              </div>

              {/* Day selector */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "14px", overflowX: "auto" }} className="day-tabs">
                {weekDays.map((d, i) => {
                  const active = selectedDay === i;
                  const isToday = d.toDateString() === new Date().toDateString();
                  const isSun = d.getDay() === 0;
                  const dc = getClasses(d);
                  return (
                    <button key={i} onClick={() => setSelectedDay(i)} style={{ flex: "1 0 0", minWidth: "50px", padding: "8px 6px", borderRadius: "8px", textAlign: "center", cursor: "pointer",
                      background: active ? `${trainer.accent}18` : "var(--navy-mid)",
                      border: `1px solid ${active ? trainer.accent + "55" : isToday ? trainer.accent + "40" : "rgba(255,255,255,0.06)"}`,
                      opacity: isSun ? 0.35 : 1 }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, color: active ? trainer.accent : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{DAYS_SHORT[i]}</div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: active ? "#fff" : "rgba(255,255,255,0.6)", margin: "2px 0" }}>{d.getDate()}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{dc.length} timer</div>
                      {isToday && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: active ? "#fff" : trainer.accent, margin: "3px auto 0" }} />}
                    </button>
                  );
                })}
              </div>

              {/* Classes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedDate.getDay() === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "rgba(255,255,255,0.35)" }}>Senteret er stengt pa sondager</div>
                ) : dayClasses.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "rgba(255,255,255,0.35)" }}>Ingen timer denne dagen</div>
                ) : dayClasses.map(cls => {
                  const occ = Math.round((cls.attendees.length / cls.maxSpots) * 100);
                  const full = cls.attendees.length >= cls.maxSpots;
                  return (
                    <div key={cls.id} style={{ background: "var(--navy-mid)", border: `1px solid ${cls.color}22`, borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: "65px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px 6px", background: "rgba(0,0,0,0.15)" }}>
                          <span style={{ fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: 800, color: "#fff" }}>{cls.time}</span>
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>{cls.duration} min</span>
                        </div>
                        <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cls.color, flexShrink: 0 }} />
                            <span style={{ fontFamily: "var(--font-syne)", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{cls.name}</span>
                            <span style={{ fontSize: "9px", color: cls.color, background: `${cls.color}15`, padding: "2px 7px", borderRadius: "4px", fontWeight: 600 }}>{cls.category}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{cls.attendees.length}/{cls.maxSpots}</span>
                            <div style={{ flex: 1, maxWidth: "100px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${occ}%`, height: "100%", background: full ? "#ef4444" : cls.color, borderRadius: "2px" }} />
                            </div>
                            <span style={{ fontSize: "10px", color: full ? "#ef4444" : "rgba(255,255,255,0.35)", fontWeight: 600 }}>{full ? "FULLT" : `${occ}%`}</span>
                          </div>
                        </div>
                      </div>
                      {/* Attendee list with cancel buttons */}
                      <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {cls.attendees.map((name, i) => (
                          <span key={i} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            {name}
                            <button onClick={() => setCancelConfirm({ classId: cls.id, attendee: name })} style={{ color: "rgba(248,113,113,0.6)", display: "flex", padding: "0 1px" }} title="Fjern deltaker">
                              <IconX />
                            </button>
                          </span>
                        ))}
                        {cls.attendees.length < cls.maxSpots && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", padding: "3px 8px" }}>+{cls.maxSpots - cls.attendees.length} ledige</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MONTH CALENDAR ── */}
          {tab === "maned" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <button onClick={() => { const d = new Date(monthDate); d.setMonth(d.getMonth() - 1); setMonthDate(d); }}
                  style={{ width: "34px", height: "34px", borderRadius: "8px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <IconChevL />
                </button>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: "20px", fontWeight: 800 }}>{MONTHS_NO[monthDate.getMonth()]} {monthDate.getFullYear()}</div>
                </div>
                <button onClick={() => { const d = new Date(monthDate); d.setMonth(d.getMonth() + 1); setMonthDate(d); }}
                  style={{ width: "34px", height: "34px", borderRadius: "8px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <IconChevR />
                </button>
              </div>

              {/* Grid header */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "2px" }}>
                {DAYS_SHORT.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.35)", padding: "8px 0", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{d}</div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {monthDays.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} style={{ minHeight: "70px" }} />;
                  const isToday = d.toDateString() === new Date().toDateString();
                  const isSun = d.getDay() === 0;
                  const dc = generateDayClasses(trainerName, d);
                  const totalPeople = dc.reduce((s, c) => s + c.attendees.length, 0);
                  return (
                    <button key={d.toISOString()} onClick={() => { setWeekStart(getMonday(d)); const dow = d.getDay(); setSelectedDay(dow === 0 ? 6 : dow - 1); setTab("uke"); }}
                      style={{ minHeight: "70px", padding: "6px", borderRadius: "8px", background: isToday ? `${trainer.accent}12` : "var(--navy-mid)", border: `1px solid ${isToday ? trainer.accent + "44" : "rgba(255,255,255,0.04)"}`, textAlign: "left", cursor: "pointer", opacity: isSun ? 0.3 : 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: "12px", fontWeight: isToday ? 800 : 600, color: isToday ? trainer.accent : "rgba(255,255,255,0.6)", marginBottom: "4px" }}>{d.getDate()}</div>
                      {dc.length > 0 && !isSun && (
                        <>
                          <div style={{ fontSize: "10px", color: trainer.accent, fontWeight: 600 }}>{dc.length} timer</div>
                          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{totalPeople} pers</div>
                          <div style={{ display: "flex", gap: "2px", marginTop: "auto", paddingTop: "4px" }}>
                            {dc.slice(0, 3).map((c, j) => (
                              <div key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.color }} />
                            ))}
                            {dc.length > 3 && <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)" }}>+{dc.length - 3}</span>}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── KLIENTER ── */}
          {tab === "klienter" && (
            <div>
              <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "3px" }}>Mine klienter</h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "18px" }}>{allClients.length} unike deltakere denne uka</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
                {allClients.map(name => {
                  const clientClasses = weekClasses.filter(c => c.attendees.includes(name));
                  return (
                    <div key={name} style={{ background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: `${trainer.accent}15`, border: `1px solid ${trainer.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: trainer.accent, flexShrink: 0 }}>{name[0]}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{name}</div>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{clientClasses.length} timer</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STATISTIKK ── */}
          {tab === "statistikk" && (
            <div>
              <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "3px" }}>Statistikk</h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "18px" }}>Uke {weekStart.getDate()}. {MONTHS_NO[weekStart.getMonth()].slice(0,3).toLowerCase()} - {weekDays[6].getDate()}. {MONTHS_NO[weekDays[6].getMonth()].slice(0,3).toLowerCase()}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "24px" }}>
                {[{ label: "Timer", val: totalClassCount, color: trainer.accent }, { label: "Deltakere", val: totalClients, color: "#4ade80" }, { label: "Snitt belegg", val: avgOccupancy + "%", color: "#fbbf24" }, { label: "Fulle timer", val: weekClasses.filter(c => c.attendees.length >= c.maxSpots).length, color: "#ef4444" }].map(({ label, val, color }) => (
                  <div key={label} style={{ background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "18px" }}>
                    <div style={{ fontFamily: "var(--font-syne)", fontSize: "26px", fontWeight: 800, color, lineHeight: 1, marginBottom: "4px" }}>{val}</div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>Timer per dag</h2>
              <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
                {DAYS_SHORT.map((d, i) => {
                  const dc = getClasses(weekDays[i]);
                  const att = dc.reduce((s, c) => s + c.attendees.length, 0);
                  return (
                    <div key={d} style={{ flex: 1, background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: "6px" }}>{d}</div>
                      <div style={{ height: "50px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "4px" }}>
                        <div style={{ width: "14px", borderRadius: "3px 3px 0 0", background: trainer.accent, height: `${Math.max(6, (dc.length / 6) * 50)}px`, opacity: 0.8 }} />
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>{dc.length}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>{att} pers</div>
                    </div>
                  );
                })}
              </div>

              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>Fordeling per type</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.entries(weekClasses.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([cat, count]) => {
                  const cls = weekClasses.find(c => c.category === cat);
                  const pct = Math.round((count / totalClassCount) * 100);
                  return (
                    <div key={cat} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: cls?.color || trainer.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff", width: "90px" }}>{cat}</span>
                      <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: cls?.color || trainer.accent, borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600, minWidth: "50px", textAlign: "right" }}>{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "24px 0 36px", display: "flex", justifyContent: "center" }}>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Built by Sloth Studio</a>
        </div>
      </main>

      <style>{`@media (max-width: 768px) { .bf-sidebar { display: none !important; } main { margin-left: 0 !important; } }`}</style>
      {toast && <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "10px", padding: "12px 24px", color: "#86efac", fontSize: "14px", fontWeight: 600, zIndex: 300, whiteSpace: "nowrap", backdropFilter: "blur(8px)" }}>{toast}</div>}
    </div>
  );
}

/* ─── Main ─── */
export default function TrainerPage() {
  const [trainer, setTrainer] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => { try { const s = sessionStorage.getItem("bf_trainer"); if (s) setTrainer(s); } catch {} setChecking(false); }, []);
  function handleLogin(name: string) { try { sessionStorage.setItem("bf_trainer", name); } catch {} setTrainer(name); }
  if (checking) return null;
  if (!trainer) return <TrainerLogin onLogin={handleLogin} />;
  return <TrainerDashboard trainerName={trainer} />;
}
