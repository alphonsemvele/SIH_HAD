import { Head, Link, usePage, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface PageProps extends InertiaPageProps {
    auth: {
        user: User;
    };
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { url, props } = usePage<PageProps>();
    const { auth } = props;
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isActive = (path: string) => {
        const currentPath = url.split('?')[0].replace(/\/$/, '');
        const cleanPath = path.replace(/\/$/, '');
        if (cleanPath === '/dashboard') return currentPath === '/dashboard';
        return currentPath === cleanPath || currentPath.startsWith(cleanPath + '/');
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Fonction pour obtenir les initiales
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-3 border-b border-[#e3e3e0] px-6 dark:border-[#3E3E3A]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f53003] dark:bg-[#FF4433]">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">MedCare</span>
                    </div>

                    {/* Navigation */}
                    <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
                        {/* Dashboard */}
                        <div className="mb-6">
                            <NavLink href="/dashboard" icon={<HomeIcon />} active={url === '/dashboard'}>
                                Tableau de bord
                            </NavLink>
                        </div>

                        {/* SIH */}
                        <NavSection title="SIH">
                            <NavLink href="/patients" icon={<UsersIcon />} active={isActive('/patients')}>Patients</NavLink>
                            <NavLink href="/dossiers-medicaux" icon={<FileIcon />} active={isActive('/dossiers-medicaux')}>Dossiers médicaux</NavLink>
                            <NavLink href="/lits" icon={<BedIcon />} active={isActive('/lits')}>Lits & Occupation</NavLink>
                        </NavSection>

                        {/* Pharmacie */}
                        <NavSection title="Pharmacie">
                            <NavLink href="/medicaments" icon={<PillIcon />} active={isActive('/medicaments')}>Médicaments</NavLink>
                            <li>
                                <Link
                                    href="/anomalies"
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive('/anomalies')
                                            ? 'bg-[#f53003]/10 font-medium text-[#f53003]'
                                            : 'text-[#1b1b18] hover:bg-[#f5f5f3] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]'
                                        }`}
                                >
                                    <svg className="h-5 w-5 text-[#706f6c] dark:text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9V12M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.53 21H20.47A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Anomalies
                                </Link>
                            </li>
                            <NavLink href="/prescription" icon={<PrescriptionIcon />} active={isActive('/prescription')}>Prescriptions</NavLink>
                            <NavLink href="/categories" icon={<TagIcon />} active={isActive('/categories')}>Catégories</NavLink>
                            <NavLink href="/fournisseurs" icon={<TruckIcon />} active={isActive('/fournisseurs')}>Fournisseurs</NavLink>

                        </NavSection>

                        {/* Examens */}
                        <NavSection title="Examens">

                            <NavLink href="/modalite-imagerie" icon={
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                                    <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="6" cy="6" r="1" fill="currentColor" />
                                    <circle cx="9" cy="6" r="1" fill="currentColor" />
                                </svg>
                            } active={isActive('/modalite-imagerie')}>
                                Modalités imagerie
                            </NavLink>
                            {/* Types d'examens */}
                            <NavLink href="/type-examens" icon={
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 3H15M9 3V13.5L5.5 19C5.5 19 4 21 6 21H18C20 21 18.5 19 18.5 19L15 13.5V3M9 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="10" cy="17" r="1" fill="currentColor" />
                                    <circle cx="14" cy="15" r="1" fill="currentColor" />
                                    <circle cx="12" cy="18.5" r="0.7" fill="currentColor" />
                                </svg>
                            } active={isActive('/type-examens')}>
                                Types d'examens
                            </NavLink>
                            <NavLink href="/laboratoire" icon={<LabIcon />} active={isActive('/laboratoire')}>Laboratoire</NavLink>
                            <NavLink href="/imagerie" icon={<ImageIcon />} active={isActive('/imagerie')}>Imagerie</NavLink>
                        </NavSection>

                        {/* HAD */}
                        <NavSection title="HAD">
                            <NavLink href="/tournees" icon={<CalendarIcon />} active={isActive('/tournees')}>Tournées</NavLink>
                        </NavSection>

                        {/* Administration */}
                        <NavSection title="Ressource Humaine">
                            <NavLink href="/personnel" icon={<UsersGroupIcon />} active={isActive('/personnel')}>Personnel</NavLink>
                            <NavLink href="/services" icon={<BuildingIcon />} active={isActive('/services')}>Services</NavLink>
                            {/* <NavLink href="/agenda" icon={<CalendarIcon />} active={isActive('/agenda')}>Agenda</NavLink> */}
                        </NavSection>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="ml-64 flex-1">
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e3e3e0] bg-white/80 px-6 backdrop-blur-sm dark:border-[#3E3E3A] dark:bg-[#161615]/80">
                        <div>
                            <h1 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{subtitle}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f53003]"></span>
                            </button>

                            {/* User Menu */}
                            {auth?.user && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]"
                                    >
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#f53003] to-[#ff6b4a] flex items-center justify-center text-white text-sm font-medium">
                                            {getInitials(auth.user.name)}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                {auth.user.name}
                                            </p>
                                            {auth.user.role && (
                                                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                    {auth.user.role}
                                                </p>
                                            )}
                                        </div>
                                        <svg
                                            className={`h-4 w-4 text-[#706f6c] transition-transform dark:text-[#A1A09A] ${showUserMenu ? 'rotate-180' : ''}`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showUserMenu && (
                                        <>
                                            {/* Overlay pour fermer le menu */}
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowUserMenu(false)}
                                            />

                                            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-[#e3e3e0] bg-white shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] z-50">
                                                {/* User Info */}
                                                <div className="border-b border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#f53003] to-[#ff6b4a] flex items-center justify-center text-white font-medium">
                                                            {getInitials(auth.user.name)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC] truncate">
                                                                {auth.user.name}
                                                            </p>
                                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] truncate">
                                                                {auth.user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="p-2">
                                                    <Link
                                                        href="/profile"
                                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#1b1b18] transition-colors hover:bg-[#f5f5f3] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <svg className="h-5 w-5 text-[#706f6c] dark:text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                                                            <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                                                        </svg>
                                                        Mon profil
                                                    </Link>

                                                    <Link
                                                        href="/parametres"
                                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#1b1b18] transition-colors hover:bg-[#f5f5f3] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <svg className="h-5 w-5 text-[#706f6c] dark:text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                                                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" />
                                                            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="1.5" />
                                                        </svg>
                                                        Paramètres
                                                    </Link>

                                                    <div className="my-2 h-px bg-[#e3e3e0] dark:bg-[#3E3E3A]" />

                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#f53003] transition-colors hover:bg-red-50 dark:text-[#FF4433] dark:hover:bg-[#1D0002]"
                                                    >
                                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Se déconnecter
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
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

// Les composants NavSection, NavLink et les icônes restent identiques...
function NavSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                {title}
            </p>
            <ul className="space-y-1">
                {children}
            </ul>
        </div>
    );
}

function NavLink({ href, icon, children, active = false }: { href: string; icon: ReactNode; children: ReactNode; active?: boolean }) {
    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors";
    const activeClasses = "bg-[#fff2f2] font-medium text-[#f53003] dark:bg-[#1D0002] dark:text-[#FF4433]";
    const inactiveClasses = "text-[#1b1b18] hover:bg-[#f5f5f3] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]";

    return (
        <li>
            <Link href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
                <span className={active ? "" : "text-[#706f6c] dark:text-[#A1A09A]"}>{icon}</span>
                {children}
            </Link>
        </li>
    );
}

// Toutes les icônes restent identiques...
function HomeIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function UsersGroupIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function FileIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BedIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 9H21M9 21V9" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function PillIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M10.5 20.5L10.5 3.5C10.5 2.67157 9.82843 2 9 2H6C5.17157 2 4.5 2.67157 4.5 3.5V20.5C4.5 21.3284 5.17157 22 6 22H9C9.82843 22 10.5 21.3284 10.5 20.5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19.5 20.5V10.5C19.5 9.67157 18.8284 9 18 9H15C14.1716 9 13.5 9.67157 13.5 10.5V20.5C13.5 21.3284 14.1716 22 15 22H18C18.8284 22 19.5 21.3284 19.5 20.5Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function PrescriptionIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12H15M9 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function LabIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M9 3H7C5.89543 3 5 3.89543 5 5V7M9 21H7C5.89543 21 5 20.1046 5 19V17M15 3H17C18.1046 3 19 3.89543 19 5V7M15 21H17C18.1046 21 19 20.1046 19 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function ImageIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 9H21M9 21V9" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BuildingIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H5M19 21H21M5 21H3M9 7H10M9 11H10M14 7H15M14 11H15M9 21V16C9 15.4477 9.44772 15 10 15H14C14.5523 15 15 15.4477 15 16V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function TagIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function TruckIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M1 3H16V16H1V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}