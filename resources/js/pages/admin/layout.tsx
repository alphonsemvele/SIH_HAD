import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    const { url } = usePage();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const isActive = (path: string) => {
        if (path === '/admin') return url === '/admin';
        return url.startsWith(path);
    };

    return (
        <>
            <Head title={`Admin - ${title}`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen bg-[#0F0F12]">
                {/* Sidebar */}
                <aside className={`fixed left-0 top-0 z-40 h-screen border-r border-[#1F1F28] bg-[#16161D] transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
                    {/* Logo & Toggle */}
                    <div className="flex h-16 items-center justify-between border-b border-[#1F1F28] px-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                                <ShieldIcon className="h-5 w-5 text-white" />
                            </div>
                            {!sidebarCollapsed && (
                                <div>
                                    <span className="text-lg font-bold text-white">MediCare</span>
                                    <span className="ml-2 rounded-md bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">Admin</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-[#1F1F28] hover:text-white"
                        >
                            {sidebarCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
                        {/* Main */}
                        <div className="mb-6">
                            {!sidebarCollapsed && (
                                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-[#52525B]">
                                    Principal
                                </p>
                            )}
                            <ul className="space-y-1">
                                <NavLink href="/admin" icon={<DashboardIcon />} active={isActive('/admin') && url === '/admin'} collapsed={sidebarCollapsed}>
                                    Tableau de bord
                                </NavLink>
                                <NavLink href="/dashboard" icon={<HomeIcon />} active={false} collapsed={sidebarCollapsed}>
                                    Retour au SIH
                                </NavLink>
                            </ul>
                        </div>

                        {/* Gestion des utilisateurs */}
                        <div className="mb-6">
                            {!sidebarCollapsed && (
                                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-[#52525B]">
                                    Utilisateurs
                                </p>
                            )}
                            <ul className="space-y-1">
                                <NavLink href="/admin/users" icon={<UsersIcon />} active={isActive('/admin/users')} collapsed={sidebarCollapsed}>
                                    Utilisateurs
                                </NavLink>
                                <NavLink href="/admin/roles" icon={<KeyIcon />} active={isActive('/admin/roles')} collapsed={sidebarCollapsed}>
                                    Rôles
                                </NavLink>
                                <NavLink href="/admin/permissions" icon={<KeyIcon />} active={isActive('/admin/permissions')} collapsed={sidebarCollapsed}>
                                    Permissions
                                </NavLink>
                                {/* <NavLink href="/admin/session" icon={<MonitorIcon />} active={isActive('/admin/session')} collapsed={sidebarCollapsed}>
                                    Sessions actives
                                </NavLink> */}
                            </ul>
                        </div>

                        {/* Ségur */}
                        <div className="mb-6">
                            {!sidebarCollapsed && (
                                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-[#52525B]">
                                    Ségur
                                </p>
                            )}
                            <ul className="space-y-1">
                                <NavLink href="/admin/segur/indicateurs" icon={<ShieldCheckIcon />} active={isActive('/admin/segur')} collapsed={sidebarCollapsed}>
                                    Indicateurs Ségur
                                </NavLink>
                            </ul>
                        </div>

                  

                        {/* Système */}
                        <div className="mb-6">
                            {!sidebarCollapsed && (
                                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-[#52525B]">
                                    Système
                                </p>
                            )}
                            <ul className="space-y-1">
                                {/* <NavLink href="/admin/logs" icon={<FileTextIcon />} active={isActive('/admin/logs')} collapsed={sidebarCollapsed}>
                                    Journaux d'activité
                                </NavLink>
                                <NavLink href="/admin/sauvegarde" icon={<DatabaseIcon />} active={isActive('/admin/sauvegarde')} collapsed={sidebarCollapsed}>
                                    Sauvegarde
                                </NavLink>
                                <NavLink href="/admin/maintenance" icon={<WrenchIcon />} active={isActive('/admin/maintenance')} collapsed={sidebarCollapsed}>
                                    Maintenance
                                </NavLink> */}
                                <NavLink href="/admin/parameters" icon={<SettingsIcon />} active={isActive('/admin/parameters')} collapsed={sidebarCollapsed}>
                                    Paramètres
                                </NavLink>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="mb-6">
                            {!sidebarCollapsed && (
                                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-[#52525B]">
                                    Support
                                </p>
                            )}
                            <ul className="space-y-1">
                             
                                <NavLink href="/admin/documentation" icon={<BookIcon />} active={isActive('/admin/documentation')} collapsed={sidebarCollapsed}>
                                    Documentation
                                </NavLink>
                            </ul>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#1F1F28] bg-[#0F0F12]/80 px-6 backdrop-blur-xl">
                        <div>
                            <h1 className="text-xl font-bold text-white">{title}</h1>
                            {subtitle && <p className="text-sm text-[#71717A]">{subtitle}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="h-10 w-64 rounded-xl border border-[#1F1F28] bg-[#16161D] pl-10 pr-4 text-sm text-white placeholder-[#52525B] outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="relative rounded-xl border border-[#1F1F28] bg-[#16161D] p-2.5 text-[#71717A] transition-colors hover:border-[#2F2F3A] hover:text-white">
                                <BellIcon className="h-5 w-5" />
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">3</span>
                            </button>

                            {/* Profile */}
                            <div className="flex items-center gap-3 rounded-xl border border-[#1F1F28] bg-[#16161D] px-3 py-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                                    SA
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-white">Super Admin</p>
                                    <p className="text-xs text-[#71717A]">Administrateur</p>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-[#52525B]" />
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

// NavLink Component
function NavLink({ href, icon, children, active, collapsed }: { href: string; icon: ReactNode; children: ReactNode; active: boolean; collapsed: boolean }) {
    const baseClasses = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200";
    const activeClasses = "bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-violet-400 shadow-lg shadow-violet-500/5";
    const inactiveClasses = "text-[#A1A1AA] hover:bg-[#1F1F28] hover:text-white";

    return (
        <li>
            <Link
                href={href}
                className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? String(children) : undefined}
            >
                <span className={active ? "text-violet-400" : "text-[#71717A]"}>{icon}</span>
                {!collapsed && children}
            </Link>
        </li>
    );
}

// Icons
function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function DashboardIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    );
}

function HomeIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function KeyIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
    );
}



function MonitorIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    );
}

function BuildingIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <line x1="8" y1="6" x2="8" y2="6" />
            <line x1="16" y1="6" x2="16" y2="6" />
            <line x1="12" y1="6" x2="12" y2="6" />
            <line x1="8" y1="10" x2="8" y2="10" />
            <line x1="16" y1="10" x2="16" y2="10" />
            <line x1="12" y1="10" x2="12" y2="10" />
            <line x1="8" y1="14" x2="8" y2="14" />
            <line x1="16" y1="14" x2="16" y2="14" />
            <line x1="12" y1="14" x2="12" y2="14" />
        </svg>
    );
}

function LayersIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,2 2,7 12,12 22,7" />
            <polyline points="2,17 12,22 22,17" />
            <polyline points="2,12 12,17 22,12" />
        </svg>
    );
}

function BanknoteIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
        </svg>
    );
}

function ShieldCheckIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function FileTextIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
        </svg>
    );
}

function DatabaseIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}

function WrenchIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

function TicketIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" />
            <path d="M13 17v2" />
            <path d="M13 11v2" />
        </svg>
    );
}

function BookIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function BellIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function ChevronLeftIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
        </svg>
    );
}

function ChevronRightIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6" />
        </svg>
    );
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6,9 12,15 18,9" />
        </svg>
    );
}