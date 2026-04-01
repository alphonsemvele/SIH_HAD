import AdminLayout from './layout';
import { useState } from 'react';

interface Session {
    id: string;
    utilisateur: {
        nom: string;
        prenom: string;
        email: string;
        role: string;
        avatar: string;
    };
    appareil: string;
    navigateur: string;
    os: string;
    ip: string;
    localisation: string;
    dateConnexion: string;
    dernierActivite: string;
    statut: 'active' | 'idle' | 'away';
    actions: number;
}

export default function AdminSessions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const sessions: Session[] = [
        {
            id: 'sess_001',
            utilisateur: { nom: 'Onana', prenom: 'Michel', email: 'michel.onana@medicare.cm', role: 'Médecin', avatar: 'OM' },
            appareil: 'Desktop',
            navigateur: 'Chrome 120',
            os: 'Windows 11',
            ip: '192.168.1.45',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 06:30:15',
            dernierActivite: 'Il y a 2 min',
            statut: 'active',
            actions: 47,
        },
        {
            id: 'sess_002',
            utilisateur: { nom: 'Bella', prenom: 'Christiane', email: 'christiane.bella@medicare.cm', role: 'Médecin', avatar: 'BC' },
            appareil: 'Desktop',
            navigateur: 'Firefox 121',
            os: 'macOS Sonoma',
            ip: '192.168.1.78',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 07:15:42',
            dernierActivite: 'Il y a 5 min',
            statut: 'active',
            actions: 32,
        },
        {
            id: 'sess_003',
            utilisateur: { nom: 'Ngo Likeng', prenom: 'Anne', email: 'anne.ngolikeng@medicare.cm', role: 'Infirmier', avatar: 'NA' },
            appareil: 'Tablet',
            navigateur: 'Safari 17',
            os: 'iPadOS 17',
            ip: '192.168.1.112',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 05:45:00',
            dernierActivite: 'Il y a 1 min',
            statut: 'active',
            actions: 89,
        },
        {
            id: 'sess_004',
            utilisateur: { nom: 'Tagne', prenom: 'Robert', email: 'robert.tagne@medicare.cm', role: 'Médecin', avatar: 'TR' },
            appareil: 'Mobile',
            navigateur: 'Chrome Mobile',
            os: 'Android 14',
            ip: '192.168.2.34',
            localisation: 'Douala, Cameroun',
            dateConnexion: '2026-01-23 08:00:23',
            dernierActivite: 'Il y a 15 min',
            statut: 'idle',
            actions: 12,
        },
        {
            id: 'sess_005',
            utilisateur: { nom: 'Mbede', prenom: 'Claire', email: 'claire.mbede@medicare.cm', role: 'Infirmier', avatar: 'MC' },
            appareil: 'Desktop',
            navigateur: 'Edge 120',
            os: 'Windows 10',
            ip: '192.168.1.56',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 06:00:00',
            dernierActivite: 'Il y a 8 min',
            statut: 'active',
            actions: 65,
        },
        {
            id: 'sess_006',
            utilisateur: { nom: 'Nkotto', prenom: 'Fabienne', email: 'fabienne.nkotto@medicare.cm', role: 'Pharmacien', avatar: 'NF' },
            appareil: 'Desktop',
            navigateur: 'Chrome 120',
            os: 'Windows 11',
            ip: '192.168.1.89',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 07:30:00',
            dernierActivite: 'Il y a 3 min',
            statut: 'active',
            actions: 28,
        },
        {
            id: 'sess_007',
            utilisateur: { nom: 'Fouda', prenom: 'Eric', email: 'eric.fouda@medicare.cm', role: 'Technicien', avatar: 'FE' },
            appareil: 'Desktop',
            navigateur: 'Chrome 120',
            os: 'Ubuntu 22.04',
            ip: '192.168.1.201',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 07:00:00',
            dernierActivite: 'Il y a 25 min',
            statut: 'idle',
            actions: 15,
        },
        {
            id: 'sess_008',
            utilisateur: { nom: 'Elong', prenom: 'Richard', email: 'richard.elong@medicare.cm', role: 'Administrateur', avatar: 'ER' },
            appareil: 'Desktop',
            navigateur: 'Chrome 120',
            os: 'macOS Sonoma',
            ip: '192.168.1.10',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 08:30:00',
            dernierActivite: 'À l\'instant',
            statut: 'active',
            actions: 156,
        },
        {
            id: 'sess_009',
            utilisateur: { nom: 'Ekambi', prenom: 'Josiane', email: 'josiane.ekambi@medicare.cm', role: 'Sage-femme', avatar: 'EJ' },
            appareil: 'Mobile',
            navigateur: 'Safari Mobile',
            os: 'iOS 17',
            ip: '192.168.3.45',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 05:30:00',
            dernierActivite: 'Il y a 45 min',
            statut: 'away',
            actions: 34,
        },
        {
            id: 'sess_010',
            utilisateur: { nom: 'Ateba', prenom: 'Simone', email: 'simone.ateba@medicare.cm', role: 'Infirmier', avatar: 'AS' },
            appareil: 'Desktop',
            navigateur: 'Firefox 121',
            os: 'Windows 11',
            ip: '192.168.1.167',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-22 22:00:00',
            dernierActivite: 'Il y a 6 min',
            statut: 'active',
            actions: 78,
        },
        {
            id: 'sess_011',
            utilisateur: { nom: 'Nguele', prenom: 'Patrick', email: 'patrick.nguele@medicare.cm', role: 'Médecin', avatar: 'NP' },
            appareil: 'Desktop',
            navigateur: 'Chrome 120',
            os: 'Windows 11',
            ip: '192.168.1.134',
            localisation: 'Yaoundé, Cameroun',
            dateConnexion: '2026-01-23 09:00:00',
            dernierActivite: 'À l\'instant',
            statut: 'active',
            actions: 8,
        },
        {
            id: 'sess_012',
            utilisateur: { nom: 'Mvondo', prenom: 'Jacques', email: 'jacques.mvondo@medicare.cm', role: 'Médecin', avatar: 'MJ' },
            appareil: 'Tablet',
            navigateur: 'Chrome',
            os: 'Android 14',
            ip: '192.168.2.89',
            localisation: 'Bafoussam, Cameroun',
            dateConnexion: '2026-01-23 08:45:00',
            dernierActivite: 'Il y a 12 min',
            statut: 'idle',
            actions: 5,
        },
    ];

    const roles = ['Médecin', 'Infirmier', 'Pharmacien', 'Technicien', 'Administrateur', 'Sage-femme'];

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = 
            session.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.ip.includes(searchTerm);
        const matchesRole = !filterRole || session.utilisateur.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const activeSessions = sessions.filter(s => s.statut === 'active').length;
    const idleSessions = sessions.filter(s => s.statut === 'idle').length;
    const awaySessions = sessions.filter(s => s.statut === 'away').length;

    const getStatutBadge = (statut: string) => {
        const config = {
            active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Active' },
            idle: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Inactive' },
            away: { bg: 'bg-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-400', label: 'Absente' },
        };
        return config[statut as keyof typeof config] || config.away;
    };

    const getRoleBadge = (role: string) => {
        const config: Record<string, string> = {
            'Médecin': 'bg-violet-500/20 text-violet-400',
            'Infirmier': 'bg-blue-500/20 text-blue-400',
            'Pharmacien': 'bg-emerald-500/20 text-emerald-400',
            'Technicien': 'bg-amber-500/20 text-amber-400',
            'Administrateur': 'bg-red-500/20 text-red-400',
            'Sage-femme': 'bg-pink-500/20 text-pink-400',
        };
        return config[role] || 'bg-gray-500/20 text-gray-400';
    };

    const getDeviceIcon = (appareil: string) => {
        switch (appareil) {
            case 'Desktop': return <DesktopIcon className="h-4 w-4" />;
            case 'Mobile': return <MobileIcon className="h-4 w-4" />;
            case 'Tablet': return <TabletIcon className="h-4 w-4" />;
            default: return <DesktopIcon className="h-4 w-4" />;
        }
    };

    const handleTerminateSession = (session: Session) => {
        setSelectedSession(session);
        setShowConfirmModal(true);
    };

    return (
        <AdminLayout title="Sessions actives" subtitle="Surveillance des connexions en temps réel">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-white">{sessions.length}</p>
                            <p className="text-sm text-[#71717A]">Sessions totales</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20">
                            <MonitorIcon className="h-6 w-6 text-violet-400" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-emerald-400">{activeSessions}</p>
                            <p className="text-sm text-[#71717A]">Sessions actives</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                            <ActivityIcon className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-amber-400">{idleSessions}</p>
                            <p className="text-sm text-[#71717A]">Sessions inactives</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                            <ClockIcon className="h-6 w-6 text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-400">{awaySessions}</p>
                            <p className="text-sm text-[#71717A]">Sessions absentes</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500/20">
                            <UserOffIcon className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email, IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-72 rounded-xl border border-[#1F1F28] bg-[#16161D] pl-10 pr-4 text-sm text-white placeholder-[#52525B] outline-none focus:border-violet-500/50"
                        />
                    </div>

                    {/* Filter Role */}
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none focus:border-violet-500/50"
                    >
                        <option value="">Tous les rôles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex h-10 items-center gap-2 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-[#A1A1AA] transition-colors hover:border-violet-500/30 hover:text-white">
                        <RefreshIcon className="h-4 w-4" />
                        Actualiser
                    </button>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                    >
                        <LogoutIcon className="h-4 w-4" />
                        Terminer toutes les sessions
                    </button>
                </div>
            </div>

            {/* Sessions Table */}
            <div className="overflow-hidden rounded-2xl border border-[#1F1F28] bg-[#16161D]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1F1F28] bg-[#0F0F12]">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Utilisateur</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Appareil</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">IP / Localisation</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Connexion</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Activité</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#71717A]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F28]">
                            {filteredSessions.map((session) => {
                                const statutConfig = getStatutBadge(session.statut);
                                return (
                                    <tr key={session.id} className="transition-colors hover:bg-[#1F1F28]/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                                                        {session.utilisateur.avatar}
                                                    </div>
                                                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#16161D] ${statutConfig.dot}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{session.utilisateur.prenom} {session.utilisateur.nom}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${getRoleBadge(session.utilisateur.role)}`}>
                                                            {session.utilisateur.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F1F28] text-[#71717A]">
                                                    {getDeviceIcon(session.appareil)}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">{session.navigateur}</p>
                                                    <p className="text-xs text-[#71717A]">{session.os}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-sm text-white">{session.ip}</p>
                                            <div className="flex items-center gap-1 text-xs text-[#71717A]">
                                                <MapPinIcon className="h-3 w-3" />
                                                {session.localisation}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-white">{session.dateConnexion.split(' ')[1]}</p>
                                            <p className="text-xs text-[#71717A]">{session.dateConnexion.split(' ')[0]}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-white">{session.dernierActivite}</p>
                                            <p className="text-xs text-[#71717A]">{session.actions} actions</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${statutConfig.bg} ${statutConfig.text}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${statutConfig.dot}`} />
                                                {statutConfig.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-[#1F1F28] hover:text-white" title="Détails">
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleTerminateSession(session)}
                                                    className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-red-500/20 hover:text-red-400"
                                                    title="Terminer la session"
                                                >
                                                    <LogoutIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#1F1F28] px-6 py-4">
                    <p className="text-sm text-[#71717A]">
                        Affichage de <span className="font-medium text-white">{filteredSessions.length}</span> sessions
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#52525B]">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-amber-400" /> Inactive
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-gray-400" /> Absente
                        </span>
                    </div>
                </div>
            </div>

            {/* Session Details Cards (Alternative View) */}
            <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-white">Sessions par localisation</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-violet-400" />
                            <span className="font-medium text-white">Yaoundé</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{sessions.filter(s => s.localisation.includes('Yaoundé')).length}</p>
                        <p className="text-sm text-[#71717A]">sessions actives</p>
                    </div>
                    <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-blue-400" />
                            <span className="font-medium text-white">Douala</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{sessions.filter(s => s.localisation.includes('Douala')).length}</p>
                        <p className="text-sm text-[#71717A]">sessions actives</p>
                    </div>
                    <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5 text-emerald-400" />
                            <span className="font-medium text-white">Autres</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{sessions.filter(s => !s.localisation.includes('Yaoundé') && !s.localisation.includes('Douala')).length}</p>
                        <p className="text-sm text-[#71717A]">sessions actives</p>
                    </div>
                </div>
            </div>

            {/* Confirm Terminate Modal */}
            {showConfirmModal && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                                <AlertIcon className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Terminer la session</h3>
                                <p className="text-sm text-[#71717A]">Cette action est irréversible</p>
                            </div>
                        </div>

                        <div className="mb-6 rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                                    {selectedSession.utilisateur.avatar}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{selectedSession.utilisateur.prenom} {selectedSession.utilisateur.nom}</p>
                                    <p className="text-xs text-[#71717A]">{selectedSession.ip} • {selectedSession.appareil}</p>
                                </div>
                            </div>
                        </div>

                        <p className="mb-6 text-sm text-[#A1A1AA]">
                            Êtes-vous sûr de vouloir terminer cette session ? L'utilisateur sera déconnecté immédiatement et devra se reconnecter.
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:text-white"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600"
                            >
                                Terminer la session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Terminate Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                                <AlertIcon className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Terminer toutes les sessions</h3>
                                <p className="text-sm text-[#71717A]">Action critique</p>
                            </div>
                        </div>

                        <p className="mb-6 text-sm text-[#A1A1AA]">
                            Vous êtes sur le point de terminer <span className="font-bold text-white">{sessions.length} sessions</span>. Tous les utilisateurs seront déconnectés immédiatement (y compris vous-même).
                        </p>

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Tapez "CONFIRMER" pour continuer</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-red-500/50"
                                placeholder="CONFIRMER"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:text-white"
                            >
                                Annuler
                            </button>
                            <button className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600">
                                Terminer toutes les sessions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}

function MonitorIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
}

function ActivityIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" /></svg>;
}

function ClockIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>;
}

function UserOffIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" /></svg>;
}

function RefreshIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10" /><polyline points="1,20 1,14 7,14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
}

function LogoutIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}

function DesktopIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
}

function MobileIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
}

function TabletIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
}

function MapPinIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}

function EyeIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function AlertIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}