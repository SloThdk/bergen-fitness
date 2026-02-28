"use client";
import { useState, useEffect } from "react";

/* ─── Data ─── */
const TRAINERS: Record<string, { name: string; role: string; spec: string; email: string; phone: string; photo: string; accent: string }> = {
  "Erik Hansen":  { name: "Erik Hansen",  role: "Sjefstrener", spec: "HIIT & Boksing", email: "erik@bergenfitness.no", phone: "+47 901 23 456", photo: "https://images.pexels.com/photos/5209197/pexels-photo-5209197.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#EF4444" },
  "Lise Dahl":    { name: "Lise Dahl",    role: "Yoga & Pilates", spec: "Yoga & Pilates", email: "lise@bergenfitness.no", phone: "+47 902 34 567", photo: "https://images.pexels.com/photos/6916300/pexels-photo-6916300.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#8B5CF6" },
  "Mads Berg":    { name: "Mads Berg",    role: "Styrke & CrossFit", spec: "Styrke & CrossFit", email: "mads@bergenfitness.no", phone: "+47 903 45 678", photo: "https://images.pexels.com/photos/14762174/pexels-photo-14762174.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#F97316" },
  "Sara Moe":     { name: "Sara Moe",     role: "Spinning & Kondisjon", spec: "Spinning & Kondisjon", email: "sara@bergenfitness.no", phone: "+47 904 56 789", photo: "https://images.pexels.com/photos/5669172/pexels-photo-5669172.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop", accent: "#06B6D4" },
};

const NAMES = ["Anna Hansen","Kari Johansen","Lars Olsen","Emma Berg","Ole Andersen","Ingrid Larsen","Thomas Eriksen","Sofie Dahl","Magnus Christensen","Marte Pedersen","Henrik Nielsen","Nina Svensson","Andreas Haugen","Ida Krog","Jonas Solberg","Hilde Bakke","Martin Strand","Camilla Lie","Sander Lund","Line Vold","Kristian Holm","Silje Bøe","Daniel Aas","Eva Hagen"];

interface ClassEntry { id: string; name: string; time: string; duration: number; day: number; category: string; color: string; maxSpots: number; attendees: string[]; }

function genClasses(trainer: string): ClassEntry[] {
  const classes: ClassEntry[] = [];
  const types: Record<string, { name: string; cat: string; col: string; dur: number; max: number }[]> = {
    "Erik Hansen":  [{ name: "HIIT-Økt", cat: "HIIT", col: "#EF4444", dur: 45, max: 20 }, { name: "Boksing", cat: "Boksing", col: "#DC2626", dur: 60, max: 14 }],
    "Lise Dahl":    [{ name: "Morgen-Yoga", cat: "Yoga", col: "#8B5CF6", dur: 60, max: 18 }, { name: "Pilates", cat: "Pilates", col: "#EC4899", dur: 50, max: 16 }],
    "Mads Berg":    [{ name: "Styrkesirkel", cat: "Styrke", col: "#F97316", dur: 50, max: 16 }, { name: "CrossFit", cat: "CrossFit", col: "#EAB308", dur: 60, max: 18 }],
    "Sara Moe":     [{ name: "Spinning", cat: "Spinning", col: "#06B6D4", dur: 45, max: 22 }, { name: "Kondisjon", cat: "Kondisjon", col: "#14B8A6", dur: 40, max: 20 }],
  };
  const trainerTypes = types[trainer] || [];
  const times = ["06:00","07:00","09:00","10:00","12:00","17:30","18:00","19:00","19:30"];
  let id = 0;
  for (let d = 0; d < 7; d++) {
    const count = 2 + Math.floor(Math.random() * 2);
    for (let c = 0; c < count; c++) {
      const t = trainerTypes[c % trainerTypes.length];
      const time = times[(d * 3 + c) % times.length];
      const att = Math.floor(t.max * (0.4 + Math.random() * 0.5));
      classes.push({ id: `c${id++}`, name: t.name, time, duration: t.dur, day: d, category: t.cat, color: t.col, maxSpots: t.max, attendees: NAMES.slice(0, att) });
    }
  }
  return classes;
}

const DAYS_NO = ["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag","Søndag"];
const DAYS_SHORT = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDate(d: Date) { return d.toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }); }

/* ─── Icons ─── */
function IconCalendar() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconUsers() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconChart() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function IconLogout() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }

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
  type Tab = "dag" | "klienter" | "statistikk";
  const [tab, setTab] = useState<Tab>("dag");
  const [selectedDay, setSelectedDay] = useState(0);
  const trainer = TRAINERS[trainerName]!;
  const classes = genClasses(trainerName);
  const today = new Date();
  const dayClasses = classes.filter(c => c.day === selectedDay).sort((a, b) => a.time.localeCompare(b.time));
  const totalClients = classes.reduce((sum, c) => sum + c.attendees.length, 0);
  const totalClasses = classes.length;
  const avgOccupancy = Math.round((classes.reduce((sum, c) => sum + (c.attendees.length / c.maxSpots), 0) / classes.length) * 100);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dag", label: "Ukeoversikt", icon: <IconCalendar /> },
    { key: "klienter", label: "Mine klienter", icon: <IconUsers /> },
    { key: "statistikk", label: "Statistikk", icon: <IconChart /> },
  ];

  function handleLogout() { try { sessionStorage.removeItem("bf_trainer"); } catch {} window.location.href = "/"; }

  const allClients = [...new Set(classes.flatMap(c => c.attendees))].sort();

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", display: "flex" }}>
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
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 28px 80px" }}>
          {/* Demo badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px", padding: "8px 14px", background: "rgba(232,93,4,0.06)", border: "1px solid rgba(232,93,4,0.15)", borderRadius: "8px" }}>
            <span style={{ background: "var(--orange)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "100px", letterSpacing: "0.06em" }}>DEMO</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>Demo -- alt kan tilpasses, utvides og integreres etter behov</span>
          </div>

          {/* ── UKEOVERSIKT ── */}
          {tab === "dag" && (
            <div>
              <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "3px" }}>Hei, {trainerName.split(" ")[0]}</h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "22px" }}>{fmtDate(addDays(today, selectedDay))}</p>

              {/* KPI cards */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "22px", flexWrap: "wrap" }}>
                {[{ label: "Timer denne uka", val: totalClasses }, { label: "Totalt deltakere", val: totalClients }, { label: "Snitt belegg", val: avgOccupancy + "%" }].map(({ label, val }) => (
                  <div key={label} style={{ flex: 1, minWidth: "100px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px 18px" }}>
                    <div style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: trainer.accent, lineHeight: 1, marginBottom: "4px" }}>{val}</div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Day selector */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "18px", overflowX: "auto" }}>
                {DAYS_SHORT.map((d, i) => {
                  const active = selectedDay === i;
                  const date = addDays(today, i);
                  const count = classes.filter(c => c.day === i).length;
                  return (
                    <button key={d} onClick={() => setSelectedDay(i)} style={{ padding: "10px 14px", borderRadius: "8px", cursor: "pointer", background: active ? `${trainer.accent}18` : "var(--navy-mid)", border: `1px solid ${active ? trainer.accent + "55" : "rgba(255,255,255,0.06)"}`, textAlign: "center", flexShrink: 0, minWidth: "60px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: active ? trainer.accent : "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{d}</div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: active ? "#fff" : "rgba(255,255,255,0.6)" }}>{date.getDate()}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{count} timer</div>
                    </button>
                  );
                })}
              </div>

              {/* Classes for selected day */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {dayClasses.length === 0 ? (
                  <div style={{ padding: "48px", textAlign: "center", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>Ingen timer denne dagen.</p></div>
                ) : dayClasses.map(cls => {
                  const occ = Math.round((cls.attendees.length / cls.maxSpots) * 100);
                  const full = cls.attendees.length >= cls.maxSpots;
                  return (
                    <div key={cls.id} style={{ background: "var(--navy-mid)", border: `1px solid ${cls.color}22`, borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: "70px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px 8px", background: "rgba(0,0,0,0.2)" }}>
                          <span style={{ fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: 800, color: "#fff" }}>{cls.time}</span>
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>{cls.duration} min</span>
                        </div>
                        <div style={{ flex: 1, padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cls.color }} />
                            <span style={{ fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: 700, color: "#fff" }}>{cls.name}</span>
                            <span style={{ fontSize: "10px", color: cls.color, background: `${cls.color}15`, padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>{cls.category}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{cls.attendees.length}/{cls.maxSpots} deltakere</span>
                            <div style={{ flex: 1, maxWidth: "120px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${occ}%`, height: "100%", background: full ? "#ef4444" : cls.color, borderRadius: "2px", transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: "10px", color: full ? "#ef4444" : "rgba(255,255,255,0.4)", fontWeight: 600 }}>{full ? "FULLT" : `${occ}%`}</span>
                          </div>
                        </div>
                      </div>
                      {/* Attendee list */}
                      <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {cls.attendees.map((name, i) => (
                          <span key={i} style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: "4px" }}>{name}</span>
                        ))}
                        {cls.attendees.length < cls.maxSpots && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", padding: "3px 8px" }}>+{cls.maxSpots - cls.attendees.length} ledige</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MINE KLIENTER ── */}
          {tab === "klienter" && (
            <div>
              <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "3px" }}>Mine klienter</h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "22px" }}>{allClients.length} unike deltakere denne uka</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
                {allClients.map((name, i) => {
                  const clientClasses = classes.filter(c => c.attendees.includes(name));
                  return (
                    <div key={name} style={{ background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${trainer.accent}15`, border: `1px solid ${trainer.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: trainer.accent, flexShrink: 0 }}>{name[0]}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{name}</div>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{clientClasses.length} timer denne uka</div>
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
              <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "3px" }}>Statistikk</h1>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "22px" }}>Oversikt over dine timer og deltakere</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "28px" }}>
                {[{ label: "Timer denne uka", val: totalClasses, color: trainer.accent }, { label: "Totalt deltakere", val: totalClients, color: "#4ade80" }, { label: "Snitt belegg", val: avgOccupancy + "%", color: "#fbbf24" }, { label: "Fulle timer", val: classes.filter(c => c.attendees.length >= c.maxSpots).length, color: "#ef4444" }].map(({ label, val, color }) => (
                  <div key={label} style={{ background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "20px" }}>
                    <div style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: 800, color, lineHeight: 1, marginBottom: "6px" }}>{val}</div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Per-day breakdown */}
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>Timer per dag</h2>
              <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
                {DAYS_SHORT.map((d, i) => {
                  const dayC = classes.filter(c => c.day === i);
                  const dayAtt = dayC.reduce((s, c) => s + c.attendees.length, 0);
                  return (
                    <div key={d} style={{ flex: 1, background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>{d}</div>
                      <div style={{ height: "60px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "6px" }}>
                        <div style={{ width: "16px", borderRadius: "4px 4px 0 0", background: trainer.accent, height: `${Math.max(8, (dayC.length / 4) * 60)}px`, opacity: 0.8 }} />
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>{dayC.length}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{dayAtt} pers</div>
                    </div>
                  );
                })}
              </div>

              {/* Category breakdown */}
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>Fordeling per type</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.entries(classes.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([cat, count]) => {
                  const cls = classes.find(c => c.category === cat);
                  const pct = Math.round((count / totalClasses) * 100);
                  return (
                    <div key={cat} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--navy-mid)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cls?.color || trainer.accent }} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", width: "100px" }}>{cat}</span>
                      <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: cls?.color || trainer.accent, borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, width: "50px", textAlign: "right" }}>{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "24px 0 36px", display: "flex", justifyContent: "center" }}>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Built by Sloth Studio</a>
        </div>
      </main>

      <style>{`@media (max-width: 768px) { .bf-sidebar { display: none !important; } }`}</style>
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
