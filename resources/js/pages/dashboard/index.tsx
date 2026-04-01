import { Link } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
    patients_actifs:    number;
    lits_occupes:       number;
    lits_total:         number;
    rdv_aujourd_hui:    number;
    rdv_en_attente:     number;
    tournees_had:       number;
    tournees_terminees: number;
    admissions_ce_mois: number;
}

interface Admission {
    id:      number;
    initials: string;
    name:    string;
    room:    string;
    service: string;
    status:  'Stable' | 'Surveillance' | 'Critique';
}

interface Props {
    stats:                Stats;
    dernieres_admissions: Admission[];
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Dashboard({
    stats = {
        patients_actifs: 0, lits_occupes: 0, lits_total: 0,
        rdv_aujourd_hui: 0, rdv_en_attente: 0,
        tournees_had: 0, tournees_terminees: 0, admissions_ce_mois: 0,
    },
    dernieres_admissions = [],
}: Partial<Props>) {

    const tauxOccupation = stats.lits_total > 0
        ? Math.round((stats.lits_occupes / stats.lits_total) * 100)
        : 0;

    return (
        <DashboardLayout title="Tableau de bord" subtitle="Bienvenue sur votre espace hospitalier">

            {/* Stats Cards */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Patients actifs"
                    value={stats.patients_actifs.toString()}
                    icon={<UsersIcon />}
                    trend={`+${stats.admissions_ce_mois} ce mois`}
                    trendUp={true}
                />
                <StatCard
                    title="Lits occupés"
                    value={`${stats.lits_occupes}/${stats.lits_total}`}
                    icon={<BedIcon />}
                    trend={`${tauxOccupation}% d'occupation`}
                    trendUp={tauxOccupation < 90}
                />
                <StatCard
                    title="RDV aujourd'hui"
                    value={stats.rdv_aujourd_hui.toString()}
                    icon={<CalendarIcon />}
                    trend={`${stats.rdv_en_attente} en attente`}
                />
                <StatCard
                    title="Tournées HAD"
                    value={stats.tournees_had.toString()}
                    icon={<MapIcon />}
                    trend={`${stats.tournees_terminees} terminée${stats.tournees_terminees > 1 ? 's' : ''}`}
                    trendUp={true}
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-4">

                {/* Recent Patients */}
                <div className="lg:col-span-2 rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center justify-between border-b border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                        <h2 className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Dernières admissions</h2>
                        <Link href="/lits/occupations" className="text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]">
                            Voir tout
                        </Link>
                    </div>
                    <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                        {dernieres_admissions.length > 0 ? (
                            dernieres_admissions.map(a => (
                                <PatientRow
                                    key={a.id}
                                    initials={a.initials}
                                    name={a.name}
                                    room={a.room}
                                    service={a.service}
                                    status={a.status}
                                />
                            ))
                        ) : (
                            <p className="px-4 py-10 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Aucune admission active.
                            </p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-2 rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="border-b border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                        <h2 className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Actions rapides</h2>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <QuickAction href="/lits/occupations/create" icon={<PlusIcon />}        title="Nouvelle admission"    subtitle="Enregistrer un patient"        color="text-[#f53003]" />
                        <QuickAction href="/prescriptions/create"    icon={<PrescriptionIcon />} title="Nouvelle prescription" subtitle="Ordonnance médicale"           color="text-blue-600 dark:text-blue-400" />
                        <QuickAction href="/rendez-vous/create"      icon={<CalendarIcon />}     title="Nouveau RDV"           subtitle="Planifier consultation"         color="text-green-600 dark:text-green-400" />
                        <QuickAction href="/observations/create"     icon={<ActivityIcon />}     title="Saisir constantes"     subtitle="Tension, pouls, température..." color="text-purple-600 dark:text-purple-400" />
                        <QuickAction href="/laboratoire/create"      icon={<TestTubeIcon />}     title="Demande d'analyse"     subtitle="Laboratoire / Imagerie"         color="text-orange-600 dark:text-orange-400" />
                        <QuickAction href="/lits/occupations"        icon={<DoorOutIcon />}      title="Autorisation de sortie" subtitle="Préparer la sortie"           color="text-teal-600 dark:text-teal-400" />
                        <QuickAction href="/transfert/create"        icon={<TransferIcon />}     title="Transfert patient"     subtitle="Vers autre service / hôpital"  color="text-indigo-600 dark:text-indigo-400" />
                        <QuickAction href="/deces/create"            icon={<CrossIcon />}        title="Déclaration décès"     subtitle="Certificat médical"            color="text-gray-600 dark:text-gray-400" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// ─── Composants ───────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, trend, trendUp = false }: {
    title: string; value: string; icon: React.ReactNode; trend: string; trendUp?: boolean;
}) {
    return (
        <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{title}</p>
                    <p className="mt-1 text-2xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fff2f2] dark:bg-[#1D0002]">
                    <span className="text-[#f53003] dark:text-[#FF4433]">{icon}</span>
                </div>
            </div>
            <p className={`mt-3 text-xs ${trendUp ? 'text-green-600' : 'text-[#706f6c] dark:text-[#A1A09A]'}`}>{trend}</p>
        </div>
    );
}

function PatientRow({ initials, name, room, service, status }: {
    initials: string; name: string; room: string; service: string;
    status: 'Stable' | 'Surveillance' | 'Critique';
}) {
    const statusColors = {
        'Stable':       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Surveillance': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Critique':     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <div className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-full bg-[#e3e3e0] flex items-center justify-center text-sm font-medium text-[#706f6c] dark:bg-[#3E3E3A] dark:text-[#A1A09A]">
                {initials}
            </div>
            <div className="flex-1">
                <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{name}</p>
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{room} • {service}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[status]}`}>
                {status}
            </span>
        </div>
    );
}

function QuickAction({ href, icon, title, subtitle, color = "text-[#f53003]" }: {
    href: string; icon: React.ReactNode; title: string; subtitle: string; color?: string;
}) {
    return (
        <Link href={href} className="group flex items-center gap-4 rounded-lg border border-[#e3e3e0] p-4 transition-all hover:border-[#f53003]/50 hover:bg-[#fff5f5] dark:border-[#3E3E3A] dark:hover:bg-[#2a0000]/30">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#fff2f2] text-2xl transition-colors group-hover:bg-[#f53003]/10 dark:bg-[#1D0002] ${color}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC] truncate">{title}</p>
                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] truncate">{subtitle}</p>
            </div>
        </Link>
    );
}

// ─── Icônes ───────────────────────────────────────────────────────────────────

function UsersIcon()        { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function BedIcon()          { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9H21M9 21V9" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function CalendarIcon()     { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function MapIcon()          { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function PlusIcon()         { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function PrescriptionIcon() { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="1.5"/></svg>; }
function ActivityIcon()     { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function TestTubeIcon()     { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M20 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h14Z"/><path d="M9 14h6M9 17h6"/></svg>; }
function DoorOutIcon()      { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8v14H6V8"/><path d="M12 2v10"/><path d="m4 12 8-8 8 8"/></svg>; }
function TransferIcon()     { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 3H21V8"/><path d="M4 20L21 3"/><path d="M21 16V21H16"/><path d="M15 15L21 21"/><path d="M4 4L9 9"/></svg>; }
function CrossIcon()        { return <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20"/></svg>; }