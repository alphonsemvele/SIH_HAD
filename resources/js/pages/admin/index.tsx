import AdminLayout from './layout';
import { Link } from '@inertiajs/react';

export default function AdminDashboard() {
    return (
        <AdminLayout title="Tableau de bord" subtitle="Vue d'ensemble du système">
            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Utilisateurs actifs"
                    value="248"
                    change="+12%"
                    changeType="positive"
                    icon={<UsersIcon />}
                    color="violet"
                />
                <StatCard
                    title="Sessions en cours"
                    value="67"
                    change="+5%"
                    changeType="positive"
                    icon={<MonitorIcon />}
                    color="blue"
                />
                <StatCard
                    title="Tickets ouverts"
                    value="12"
                    change="-3"
                    changeType="negative"
                    icon={<TicketIcon />}
                    color="amber"
                />
                <StatCard
                    title="Espace utilisé"
                    value="78%"
                    change="+2%"
                    changeType="neutral"
                    icon={<DatabaseIcon />}
                    color="emerald"
                />
            </div>

            {/* Quick Actions & System Status */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">Actions rapides</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction href="/admin/utilisateurs" icon={<UserPlusIcon />} label="Nouvel utilisateur" />
                        <QuickAction href="/admin/roles" icon={<KeyIcon />} label="Gérer rôles" />
                        <QuickAction href="/admin/sauvegarde" icon={<DownloadIcon />} label="Sauvegarde" />
                        <QuickAction href="/admin/logs" icon={<FileTextIcon />} label="Voir logs" />
                    </div>
                </div>

                {/* System Status */}
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">État du système</h3>
                    <div className="space-y-4">
                        <StatusItem label="Serveur principal" status="online" />
                        <StatusItem label="Base de données" status="online" />
                        <StatusItem label="Service de sauvegarde" status="online" />
                        <StatusItem label="API externe" status="warning" detail="Latence élevée" />
                    </div>
                </div>

                {/* Storage */}
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">Stockage</h3>
                    <div className="mb-4">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="text-[#A1A1AA]">Utilisé</span>
                            <span className="text-white">156 Go / 200 Go</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#1F1F28]">
                            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#71717A]">Documents médicaux</span>
                            <span className="text-[#A1A1AA]">89 Go</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#71717A]">Imagerie</span>
                            <span className="text-[#A1A1AA]">52 Go</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#71717A]">Sauvegardes</span>
                            <span className="text-[#A1A1AA]">15 Go</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Users */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Activité récente</h3>
                        <Link href="/admin/logs" className="text-sm text-violet-400 hover:text-violet-300">
                            Voir tout
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <ActivityItem
                            user="Dr. Onana Michel"
                            action="s'est connecté"
                            time="Il y a 5 min"
                            type="login"
                        />
                        <ActivityItem
                            user="Admin Système"
                            action="a créé l'utilisateur Mbarga Claire"
                            time="Il y a 15 min"
                            type="create"
                        />
                        <ActivityItem
                            user="Ngo Likeng Anne"
                            action="a modifié ses paramètres"
                            time="Il y a 32 min"
                            type="update"
                        />
                        <ActivityItem
                            user="Dr. Bella Christiane"
                            action="a exporté les statistiques"
                            time="Il y a 1h"
                            type="export"
                        />
                        <ActivityItem
                            user="Fotso Emmanuel"
                            action="s'est déconnecté"
                            time="Il y a 2h"
                            type="logout"
                        />
                    </div>
                </div>

                {/* Online Users */}
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Utilisateurs en ligne</h3>
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                            67 actifs
                        </span>
                    </div>
                    <div className="space-y-3">
                        <OnlineUser
                            name="Dr. Onana Michel"
                            role="Médecin"
                            service="Cardiologie"
                            avatar="OM"
                        />
                        <OnlineUser
                            name="Ngo Likeng Anne"
                            role="Infirmière"
                            service="Urgences"
                            avatar="NA"
                        />
                        <OnlineUser
                            name="Dr. Bella Christiane"
                            role="Médecin"
                            service="Gynécologie"
                            avatar="BC"
                        />
                        <OnlineUser
                            name="Mbede Claire"
                            role="Infirmière"
                            service="Pédiatrie"
                            avatar="MC"
                        />
                        <OnlineUser
                            name="Dr. Tagne Robert"
                            role="Médecin"
                            service="Pneumologie"
                            avatar="TR"
                        />
                    </div>
                    <button className="mt-4 w-full rounded-xl border border-[#1F1F28] py-2.5 text-sm text-[#A1A1AA] transition-colors hover:bg-[#1F1F28] hover:text-white">
                        Voir tous les utilisateurs
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}

// Components
function StatCard({ title, value, change, changeType, icon, color }: {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    color: 'violet' | 'blue' | 'amber' | 'emerald';
}) {
    const colorClasses = {
        violet: 'from-violet-500 to-purple-600 shadow-violet-500/20',
        blue: 'from-blue-500 to-cyan-600 shadow-blue-500/20',
        amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
        emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    };

    const changeClasses = {
        positive: 'text-emerald-400',
        negative: 'text-red-400',
        neutral: 'text-[#71717A]',
    };

    return (
        <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
                    {icon}
                </div>
                <span className={`text-sm font-medium ${changeClasses[changeType]}`}>{change}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-[#71717A]">{title}</p>
        </div>
    );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-4 text-center transition-all hover:border-violet-500/30 hover:bg-[#1F1F28]"
        >
            <span className="text-violet-400">{icon}</span>
            <span className="text-xs text-[#A1A1AA]">{label}</span>
        </Link>
    );
}

function StatusItem({ label, status, detail }: { label: string; status: 'online' | 'offline' | 'warning'; detail?: string }) {
    const statusConfig = {
        online: { color: 'bg-emerald-500', text: 'En ligne' },
        offline: { color: 'bg-red-500', text: 'Hors ligne' },
        warning: { color: 'bg-amber-500', text: 'Attention' },
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${statusConfig[status].color}`} />
                <span className="text-sm text-[#A1A1AA]">{label}</span>
            </div>
            <span className="text-xs text-[#71717A]">{detail || statusConfig[status].text}</span>
        </div>
    );
}

function ActivityItem({ user, action, time, type }: { user: string; action: string; time: string; type: string }) {
    const typeIcons: Record<string, React.ReactNode> = {
        login: <LoginIcon />,
        logout: <LogoutIcon />,
        create: <PlusIcon />,
        update: <EditIcon />,
        export: <DownloadIcon />,
    };

    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F1F28] text-[#71717A]">
                {typeIcons[type] || <ActivityIcon />}
            </div>
            <div className="flex-1">
                <p className="text-sm text-white">
                    <span className="font-medium">{user}</span>{' '}
                    <span className="text-[#A1A1AA]">{action}</span>
                </p>
                <p className="text-xs text-[#52525B]">{time}</p>
            </div>
        </div>
    );
}

function OnlineUser({ name, role, service, avatar }: { name: string; role: string; service: string; avatar: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
            <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                    {avatar}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0F0F12] bg-emerald-500" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-[#71717A]">{role} • {service}</p>
            </div>
        </div>
    );
}

// Icons
function UsersIcon() {
    return (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function MonitorIcon() {
    return (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    );
}

function TicketIcon() {
    return (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        </svg>
    );
}

function DatabaseIcon() {
    return (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}

function UserPlusIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
    );
}

function KeyIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function FileTextIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    );
}

function LoginIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10,17 15,12 10,7" />
            <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function ActivityIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
    );
}