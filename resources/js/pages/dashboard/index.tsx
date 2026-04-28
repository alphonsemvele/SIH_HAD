import { Link } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
    patients_actifs: number; lits_occupes: number; lits_total: number;
    rdv_aujourd_hui: number; rdv_en_attente: number;
    tournees_had: number; tournees_terminees: number;
    admissions_ce_mois: number;
    prescriptions_en_attente: number;
    anomalies_critiques: number;
}
interface Admission     { id: number; initials: string; name: string; room: string; service: string; status: 'Stable'|'Surveillance'|'Critique'; date_entree: string; }
interface TourneeJour   { id: number; service: string; soignant: string; heure_debut: string; statut: string; patients_total: number; patients_vus: number; }
interface Anomalie      { id: number; titre: string; severite: string; patient: string; created_at: string; }
interface PrescriptionR { id: number; numero: string; patient: string; medecin: string; date: string; }
interface ServiceOcc    { id: number; nom: string; total: number; occupes: number; }
interface ActiviteJ     { jour: string; admissions: number; prescriptions: number; tournees: number; }

interface Props {
    stats: Stats;
    dernieres_admissions: Admission[];
    tournees_jour: TourneeJour[];
    anomalies_actives: Anomalie[];
    prescriptions_recentes: PrescriptionR[];
    services_occupation: ServiceOcc[];
    activite_7j: ActiviteJ[];
}

const defaultStats: Stats = {
    patients_actifs: 0, lits_occupes: 0, lits_total: 0,
    rdv_aujourd_hui: 0, rdv_en_attente: 0, tournees_had: 0,
    tournees_terminees: 0, admissions_ce_mois: 0,
    prescriptions_en_attente: 0, anomalies_critiques: 0,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Dashboard({
    stats = defaultStats,
    dernieres_admissions = [],
    tournees_jour = [],
    anomalies_actives = [],
    prescriptions_recentes = [],
    services_occupation = [],
    activite_7j = [],
}: Partial<Props>) {

    const tauxOccupation = stats.lits_total > 0
        ? Math.round((stats.lits_occupes / stats.lits_total) * 100) : 0;
    const maxActivite = Math.max(
        ...activite_7j.map(d => d.admissions + d.prescriptions + d.tournees), 1
    );

    return (
        <DashboardLayout
            title="Tableau de bord"
            subtitle={`Bonjour — ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        >

            {/* ══════════════════════════════════ KPI — 5 cartes colorées */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>

                {/* Patients — bleu */}
                <div style={{ borderRadius: 20, padding: '22px 20px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}/>
                    <div style={{ position: 'absolute', bottom: -20, right: 10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>👥</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>{stats.patients_actifs}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>Patients actifs</div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 3, fontFamily: 'system-ui,sans-serif' }}>+{stats.admissions_ce_mois} ce mois</div>
                </div>

                {/* Occupation — violet */}
                <div style={{ borderRadius: 20, padding: '22px 20px', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}>
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}/>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>🛏️</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>{stats.lits_occupes}<span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7 }}>/{stats.lits_total}</span></div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>Occupation</div>
                    <div style={{ marginTop: 8, height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${tauxOccupation}%`, background: '#fff', borderRadius: 100 }}/>
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>{tauxOccupation}% des lits</div>
                </div>

                {/* RDV — vert */}
                <div style={{ borderRadius: 20, padding: '22px 20px', background: 'linear-gradient(135deg,#065f46,#10b981)', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}/>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>📋</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>{stats.rdv_aujourd_hui}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>RDV aujourd'hui</div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 3, fontFamily: 'system-ui,sans-serif' }}>{stats.rdv_en_attente} en attente</div>
                </div>

                {/* Tournées — orange */}
                <div style={{ borderRadius: 20, padding: '22px 20px', background: 'linear-gradient(135deg,#b45309,#f59e0b)', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(245,158,11,0.35)' }}>
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}/>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>🚗</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>{stats.tournees_had}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>Tournées HAD</div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 3, fontFamily: 'system-ui,sans-serif' }}>{stats.tournees_terminees} terminées</div>
                </div>

                {/* Anomalies — rouge */}
                <div style={{ borderRadius: 20, padding: '22px 20px', background: stats.anomalies_critiques > 0 ? 'linear-gradient(135deg,#991b1b,#ef4444)' : 'linear-gradient(135deg,#374151,#6b7280)', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: stats.anomalies_critiques > 0 ? '0 8px 24px rgba(239,68,68,0.35)' : '0 8px 24px rgba(107,114,128,0.2)' }}>
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}/>
                    {stats.anomalies_critiques > 0 && <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}/>}
                    <div style={{ fontSize: 26, marginBottom: 10 }}>⚠️</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>{stats.anomalies_critiques}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>Anomalies actives</div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 3, fontFamily: 'system-ui,sans-serif' }}>cas critiques</div>
                </div>
            </div>

            {/* ══════════════════════════════════ ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

                {/* Dernières admissions — accent bleu gauche */}
                <Card accentColor="#3b82f6" title="Dernières admissions" link="/lits/occupations" badge={`${dernieres_admissions.length} actives`}>
                    {dernieres_admissions.length === 0
                        ? <EmptyState text="Aucune admission active"/>
                        : dernieres_admissions.map((a, i) => (
                            <Row key={a.id} last={i === dernieres_admissions.length - 1}>
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {a.initials}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{a.room} · {a.service}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                    <StatusBadge status={a.status}/>
                                    <span style={{ fontSize: 11, color: '#c0c0bc' }}>{a.date_entree}</span>
                                </div>
                            </Row>
                        ))
                    }
                </Card>

                {/* Anomalies — accent rouge */}
                <Card accentColor="#ef4444" title="Anomalies actives" link="/anomalies" badge={anomalies_actives.length > 0 ? `${anomalies_actives.length} cas` : undefined} badgeRed>
                    {anomalies_actives.length === 0
                        ? <EmptyState text="Aucune anomalie" icon="✅"/>
                        : anomalies_actives.map((a, i) => (
                            <Row key={a.id} last={i === anomalies_actives.length - 1}>
                                <SeveriteDot severite={a.severite}/>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titre}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.patient} · {a.created_at}</div>
                                </div>
                            </Row>
                        ))
                    }
                </Card>
            </div>

            {/* ══════════════════════════════════ ROW 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

                {/* Tournées HAD — accent orange */}
                <Card accentColor="#f59e0b" title="Tournées HAD — aujourd'hui" link="/tournees" badge={`${stats.tournees_had} planifiées`}>
                    {tournees_jour.length === 0
                        ? <EmptyState text="Aucune tournée" icon="🚗"/>
                        : tournees_jour.map((t, i) => {
                            const pct = t.patients_total > 0 ? Math.round((t.patients_vus / t.patients_total) * 100) : 0;
                            const statutColor: Record<string, string> = { planifiee: '#3b82f6', en_cours: '#f59e0b', terminee: '#10b981', annulee: '#9ca3af' };
                            const statutLabel: Record<string, string> = { planifiee: 'Planifiée', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée' };
                            return (
                                <div key={t.id} style={{ padding: '12px 20px', borderBottom: i < tournees_jour.length - 1 ? '1px solid #f5f5f3' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{t.service}</div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{t.soignant} · {t.heure_debut}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: statutColor[t.statut] ?? '#9ca3af', background: (statutColor[t.statut] ?? '#9ca3af') + '18', borderRadius: 100, padding: '3px 8px' }}>
                                                {statutLabel[t.statut] ?? t.statut}
                                            </span>
                                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{t.patients_vus}/{t.patients_total}</div>
                                        </div>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 100, background: '#f0f0ee', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: t.statut === 'terminee' ? '#10b981' : 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 100 }}/>
                                    </div>
                                </div>
                            );
                        })
                    }
                </Card>

                {/* Prescriptions — accent rose */}
                <Card accentColor="#f53003" title="Prescriptions en attente" link="/prescription" badge={stats.prescriptions_en_attente > 0 ? `${stats.prescriptions_en_attente}` : undefined} badgeRed={stats.prescriptions_en_attente > 5}>
                    {prescriptions_recentes.length === 0
                        ? <EmptyState text="Aucune prescription" icon="💊"/>
                        : prescriptions_recentes.map((p, i) => (
                            <Row key={p.id} last={i === prescriptions_recentes.length - 1}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>💊</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#f53003' }}>{p.numero}</span>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.patient}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.medecin} · {p.date}</div>
                                </div>
                            </Row>
                        ))
                    }
                </Card>

                {/* Occupation services — accent vert */}
                <Card accentColor="#10b981" title="Occupation par service" link="/lits">
                    <div style={{ padding: '8px 20px 20px' }}>
                        {services_occupation.length === 0
                            ? <EmptyState text="Aucun service" icon="🏥"/>
                            : services_occupation.map(s => {
                                const pct = s.total > 0 ? Math.round((s.occupes / s.total) * 100) : 0;
                                const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
                                return (
                                    <div key={s.id} style={{ marginTop: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{s.nom}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color }}>{s.occupes}/{s.total} · {pct}%</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 100, background: '#f0f0ee', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100 }}/>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </Card>
            </div>

            {/* ══════════════════════════════════ ROW 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Activité 7j — fond sombre avec accents */}
                <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg,#1a1a18,#2d2d2a)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>Activité — 7 derniers jours</span>
                    </div>
                    <div style={{ padding: '16px 20px 20px' }}>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            {[['#f53003','Admissions'],['#3b82f6','Prescriptions'],['#10b981','Tournées']].map(([c, l]) => (
                                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }}/>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'system-ui,sans-serif' }}>{l}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
                            {activite_7j.map((d, i) => {
                                const total = d.admissions + d.prescriptions + d.tournees;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-end', height: 100 }}>
                                            {[
                                                { v: d.admissions,    c: '#f53003' },
                                                { v: d.prescriptions, c: '#3b82f6' },
                                                { v: d.tournees,      c: '#10b981' },
                                            ].map(({ v, c }) => v > 0 && (
                                                <div key={c} style={{ width: '100%', height: `${Math.round((v / maxActivite) * 96)}px`, minHeight: 4, background: c, borderRadius: '3px 3px 0 0', opacity: 0.9 }}/>
                                            ))}
                                            {total === 0 && <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}/>}
                                        </div>
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'system-ui,sans-serif' }}>{d.jour}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Accès rapides — fond gradient subtil */}
                <div style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f5f5f3' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a18' }}>Accès rapides</span>
                    </div>
                    <div style={{ padding: '12px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { href: '/patients',          emoji: '👥', label: 'Patients',      sub: `${stats.patients_actifs} actifs`,               grad: 'linear-gradient(135deg,#dbeafe,#eff6ff)', border: '#bfdbfe', dot: '#3b82f6' },
                            { href: '/tournees',          emoji: '🚗', label: 'Tournées HAD',   sub: `${stats.tournees_had} aujourd'hui`,             grad: 'linear-gradient(135deg,#fef3c7,#fffbeb)', border: '#fde68a', dot: '#f59e0b' },
                            { href: '/prescription',      emoji: '💊', label: 'Prescriptions', sub: `${stats.prescriptions_en_attente} en attente`,  grad: 'linear-gradient(135deg,#fee2e2,#fff5f5)', border: '#fecaca', dot: '#f53003' },
                            { href: '/lits',              emoji: '🛏️', label: 'Lits',          sub: `${stats.lits_occupes}/${stats.lits_total} occ.`,grad: 'linear-gradient(135deg,#ede9fe,#f5f3ff)', border: '#ddd6fe', dot: '#8b5cf6' },
                            { href: '/dossiers-medicaux', emoji: '📁', label: 'Dossiers',      sub: 'Médicaux',                                      grad: 'linear-gradient(135deg,#d1fae5,#f0fdf4)', border: '#a7f3d0', dot: '#10b981' },
                            { href: '/anomalies',         emoji: '⚠️', label: 'Anomalies',     sub: `${stats.anomalies_critiques} critiques`,        grad: 'linear-gradient(135deg,#ffedd5,#fff7ed)', border: '#fed7aa', dot: '#f97316' },
                            { href: '/medicaments',       emoji: '🏥', label: 'Médicaments',   sub: 'Stock & Pharmacie',                             grad: 'linear-gradient(135deg,#f0fdf4,#fafaf9)', border: '#e5e7eb', dot: '#6b7280' },
                            { href: '/personnel',         emoji: '👨‍⚕️', label: 'Personnel',    sub: 'RH & Équipes',                                  grad: 'linear-gradient(135deg,#fafaf9,#f5f5f3)', border: '#e5e7eb', dot: '#9ca3af' },
                        ].map(item => (
                            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: item.grad, border: `1.5px solid ${item.border}`, textDecoration: 'none', transition: 'transform 0.15s,box-shadow 0.15s', position: 'relative', overflow: 'hidden' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a18', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                                    <div style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</div>
                                </div>
                                <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: item.dot, opacity: 0.6 }}/>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
}

// ─── Composants ───────────────────────────────────────────────────────────────

/** Card avec barre de couleur en haut */
function Card({ children, accentColor, title, link, badge, badgeRed }: {
    children: React.ReactNode; accentColor: string;
    title: string; link?: string; badge?: string; badgeRed?: boolean;
}) {
    return (
        <div style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {/* Barre de couleur en haut */}
            <div style={{ height: 3, background: accentColor, opacity: 0.85 }}/>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid #f5f5f3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, boxShadow: `0 0 6px ${accentColor}60` }}/>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.2px' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: badgeRed ? '#ef4444' : accentColor, background: badgeRed ? '#fef2f2' : accentColor + '15', border: `1px solid ${badgeRed ? '#fecaca' : accentColor + '30'}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'system-ui,sans-serif' }}>
                            {badge}
                        </span>
                    )}
                    {link && (
                        <Link href={link} style={{ fontSize: 12, color: '#c0c0bc', textDecoration: 'none', fontFamily: 'system-ui,sans-serif', display: 'flex', alignItems: 'center', gap: 2, transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.target as HTMLElement).style.color = accentColor}
                            onMouseLeave={e => (e.target as HTMLElement).style.color = '#c0c0bc'}>
                            Voir tout <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6"/></svg>
                        </Link>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function Row({ children, last }: { children: React.ReactNode; last: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: last ? 'none' : '1px solid #f5f5f3', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafaf9'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            {children}
        </div>
    );
}

function EmptyState({ text, icon = '📭' }: { text: string; icon?: string }) {
    return (
        <div style={{ padding: '28px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <p style={{ fontSize: 13, color: '#c0c0bc', fontFamily: 'system-ui,sans-serif' }}>{text}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: 'Stable' | 'Surveillance' | 'Critique' }) {
    const map = {
        Stable:       { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
        Surveillance: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
        Critique:     { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    };
    const s = map[status];
    return (
        <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 100, padding: '3px 8px', fontFamily: 'system-ui,sans-serif', whiteSpace: 'nowrap' }}>
            {status}
        </span>
    );
}

function SeveriteDot({ severite }: { severite: string }) {
    const map: Record<string, string> = { critique: '#ef4444', elevee: '#f97316', moderee: '#f59e0b', faible: '#3b82f6' };
    const color = map[severite] ?? '#9ca3af';
    return (
        <div style={{ marginTop: 3, width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}60` }}/>
    );
}