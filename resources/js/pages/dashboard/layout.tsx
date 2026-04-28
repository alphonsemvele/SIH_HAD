import { Head, Link, usePage, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

interface DashboardLayoutProps { children: ReactNode; title: string; subtitle?: string; }
interface User { id: number; name: string; email: string; role?: string; }
interface PageProps extends InertiaPageProps { auth: { user: User }; }

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { url, props } = usePage<PageProps>();
    const { auth } = props;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (path: string) => {
        const current = url.split('?')[0].replace(/\/$/, '');
        const clean   = path.replace(/\/$/, '');
        if (clean === '/dashboard') return current === '/dashboard';
        return current === clean || current.startsWith(clean + '/');
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const W = collapsed ? 72 : 256;

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net"/>
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet"/>
            </Head>

            {/* ✅ Fond blanc pour toute l'application */}
            <div style={{ display: 'flex', minHeight: '100vh', background: '#fff', fontFamily: "'Instrument Sans','system-ui',sans-serif" }}>

                {/* ════════════════════════════════════ SIDEBAR */}
                <aside style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
                    width: W, transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
                    background: '#1a1a18',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                }}>

                    {/* ── Logo ─────────────────────────────── */}
                    <div style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: collapsed ? '0 16px' : '0 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(245,48,3,0.4)' }}>
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                            </div>
                            {!collapsed && <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>MedCare</span>}
                        </div>
                        <button onClick={() => setCollapsed(!collapsed)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'}>
                            <svg style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                        </button>
                    </div>

                    {/* ── User card ─────────────────────────── */}
                    {!collapsed && auth?.user && (
                        <div style={{ margin: '14px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {getInitials(auth.user.name)}
                                </div>
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth.user.name}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth.user.role ?? auth.user.email}</div>
                                </div>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0, boxShadow: '0 0 6px rgba(74,222,128,0.7)' }}/>
                            </div>
                        </div>
                    )}
                    {collapsed && auth?.user && (
                        <div style={{ padding: '14px 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', position: 'relative' }}>
                                {getInitials(auth.user.name)}
                                <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#4ade80', border: '2px solid #1a1a18' }}/>
                            </div>
                        </div>
                    )}

                    {/* ── Navigation ────────────────────────── */}
                    <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 10px 16px', scrollbarWidth: 'none' }}>

                        <SideLink href="/dashboard" icon={<HomeIcon/>} active={isActive('/dashboard')} collapsed={collapsed} label="Tableau de bord"/>

                        <Divider collapsed={collapsed} label="SIH"/>
                        <SideLink href="/patients"          icon={<UsersIcon/>}        active={isActive('/patients')}          collapsed={collapsed} label="Patients"/>
                        <SideLink href="/dossiers-medicaux" icon={<FileIcon/>}          active={isActive('/dossiers-medicaux')} collapsed={collapsed} label="Dossiers médicaux"/>
                        <SideLink href="/lits"              icon={<BedIcon/>}           active={isActive('/lits')}              collapsed={collapsed} label="Lits & Occupation"/>

                        <Divider collapsed={collapsed} label="Pharmacie"/>
                        <SideLink href="/medicaments"  icon={<PillIcon/>}         active={isActive('/medicaments')}  collapsed={collapsed} label="Médicaments"/>
                        <SideLink href="/anomalies"    icon={<AlertIcon/>}        active={isActive('/anomalies')}    collapsed={collapsed} label="Anomalies"/>
                        <SideLink href="/prescription" icon={<PrescriptionIcon/>} active={isActive('/prescription')} collapsed={collapsed} label="Prescriptions"/>
                        <SideLink href="/categories"   icon={<TagIcon/>}          active={isActive('/categories')}   collapsed={collapsed} label="Catégories"/>
                        <SideLink href="/fournisseurs"  icon={<TruckIcon/>}        active={isActive('/fournisseurs')}  collapsed={collapsed} label="Fournisseurs"/>

                        <Divider collapsed={collapsed} label="Examens"/>
                        <SideLink href="/modalite-imagerie" icon={<ScanIcon/>}  active={isActive('/modalite-imagerie')} collapsed={collapsed} label="Modalités imagerie"/>
                        <SideLink href="/type-examens"      icon={<FlaskIcon/>} active={isActive('/type-examens')}      collapsed={collapsed} label="Types d'examens"/>
                        <SideLink href="/laboratoire"       icon={<LabIcon/>}   active={isActive('/laboratoire')}       collapsed={collapsed} label="Laboratoire"/>
                        <SideLink href="/imagerie"          icon={<ImgIcon/>}   active={isActive('/imagerie')}          collapsed={collapsed} label="Imagerie"/>

                        <Divider collapsed={collapsed} label="HAD"/>
                        <SideLink href="/tournees" icon={<RouteIcon/>} active={isActive('/tournees')} collapsed={collapsed} label="Tournées"/>

                        <Divider collapsed={collapsed} label="RH"/>
                        <SideLink href="/personnel" icon={<TeamIcon/>}     active={isActive('/personnel')} collapsed={collapsed} label="Personnel"/>
                        <SideLink href="/services"  icon={<BuildingIcon/>} active={isActive('/services')}  collapsed={collapsed} label="Services"/>
                    </nav>

                    {/* ── Bas sidebar ───────────────────────── */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 10px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <SideLink href="/parametres" icon={<SettingsIcon/>} active={isActive('/parametres')} collapsed={collapsed} label="Paramètres"/>
                        <button onClick={() => router.post('/logout')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '10px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', justifyContent: collapsed ? 'center' : 'flex-start' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,48,3,0.12)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                            <LogoutIcon/>
                            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, color: '#f53003', whiteSpace: 'nowrap' }}>Déconnexion</span>}
                        </button>
                    </div>
                </aside>

                {/* ════════════════════════════════════ MAIN */}
                <div style={{ marginLeft: W, flex: 1, transition: 'margin-left 0.25s cubic-bezier(.4,0,.2,1)', minWidth: 0, display: 'flex', flexDirection: 'column' }}>

                    {/* ── Header ───────────────────────────── */}
                    {/* ✅ Header blanc avec bordure fine */}
                    <header style={{ position: 'sticky', top: 0, zIndex: 30, height: 68, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: subtitle ? 2 : 0 }}>
                                <span style={{ fontSize: 11, color: '#c0c0bc', fontWeight: 500, letterSpacing: '0.04em' }}>MedCare</span>
                                <svg style={{ width: 12, height: 12, color: '#e0e0de' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6"/></svg>
                                <span style={{ fontSize: 11, color: '#f53003', fontWeight: 600, letterSpacing: '0.04em' }}>{title}</span>
                            </div>
                            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.3px', lineHeight: 1 }}>{title}</h1>
                            {subtitle && <p style={{ fontSize: 12, color: '#c0c0bc', marginTop: 2, lineHeight: 1 }}>{subtitle}</p>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Recherche */}
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <input placeholder="Rechercher…" style={{ height: 36, paddingLeft: 32, paddingRight: 14, borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, color: '#1a1a18', outline: 'none', width: 200, transition: 'all 0.2s', fontFamily: 'inherit' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.width = '240px'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,48,3,0.08)'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.width = '200px'; e.currentTarget.style.background = '#fafaf9'; e.currentTarget.style.boxShadow = 'none'; }}/>
                            </div>

                            {/* Notifications */}
                            <button style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f53003'; (e.currentTarget as HTMLElement).style.background = '#fff5f5'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f0f0ee'; (e.currentTarget as HTMLElement).style.background = '#fafaf9'; }}>
                                <svg style={{ width: 16, height: 16, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8ZM13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"/></svg>
                                <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#f53003', border: '1.5px solid #fff' }}/>
                            </button>

                            <div style={{ width: 1, height: 24, background: '#f0f0ee' }}/>

                            {/* User menu */}
                            {auth?.user && (
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', borderRadius: 12, border: '1.5px solid #f0f0ee', background: '#fafaf9', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f53003'; (e.currentTarget as HTMLElement).style.background = '#fff5f5'; }}
                                        onMouseLeave={e => { if (!showUserMenu) { (e.currentTarget as HTMLElement).style.borderColor = '#f0f0ee'; (e.currentTarget as HTMLElement).style.background = '#fafaf9'; }}}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                            {getInitials(auth.user.name)}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auth.user.name}</span>
                                        <svg style={{ width: 14, height: 14, color: '#c0c0bc', transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6"/></svg>
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowUserMenu(false)}/>
                                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 240, borderRadius: 18, border: '1px solid #f0f0ee', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                                                <div style={{ padding: '16px 16px 14px', background: 'linear-gradient(135deg,#1a1a18,#2d2d2a)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                                            {getInitials(auth.user.name)}
                                                        </div>
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auth.user.name}</div>
                                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auth.user.email}</div>
                                                        </div>
                                                    </div>
                                                    {auth.user.role && (
                                                        <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(245,48,3,0.2)', border: '1px solid rgba(245,48,3,0.3)', borderRadius: 100, padding: '3px 10px' }}>
                                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f53003', flexShrink: 0 }}/>
                                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#ff8c6a' }}>{auth.user.role}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ padding: '8px' }}>
                                                    {[
                                                        { href: '/profile',    icon: <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>, label: 'Mon profil' },
                                                        { href: '/parametres', icon: <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>, label: 'Paramètres' },
                                                    ].map(item => (
                                                        <Link key={item.href} href={item.href} onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s', color: '#374151' }}
                                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafaf9'}
                                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                                            <span style={{ color: '#c0c0bc' }}>{item.icon}</span>
                                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                                                        </Link>
                                                    ))}
                                                    <div style={{ height: 1, background: '#f5f5f3', margin: '6px 0' }}/>
                                                    <button onClick={() => router.post('/logout')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                                        <svg style={{ width: 15, height: 15, color: '#f53003' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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

                    {/* ✅ Zone contenu — fond blanc pur */}
                    <main style={{ flex: 1, padding: '28px', overflowY: 'auto', background: '#fff' }}>
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

// ─── Composants sidebar ───────────────────────────────────────────────────────

function Divider({ label, collapsed }: { label: string; collapsed: boolean }) {
    return (
        <div style={{ padding: collapsed ? '16px 0 6px' : '16px 10px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {!collapsed && <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>}
            {collapsed && <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }}/>}
            {!collapsed && <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>}
        </div>
    );
}

function SideLink({ href, icon, label, active, collapsed }: { href: string; icon: ReactNode; label: string; active: boolean; collapsed: boolean }) {
    return (
        <Link href={href} title={collapsed ? label : undefined} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '9px 0' : '9px 12px',
            borderRadius: 10, textDecoration: 'none',
            justifyContent: collapsed ? 'center' : 'flex-start',
            marginBottom: 2,
            background: active ? 'rgba(245,48,3,0.15)' : 'transparent',
            border: active ? '1px solid rgba(245,48,3,0.25)' : '1px solid transparent',
            transition: 'all 0.15s',
            position: 'relative',
        }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}}>
            {active && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: '#f53003', boxShadow: '0 0 8px rgba(245,48,3,0.6)' }}/>}
            <span style={{ color: active ? '#f53003' : 'rgba(255,255,255,0.45)', flexShrink: 0, display: 'flex', transition: 'color 0.15s' }}>{icon}</span>
            {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>{label}</span>}
        </Link>
    );
}

// ─── Icônes ───────────────────────────────────────────────────────────────────

const I = ({ d, d2 }: { d: string; d2?: string }) => (
    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d}/>
        {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d2}/>}
    </svg>
);

function HomeIcon()         { return <I d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.9 22 3 21.1 3 20V9Z" d2="M9 22V12H15V22"/>; }
function UsersIcon()        { return <I d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M9 11a4 4 0 100-8 4 4 0 000 8z"/>; }
function FileIcon()         { return <I d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" d2="M14 2V8H20M16 13H8M16 17H8M10 9H8"/>; }
function BedIcon()          { return <I d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" d2="M3 9H21M9 21V9"/>; }
function PillIcon()         { return <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="8" width="20" height="8" rx="4" strokeWidth={1.5}/><line x1="12" y1="8" x2="12" y2="16" strokeWidth={1.5} strokeLinecap="round"/></svg>; }
function AlertIcon()        { return <I d="M12 9V12M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.53 21H20.47A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"/>; }
function PrescriptionIcon() { return <I d="M9 5H7C5.9 5 5 5.9 5 7V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V7C19 5.9 18.1 5 17 5H15M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5C15 6.1 14.1 7 13 7H11C9.9 7 9 6.1 9 5Z" d2="M9 12H15M9 16H12"/>; }
function TagIcon()          { return <I d="M20.59 13.41L13.42 20.58C13.05 20.95 12.55 21.17 12 21.17C11.45 21.17 10.95 20.95 10.59 20.58L2 12V2H12L20.59 10.59A2 2 0 0120.59 13.41ZM7 7h.01"/>; }
function TruckIcon()        { return <I d="M1 3H16V16H1V3ZM16 8H20L23 11V16H16V8Z" d2="M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>; }
function ScanIcon()         { return <I d="M3 4H7V8H3V4ZM17 4H21V8H17V4ZM3 16H7V20H3V16ZM17 16H21V20H17V16Z" d2="M7 6H17M6 7V17M17 7V17M7 18H17"/>; }
function FlaskIcon()        { return <I d="M9 3H15M10 3V8L5 18C4.5 19 5.2 21 6.5 21H17.5C18.8 21 19.5 19 19 18L14 8V3"/>; }
function LabIcon()          { return <I d="M9 3H7C5.9 3 5 3.9 5 5V7M9 21H7C5.9 21 5 20.1 5 19V17M15 3H17C18.1 3 19 3.9 19 5V7M15 21H17C18.1 21 19 20.1 19 19V17" d2="M12 16a4 4 0 100-8 4 4 0 000 8z"/>; }
function ImgIcon()          { return <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9H21M9 21V9"/></svg>; }
function RouteIcon()        { return <I d="M3 17L7 7L12 13L16 9L21 17M3 17H21"/>; }
function TeamIcon()         { return <I d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M9 11a4 4 0 100-8 4 4 0 000 8zM23 21V19A4 4 0 0020 15.13M16 3.13a4 4 0 010 7.75"/>; }
function BuildingIcon()     { return <I d="M19 21V5C19 3.9 18.1 3 17 3H7C5.9 3 5 3.9 5 5V21M19 21H5M19 21H21M5 21H3M9 7H10M9 11H10M14 7H15M14 11H15M9 21V16C9 15.45 9.45 15 10 15H14C14.55 15 15 15.45 15 16V21"/>; }
function SettingsIcon()     { return <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth={1.5}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function LogoutIcon()       { return <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" style={{ color: '#f53003' }}/></svg>; }