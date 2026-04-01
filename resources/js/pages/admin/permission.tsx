import AdminLayout from './layout';
import { useState } from 'react';

interface Role {
    id: number;
    nom: string;
    description: string;
    couleur: string;
    utilisateurs: number;
    permissions: string[];
}

export default function AdminRoles() {
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const roles: Role[] = [
        {
            id: 1,
            nom: 'Super Administrateur',
            description: 'Accès complet à toutes les fonctionnalités du système',
            couleur: 'red',
            utilisateurs: 3,
            permissions: ['all'],
        },
        {
            id: 2,
            nom: 'Administrateur',
            description: 'Gestion des utilisateurs et configuration du système',
            couleur: 'violet',
            utilisateurs: 5,
            permissions: ['users.view', 'users.create', 'users.edit', 'settings.view', 'settings.edit', 'reports.view'],
        },
        {
            id: 3,
            nom: 'Médecin',
            description: 'Accès aux dossiers patients et prescriptions',
            couleur: 'blue',
            utilisateurs: 42,
            permissions: ['patients.view', 'patients.edit', 'consultations.create', 'prescriptions.create', 'lab.view', 'imagerie.view'],
        },
        {
            id: 4,
            nom: 'Infirmier',
            description: 'Suivi des patients et administration des soins',
            couleur: 'cyan',
            utilisateurs: 78,
            permissions: ['patients.view', 'observations.create', 'vitals.create', 'medications.administer'],
        },
        {
            id: 5,
            nom: 'Pharmacien',
            description: 'Gestion des médicaments et délivrance',
            couleur: 'emerald',
            utilisateurs: 12,
            permissions: ['pharmacy.view', 'pharmacy.dispense', 'stock.manage', 'prescriptions.view'],
        },
        {
            id: 6,
            nom: 'Technicien Laboratoire',
            description: 'Analyses et résultats de laboratoire',
            couleur: 'amber',
            utilisateurs: 15,
            permissions: ['lab.view', 'lab.create', 'lab.edit', 'samples.manage'],
        },
        {
            id: 7,
            nom: 'Réceptionniste',
            description: 'Accueil, enregistrement et rendez-vous',
            couleur: 'pink',
            utilisateurs: 8,
            permissions: ['patients.create', 'appointments.manage', 'billing.view'],
        },
        {
            id: 8,
            nom: 'Comptable',
            description: 'Facturation et gestion financière',
            couleur: 'orange',
            utilisateurs: 4,
            permissions: ['billing.view', 'billing.create', 'billing.edit', 'reports.financial'],
        },
    ];

    const permissionModules = [
        {
            module: 'Patients',
            permissions: [
                { id: 'patients.view', nom: 'Voir les patients' },
                { id: 'patients.create', nom: 'Créer un patient' },
                { id: 'patients.edit', nom: 'Modifier un patient' },
                { id: 'patients.delete', nom: 'Supprimer un patient' },
            ],
        },
        {
            module: 'Consultations',
            permissions: [
                { id: 'consultations.view', nom: 'Voir les consultations' },
                { id: 'consultations.create', nom: 'Créer une consultation' },
                { id: 'consultations.edit', nom: 'Modifier une consultation' },
            ],
        },
        {
            module: 'Prescriptions',
            permissions: [
                { id: 'prescriptions.view', nom: 'Voir les prescriptions' },
                { id: 'prescriptions.create', nom: 'Créer une prescription' },
            ],
        },
        {
            module: 'Pharmacie',
            permissions: [
                { id: 'pharmacy.view', nom: 'Voir la pharmacie' },
                { id: 'pharmacy.dispense', nom: 'Délivrer' },
                { id: 'stock.manage', nom: 'Gérer le stock' },
            ],
        },
        {
            module: 'Laboratoire',
            permissions: [
                { id: 'lab.view', nom: 'Voir le laboratoire' },
                { id: 'lab.create', nom: 'Créer une analyse' },
                { id: 'lab.edit', nom: 'Saisir les résultats' },
            ],
        },
        {
            module: 'Administration',
            permissions: [
                { id: 'users.view', nom: 'Voir les utilisateurs' },
                { id: 'users.create', nom: 'Créer un utilisateur' },
                { id: 'users.edit', nom: 'Modifier un utilisateur' },
                { id: 'settings.view', nom: 'Voir les paramètres' },
                { id: 'settings.edit', nom: 'Modifier les paramètres' },
            ],
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            red: { bg: 'bg-red-500/20', text: 'text-red-400' },
            violet: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
            blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
            cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
            emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
            amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
            pink: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
            orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
        };
        return colors[color] || colors.violet;
    };

    return (
        <AdminLayout title="Rôles & Permissions" subtitle="Gestion des droits d'accès">
            {/* Actions */}
            <div className="mb-6 flex items-center justify-between">
                <p className="text-[#71717A]">{roles.length} rôles configurés</p>
                <button
                    onClick={() => { setSelectedRole(null); setShowModal(true); }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
                >
                    <PlusIcon className="h-4 w-4" />
                    Nouveau rôle
                </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {roles.map((role) => {
                    const colors = getColorClasses(role.couleur);
                    return (
                        <div
                            key={role.id}
                            className="group rounded-2xl border border-[#1F1F28] bg-[#16161D] p-5 transition-all hover:border-violet-500/30"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                                    <ShieldIcon className={`h-6 w-6 ${colors.text}`} />
                                </div>
                                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={() => { setSelectedRole(role); setShowModal(true); }}
                                        className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"
                                    >
                                        <EditIcon className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-red-400">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="mb-1 font-semibold text-white">{role.nom}</h3>
                            <p className="mb-4 text-sm text-[#71717A] line-clamp-2">{role.description}</p>

                            <div className="flex items-center justify-between border-t border-[#1F1F28] pt-4">
                                <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                                    <UsersIcon className="h-4 w-4" />
                                    {role.utilisateurs} utilisateurs
                                </div>
                                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
                                    {role.permissions.includes('all') ? 'Tous' : role.permissions.length} perms
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Permissions Matrix */}
            <div className="mt-8 rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                <h3 className="mb-6 text-lg font-semibold text-white">Matrice des permissions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1F1F28]">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Permission</th>
                                {roles.slice(0, 6).map((role) => (
                                    <th key={role.id} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                                        {role.nom.split(' ')[0]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F28]">
                            {permissionModules.map((module) => (
                                <>
                                    <tr key={module.module} className="bg-[#0F0F12]">
                                        <td colSpan={7} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
                                            {module.module}
                                        </td>
                                    </tr>
                                    {module.permissions.map((perm) => (
                                        <tr key={perm.id} className="hover:bg-[#1F1F28]/50">
                                            <td className="px-4 py-3 text-sm text-[#A1A1AA]">{perm.nom}</td>
                                            {roles.slice(0, 6).map((role) => (
                                                <td key={role.id} className="px-4 py-3 text-center">
                                                    {role.permissions.includes('all') || role.permissions.includes(perm.id) ? (
                                                        <CheckIcon className="mx-auto h-5 w-5 text-emerald-400" />
                                                    ) : (
                                                        <XIcon className="mx-auto h-5 w-5 text-[#3F3F46]" />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {selectedRole ? 'Modifier le rôle' : 'Nouveau rôle'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"
                            >
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Nom du rôle</label>
                                <input
                                    type="text"
                                    defaultValue={selectedRole?.nom || ''}
                                    className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50"
                                    placeholder="Ex: Médecin spécialiste"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Description</label>
                                <textarea
                                    defaultValue={selectedRole?.description || ''}
                                    rows={3}
                                    className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50"
                                    placeholder="Décrivez les responsabilités de ce rôle..."
                                />
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-medium text-[#A1A1AA]">Permissions</label>
                                <div className="space-y-4 rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-4">
                                    {permissionModules.map((module) => (
                                        <div key={module.module}>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-400">{module.module}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {module.permissions.map((perm) => (
                                                    <label key={perm.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-[#1F1F28]">
                                                        <input
                                                            type="checkbox"
                                                            defaultChecked={selectedRole?.permissions.includes(perm.id) || selectedRole?.permissions.includes('all')}
                                                            className="h-4 w-4 rounded border-[#1F1F28] bg-[#16161D] text-violet-500 focus:ring-violet-500/20"
                                                        />
                                                        <span className="text-sm text-[#A1A1AA]">{perm.nom}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:border-[#2F2F3A] hover:text-white"
                            >
                                Annuler
                            </button>
                            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
                                {selectedRole ? 'Enregistrer' : 'Créer le rôle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function EditIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
        </svg>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function CloseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}