import { Head, Link, usePage, router } from '@inertiajs/react';
import { ReactNode, useState, useEffect } from 'react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps { children: ReactNode; title: string; subtitle?: string; }
interface User { id: number; name: string; email: string; role?: string; }
interface PageProps extends InertiaPageProps { auth: { user: User }; }

// ─── Thèmes sidebar ───────────────────────────────────────────────────────────

interface Theme {
    id: string;
    label: string;
    bg: string;
    bgHover: string;
    divider: string;
    userCard: string;
    userBorder: string;
    txtNormal: string;
    accent: string;         // couleur principale (boutons, logo, actif)
    accentLight: string;    // version claire pour glow
}

const THEMES: Theme[] = [
    {
        id: 'navy',
        label: 'Navy',
        bg: '#1a2035', bgHover: '#212840',
        divider: 'rgba(255,255,255,0.07)', userCard: 'rgba(255,255,255,0.05)', userBorder: 'rgba(255,255,255,0.09)',
        txtNormal: 'rgba(255,255,255,0.55)', accent: '#f53003', accentLight: '#ff6b35',
    },
    {
        id: 'slate',
        label: 'Ardoise',
        bg: '#1e293b', bgHover: '#263347',
        divider: 'rgba(255,255,255,0.07)', userCard: 'rgba(255,255,255,0.05)', userBorder: 'rgba(255,255,255,0.09)',
        txtNormal: 'rgba(255,255,255,0.55)', accent: '#38bdf8', accentLight: '#7dd3fc',
    },
    {
        id: 'violet',
        label: 'Violet',
        bg: '#1e1b4b', bgHover: '#272560',
        divider: 'rgba(255,255,255,0.07)', userCard: 'rgba(255,255,255,0.05)', userBorder: 'rgba(255,255,255,0.09)',
        txtNormal: 'rgba(255,255,255,0.55)', accent: '#a78bfa', accentLight: '#c4b5fd',
    },
    {
        id: 'emerald',
        label: 'Émeraude',
        bg: '#022c22', bgHover: '#064e3b',
        divider: 'rgba(255,255,255,0.07)', userCard: 'rgba(255,255,255,0.05)', userBorder: 'rgba(255,255,255,0.09)',
        txtNormal: 'rgba(255,255,255,0.55)', accent: '#10b981', accentLight: '#34d399',
    },
    {
        id: 'rose',
        label: 'Rose',
        bg: '#1f1117', bgHover: '#2d1525',
        divider: 'rgba(255,255,255,0.07)', userCard: 'rgba(255,255,255,0.05)', userBorder: 'rgba(255,255,255,0.09)',
        txtNormal: 'rgba(255,255,255,0.55)', accent: '#f472b6', accentLight: '#fbcfe8',
    },
    {
        id: 'charcoal',
        label: 'Anthracite',
        bg: '#18181b', bgHover: '#27272a',
        divider: 'rgba(255,255,255,0.07)', userCard: 'rgba(255,255,255,0.05)', userBorder: 'rgba(255,255,255,0.09)',
        txtNormal: 'rgba(255,255,255,0.55)', accent: '#facc15', accentLight: '#fde047',
    },
    {
        id: 'ocean',
        label: 'Océan',
        bg: '#0c1a2e', bgHover: '#132240',
        divider: 'rgba(255,255,255,0.07)', userCard: 'rgba(255,255,255,0.05)', userBorder: 'rgba(255,255,255,0.09)',
        txtNormal: 'rgba(255,255,255,0.55)', accent: '#0ea5e9', accentLight: '#38bdf8',
    },
    {
        id: 'white',
        label: 'Blanc',
        bg: '#ffffff', bgHover: '#f5f5f3',
        divider: 'rgba(0,0,0,0.07)', userCard: 'rgba(0,0,0,0.03)', userBorder: 'rgba(0,0,0,0.08)',
        txtNormal: 'rgba(0,0,0,0.45)', accent: '#f53003', accentLight: '#ff6b35',
    },
];

// ─── Couleurs sections (inchangées) ──────────────────────────────────────────

const SEC = {
    dashboard: { bar: '#f53003', icon: '#f87171' },
    sih:       { bar: '#3b82f6', icon: '#60a5fa' },
    pharmacie: { bar: '#10b981', icon: '#34d399' },
    examens:   { bar: '#8b5cf6', icon: '#a78bfa' },
    had:       { bar: '#f97316', icon: '#fb923c' },
    rh:        { bar: '#ec4899', icon: '#f472b6' },
    bottom:    { bar: '#6b7280', icon: '#9ca3af' },
};

const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const STORAGE_KEY = 'medcare_sidebar_theme';

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { url, props } = usePage<PageProps>();
    const { auth } = props;
    const [showUserMenu,   setShowUserMenu]   = useState(false);
    const [collapsed,      setCollapsed]      = useState(false);
    const [showThemePicker,setShowThemePicker]= useState(false);
    const [themeId,        setThemeId]        = useState<string>(() => {
        try { return localStorage.getItem(STORAGE_KEY) ?? 'navy'; } catch { return 'navy'; }
    });

    const T = THEMES.find(t => t.id === themeId) ?? THEMES[0];
    const isLight = themeId === 'white';
    const textColor = isLight ? 'rgba(0,0,0,0.8)' : '#ffffff';

    const applyTheme = (id: string) => {
        setThemeId(id);
        try { localStorage.setItem(STORAGE_KEY, id); } catch {}
        setShowThemePicker(false);
    };

    const isActive = (path: string) => {
        const cur   = url.split('?')[0].replace(/\/$/, '');
        const clean = path.replace(/\/$/, '');
        if (clean === '/dashboard') return cur === '/dashboard';
        return cur === clean || cur.startsWith(clean + '/');
    };

    const W = collapsed ? 68 : 250;

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f3', fontFamily: "'Instrument Sans','system-ui',sans-serif" }}>

                {/* ══════════════════════════ SIDEBAR */}
                <aside style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
                    width: W, transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
                    background: T.bg, display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: '4px 0 28px rgba(0,0,0,0.25)',
                }}>

                    {/* Logo */}
                    <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: collapsed ? '0 16px' : '0 18px', borderBottom: `1px solid ${T.divider}`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${T.accent} 0%,${T.accentLight} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 14px ${T.accent}55` }}>
                                <svg width="17" height="17" fill="none" stroke="#fff" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            {!collapsed && (
                                <div style={{ overflow: 'hidden' }}>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: textColor, letterSpacing: '-0.4px', whiteSpace: 'nowrap', display: 'block' }}>MedCare</span>
                                    <span style={{ fontSize: 9, fontWeight: 600, color: T.txtNormal, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Système d'information</span>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setCollapsed(!collapsed)}
                            style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(128,128,128,0.12)', border: `1px solid ${T.divider}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(128,128,128,0.22)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(128,128,128,0.12)'}>
                            <svg width="11" height="11" fill="none" stroke={T.txtNormal} viewBox="0 0 24 24" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* User card */}
                    {!collapsed && auth?.user && (
                        <div style={{ margin: '12px 10px 4px', background: T.userCard, border: `1px solid ${T.userBorder}`, borderRadius: 14, padding: '11px 13px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},${T.accentLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: `0 2px 8px ${T.accent}40` }}>
                                    {getInitials(auth.user.name)}
                                </div>
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{auth.user.name}</p>
                                    <p style={{ fontSize: 11, color: T.txtNormal, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '1px 0 0' }}>{auth.user.role ?? auth.user.email}</p>
                                </div>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', flexShrink: 0, boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
                            </div>
                        </div>
                    )}
                    {collapsed && auth?.user && (
                        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},${T.accentLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', position: 'relative' }}>
                                {getInitials(auth.user.name)}
                                <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#4ade80', border: `2px solid ${T.bg}` }} />
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 8px 16px', scrollbarWidth: 'none' }}>
                        <NavLink href="/dashboard" label="Tableau de bord" icon={<IconHome   color={SEC.dashboard.icon} />} active={isActive('/dashboard')} collapsed={collapsed} sectionColor={SEC.dashboard.bar} theme={T} />

                        <SectionBar label="SIH" color={SEC.sih.bar} collapsed={collapsed} theme={T} />
                        <NavLink href="/patients"          label="Patients"          icon={<IconUsers    color={SEC.sih.icon} />}   active={isActive('/patients')}          collapsed={collapsed} sectionColor={SEC.sih.bar} theme={T} />
                        <NavLink href="/consultations"     label="Consultations"     icon={<IconConsult  color={SEC.sih.icon} />}   active={isActive('/consultations')}     collapsed={collapsed} sectionColor={SEC.sih.bar} theme={T} />
                        <NavLink href="/dossiers-medicaux" label="Dossiers médicaux" icon={<IconFile     color={SEC.sih.icon} />}   active={isActive('/dossiers-medicaux')} collapsed={collapsed} sectionColor={SEC.sih.bar} theme={T} />
                        <NavLink href="/lits"              label="Lits & Occupation" icon={<IconBed      color={SEC.sih.icon} />}   active={isActive('/lits')}              collapsed={collapsed} sectionColor={SEC.sih.bar} theme={T} />

                        <SectionBar label="Pharmacie" color={SEC.pharmacie.bar} collapsed={collapsed} theme={T} />
                        <NavLink href="/medicaments"  label="Médicaments"   icon={<IconPill         color={SEC.pharmacie.icon} />} active={isActive('/medicaments')}  collapsed={collapsed} sectionColor={SEC.pharmacie.bar} theme={T} />
                        <NavLink href="/anomalies"    label="Anomalies"     icon={<IconAlert        color={SEC.pharmacie.icon} />} active={isActive('/anomalies')}    collapsed={collapsed} sectionColor={SEC.pharmacie.bar} theme={T} />
                        <NavLink href="/prescription" label="Prescriptions" icon={<IconPrescription color={SEC.pharmacie.icon} />} active={isActive('/prescription')} collapsed={collapsed} sectionColor={SEC.pharmacie.bar} theme={T} />
                        <NavLink href="/categories"   label="Catégories"   icon={<IconTag          color={SEC.pharmacie.icon} />} active={isActive('/categories')}   collapsed={collapsed} sectionColor={SEC.pharmacie.bar} theme={T} />
                        <NavLink href="/fournisseurs"  label="Fournisseurs"  icon={<IconTruck        color={SEC.pharmacie.icon} />} active={isActive('/fournisseurs')}  collapsed={collapsed} sectionColor={SEC.pharmacie.bar} theme={T} />

                        <SectionBar label="Examens" color={SEC.examens.bar} collapsed={collapsed} theme={T} />
                        <NavLink href="/modalite-imagerie" label="Modalités imagerie" icon={<IconScan  color={SEC.examens.icon} />} active={isActive('/modalite-imagerie')} collapsed={collapsed} sectionColor={SEC.examens.bar} theme={T} />
                        <NavLink href="/type-examens"      label="Types d'examens"   icon={<IconFlask color={SEC.examens.icon} />} active={isActive('/type-examens')}      collapsed={collapsed} sectionColor={SEC.examens.bar} theme={T} />
                        <NavLink href="/laboratoire"       label="Laboratoire"        icon={<IconLab   color={SEC.examens.icon} />} active={isActive('/laboratoire')}       collapsed={collapsed} sectionColor={SEC.examens.bar} theme={T} />
                        <NavLink href="/imagerie"          label="Imagerie"           icon={<IconImg   color={SEC.examens.icon} />} active={isActive('/imagerie')}          collapsed={collapsed} sectionColor={SEC.examens.bar} theme={T} />

                        <SectionBar label="HAD" color={SEC.had.bar} collapsed={collapsed} theme={T} />
                        <NavLink href="/tournees" label="Tournées" icon={<IconRoute color={SEC.had.icon} />} active={isActive('/tournees')} collapsed={collapsed} sectionColor={SEC.had.bar} theme={T} />

                        <SectionBar label="RH" color={SEC.rh.bar} collapsed={collapsed} theme={T} />
                        <NavLink href="/personnel" label="Personnel" icon={<IconTeam     color={SEC.rh.icon} />} active={isActive('/personnel')} collapsed={collapsed} sectionColor={SEC.rh.bar} theme={T} />
                        <NavLink href="/services"  label="Services"  icon={<IconBuilding color={SEC.rh.icon} />} active={isActive('/services')}  collapsed={collapsed} sectionColor={SEC.rh.bar} theme={T} />

                        <SectionBar label="Rapports" color="#f59e0b" collapsed={collapsed} theme={T} />
                        <NavLink href="/rapports" label="Rapports" icon={<IconChart color="#fbbf24" />} active={isActive('/rapports')} collapsed={collapsed} sectionColor="#f59e0b" theme={T} />
                    </nav>

                    {/* Bas sidebar */}
                    <div style={{ borderTop: `1px solid ${T.divider}`, padding: '8px 8px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>

                        {/* ── Bouton changement de thème ── */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowThemePicker(!showThemePicker)}
                                title={collapsed ? 'Thème' : undefined}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '9px 0' : '9px 10px', borderRadius: 9, background: showThemePicker ? `${T.accent}18` : 'none', border: showThemePicker ? `1px solid ${T.accent}30` : '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start' }}
                                onMouseEnter={e => { if (!showThemePicker) (e.currentTarget as HTMLElement).style.background = 'rgba(128,128,128,0.1)'; }}
                                onMouseLeave={e => { if (!showThemePicker) (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                                {/* Pastilles de couleur en miniature */}
                                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                    {[T.accent, T.accentLight, T.bg === '#ffffff' ? '#e5e7eb' : '#60a5fa'].map((c, i) => (
                                        <div key={i} style={{ width: i === 0 ? 10 : 6, height: i === 0 ? 10 : 6, borderRadius: '50%', background: c, alignSelf: 'center', boxShadow: i === 0 ? `0 0 6px ${c}80` : 'none' }} />
                                    ))}
                                </div>
                                {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, color: T.txtNormal, whiteSpace: 'nowrap' }}>Apparence</span>}
                                {!collapsed && (
                                    <svg width="11" height="11" fill="none" stroke={T.txtNormal} viewBox="0 0 24 24" style={{ marginLeft: 'auto', transform: showThemePicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                                    </svg>
                                )}
                            </button>

                            {/* Panneau de sélection thème */}
                            {showThemePicker && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowThemePicker(false)} />
                                    <div style={{
                                        position: 'absolute', bottom: 'calc(100% + 8px)',
                                        left: collapsed ? 'calc(100% + 8px)' : 0,
                                        right: collapsed ? 'auto' : 0,
                                        width: collapsed ? 220 : 'auto',
                                        zIndex: 50, borderRadius: 18,
                                        background: '#fff', border: '1px solid #f0f0ee',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                                        overflow: 'hidden',
                                    }}>
                                        {/* Header */}
                                        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f5f5f3' }}>
                                            <p style={{ fontSize: 13, fontWeight: 800, color: '#1a1a18', margin: 0, letterSpacing: '-0.2px' }}>Couleur du menu</p>
                                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', fontFamily: 'system-ui,sans-serif' }}>Choisissez un thème pour la barre latérale</p>
                                        </div>

                                        {/* Grille de thèmes */}
                                        <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                                            {THEMES.map(theme => {
                                                const active = theme.id === themeId;
                                                return (
                                                    <button key={theme.id} onClick={() => applyTheme(theme.id)}
                                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px', borderRadius: 12, border: `1.5px solid ${active ? theme.accent : '#f0f0ee'}`, background: active ? `${theme.accent}10` : '#fafaf9', cursor: 'pointer', transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = theme.accent; (e.currentTarget as HTMLElement).style.background = `${theme.accent}08`; } }}
                                                        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = '#f0f0ee'; (e.currentTarget as HTMLElement).style.background = '#fafaf9'; } }}>

                                                        {/* Préview mini sidebar */}
                                                        <div style={{ width: 36, height: 46, borderRadius: 8, background: theme.bg, border: theme.bg === '#ffffff' ? '1.5px solid #e5e7eb' : 'none', overflow: 'hidden', position: 'relative', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                            {/* Barre du haut */}
                                                            <div style={{ height: 10, background: `linear-gradient(135deg,${theme.accent},${theme.accentLight})` }} />
                                                            {/* Lignes nav */}
                                                            {[SEC.sih.bar, SEC.pharmacie.bar, SEC.examens.bar, SEC.had.bar].map((c, i) => (
                                                                <div key={i} style={{ margin: '3px 4px', height: 3, borderRadius: 100, background: c, opacity: 0.7 }} />
                                                            ))}
                                                            {/* Pastille accent */}
                                                            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: theme.accent, boxShadow: `0 0 4px ${theme.accent}` }} />
                                                        </div>

                                                        <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? theme.accent : '#6b7280', fontFamily: 'system-ui,sans-serif', whiteSpace: 'nowrap' }}>{theme.label}</span>

                                                        {active && (
                                                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 6px ${theme.accent}60` }}>
                                                                <svg width="8" height="8" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <NavLink href="/parametres" label="Paramètres" icon={<IconSettings color={SEC.bottom.icon} />} active={isActive('/parametres')} collapsed={collapsed} sectionColor={SEC.bottom.bar} theme={T} />
                        <button onClick={() => router.post('/logout')}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '9px 0' : '9px 10px', borderRadius: 9, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,48,3,0.1)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                            <IconLogout />
                            {!collapsed && <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171', whiteSpace: 'nowrap' }}>Déconnexion</span>}
                        </button>
                    </div>
                </aside>

                {/* ══════════════════════════ MAIN */}
                <div style={{ marginLeft: W, flex: 1, transition: 'margin-left 0.25s cubic-bezier(.4,0,.2,1)', minWidth: 0, display: 'flex', flexDirection: 'column' }}>

                    {/* Header */}
                    <header style={{ position: 'sticky', top: 0, zIndex: 30, height: 64, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: subtitle ? 2 : 0 }}>
                                <span style={{ fontSize: 11, color: '#c0c0bc', fontWeight: 500, letterSpacing: '0.04em' }}>MedCare</span>
                                <svg width="11" height="11" fill="none" stroke="#e0e0de" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" /></svg>
                                <span style={{ fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '0.04em' }}>{title}</span>
                            </div>
                            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a18', letterSpacing: '-0.4px', lineHeight: 1, margin: 0 }}>{title}</h1>
                            {subtitle && <p style={{ fontSize: 11, color: '#c0c0bc', marginTop: 2, lineHeight: 1, margin: '2px 0 0' }}>{subtitle}</p>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ position: 'relative' }}>
                                <svg width="13" height="13" fill="none" stroke="#c0c0bc" viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <circle cx="11" cy="11" r="8" strokeWidth={1.5} /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth={1.5} strokeLinecap="round" />
                                </svg>
                                <input placeholder="Rechercher…"
                                    style={{ height: 34, paddingLeft: 30, paddingRight: 12, borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, color: '#1a1a18', outline: 'none', width: 190, transition: 'all 0.2s', fontFamily: 'inherit' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.width = '230px'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.accent}15`; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.width = '190px'; e.currentTarget.style.background = '#fafaf9'; e.currentTarget.style.boxShadow = 'none'; }} />
                            </div>

                            <button style={{ position: 'relative', width: 34, height: 34, borderRadius: 9, border: '1.5px solid #f0f0ee', background: '#fafaf9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.accent; (e.currentTarget as HTMLElement).style.background = `${T.accent}10`; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f0f0ee'; (e.currentTarget as HTMLElement).style.background = '#fafaf9'; }}>
                                <svg width="15" height="15" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                                <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: T.accent, border: '1.5px solid #fafaf9' }} />
                            </button>

                            <div style={{ width: 1, height: 22, background: '#f0f0ee' }} />

                            {auth?.user && (
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setShowUserMenu(!showUserMenu)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px 5px 5px', borderRadius: 11, border: '1.5px solid #f0f0ee', background: '#fafaf9', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.accent; (e.currentTarget as HTMLElement).style.background = `${T.accent}10`; }}
                                        onMouseLeave={e => { if (!showUserMenu) { (e.currentTarget as HTMLElement).style.borderColor = '#f0f0ee'; (e.currentTarget as HTMLElement).style.background = '#fafaf9'; } }}>
                                        <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},${T.accentLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                            {getInitials(auth.user.name)}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auth.user.name}</span>
                                        <svg width="12" height="12" fill="none" stroke="#c0c0bc" viewBox="0 0 24 24" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowUserMenu(false)} />
                                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 232, borderRadius: 18, border: '1px solid #f0f0ee', background: '#fff', boxShadow: '0 16px 48px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                                                <div style={{ padding: '14px 14px 12px', background: `linear-gradient(135deg,${T.bg},${T.bgHover})`, borderBottom: `1px solid ${T.divider}` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg,${T.accent},${T.accentLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                                            {getInitials(auth.user.name)}
                                                        </div>
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <p style={{ fontSize: 13, fontWeight: 700, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{auth.user.name}</p>
                                                            <p style={{ fontSize: 11, color: T.txtNormal, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0' }}>{auth.user.email}</p>
                                                        </div>
                                                    </div>
                                                    {auth.user.role && (
                                                        <div style={{ marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 5, background: `${T.accent}25`, border: `1px solid ${T.accent}40`, borderRadius: 100, padding: '3px 10px' }}>
                                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
                                                            <span style={{ fontSize: 11, fontWeight: 600, color: T.accentLight }}>{auth.user.role}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ padding: '7px' }}>
                                                    {[
                                                        { href: '/profile',    label: 'Mon profil',  d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
                                                        { href: '/parametres', label: 'Paramètres',  d: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
                                                    ].map(item => (
                                                        <Link key={item.href} href={item.href} onClick={() => setShowUserMenu(false)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.15s', color: '#374151' }}
                                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafaf9'}
                                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                                            <svg width="14" height="14" fill="none" stroke="#c0c0bc" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.d} /></svg>
                                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                                                        </Link>
                                                    ))}
                                                    <div style={{ height: 1, background: '#f5f5f3', margin: '5px 0' }} />
                                                    <button onClick={() => router.post('/logout')}
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                                        <svg width="14" height="14" fill="none" stroke="#f53003" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f53003' }}>Déconnexion</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </header>

                    <main style={{ flex: 1, padding: '26px 28px', background: '#fff', overflowY: 'auto' }}>
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

// ─── Composants sidebar ───────────────────────────────────────────────────────

function SectionBar({ label, color, collapsed, theme }: { label: string; color: string; collapsed: boolean; theme: Theme }) {
    return (
        <div style={{ padding: collapsed ? '14px 0 4px' : '12px 8px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {!collapsed ? (
                <>
                    <div style={{ width: 3, height: 12, borderRadius: 100, background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}60` }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: 0.9 }}>{label}</span>
                    <div style={{ flex: 1, height: 1, background: `${color}25` }} />
                </>
            ) : (
                <div style={{ width: '100%', height: 1, background: theme.divider }} />
            )}
        </div>
    );
}

function NavLink({ href, icon, label, active, collapsed, sectionColor, theme }: {
    href: string; icon: ReactNode; label: string;
    active: boolean; collapsed: boolean; sectionColor: string; theme: Theme;
}) {
    return (
        <Link href={href} title={collapsed ? label : undefined}
            style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: collapsed ? '9px 0' : '8px 10px',
                borderRadius: 9, textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                marginBottom: 1, position: 'relative',
                background: active ? `${sectionColor}20` : 'transparent',
                border: `1px solid ${active ? `${sectionColor}35` : 'transparent'}`,
                transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = theme.bgHover === theme.bg ? 'rgba(128,128,128,0.1)' : theme.bgHover; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            {active && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: sectionColor, boxShadow: `0 0 8px ${sectionColor}80` }} />}
            <span style={{ flexShrink: 0, display: 'flex', opacity: active ? 1 : 0.7 }}>{icon}</span>
            {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? (theme.id === 'white' ? '#1a1a18' : '#fff') : theme.txtNormal, whiteSpace: 'nowrap' }}>{label}</span>}
        </Link>
    );
}

// ─── Icônes ───────────────────────────────────────────────────────────────────

function Ic({ color, children }: { color: string; children: ReactNode }) {
    return <svg width="15" height="15" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
function IconHome({ color }: { color: string })         { return <Ic color={color}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Ic>; }
function IconUsers({ color }: { color: string })        { return <Ic color={color}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></Ic>; }
function IconConsult({ color }: { color: string })      { return <Ic color={color}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" /><circle cx="17" cy="17" r="3" /></Ic>; }
function IconFile({ color }: { color: string })         { return <Ic color={color}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></Ic>; }
function IconBed({ color }: { color: string })          { return <Ic color={color}><path d="M2 4v16M2 8h18a2 2 0 012 2v8" /><path d="M2 20h20M7 8v4" /></Ic>; }
function IconPill({ color }: { color: string })         { return <svg width="15" height="15" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v6.5" /><path d="M15 15h6M18 12v6" /></svg>; }
function IconAlert({ color }: { color: string })        { return <Ic color={color}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Ic>; }
function IconPrescription({ color }: { color: string }) { return <Ic color={color}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" /></Ic>; }
function IconTag({ color }: { color: string })          { return <Ic color={color}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></Ic>; }
function IconTruck({ color }: { color: string })        { return <Ic color={color}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></Ic>; }
function IconScan({ color }: { color: string })         { return <Ic color={color}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></Ic>; }
function IconFlask({ color }: { color: string })        { return <Ic color={color}><path d="M9 3h6M10 3v6l-4.5 9A1 1 0 006.4 20h11.2a1 1 0 00.9-1.45L14 9V3" /></Ic>; }
function IconLab({ color }: { color: string })          { return <Ic color={color}><path d="M6 2v6l-2 3.5A4 4 0 008 17h8a4 4 0 004-5.5L18 8V2" /><line x1="6" y1="7" x2="18" y2="7" /></Ic>; }
function IconImg({ color }: { color: string })          { return <Ic color={color}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Ic>; }
function IconRoute({ color }: { color: string })        { return <Ic color={color}><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" /><circle cx="18" cy="5" r="3" /></Ic>; }
function IconTeam({ color }: { color: string })         { return <Ic color={color}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></Ic>; }
function IconBuilding({ color }: { color: string })     { return <Ic color={color}><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18M2 22h20" /><path d="M10 6h.01M14 6h.01M10 10h.01M14 10h.01M10 14h.01M14 14h.01" /></Ic>; }
function IconChart({ color }: { color: string })        { return <Ic color={color}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></Ic>; }
function IconSettings({ color }: { color: string })     { return <svg width="15" height="15" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>; }
function IconLogout() { return <svg width="15" height="15" fill="none" stroke="#f87171" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>; }