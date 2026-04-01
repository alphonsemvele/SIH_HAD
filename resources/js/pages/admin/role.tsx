import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './layout';

interface Permission {
    id: number;
    nom: string;
    description: string | null;
}

interface Role {
    id: number;
    nom: string;
    description: string | null;
    couleur: string;
    users_count: number;
    permissions: Permission[];
    created_at: string;
}

interface Stats {
    total: number;
    avec_utilisateurs: number;
    total_permissions: number;
}

interface Props {
    roles: Role[];
    permissions: Permission[];
    stats: Stats;
}

const COULEURS = [
    { value: '#8B5CF6', label: 'Violet',   bg: 'bg-violet-500' },
    { value: '#3B82F6', label: 'Bleu',     bg: 'bg-blue-500' },
    { value: '#10B981', label: 'Vert',     bg: 'bg-emerald-500' },
    { value: '#F59E0B', label: 'Ambre',    bg: 'bg-amber-500' },
    { value: '#EF4444', label: 'Rouge',    bg: 'bg-red-500' },
    { value: '#EC4899', label: 'Rose',     bg: 'bg-pink-500' },
    { value: '#06B6D4', label: 'Cyan',     bg: 'bg-cyan-500' },
    { value: '#6366F1', label: 'Indigo',   bg: 'bg-indigo-500' },
    { value: '#71717A', label: 'Gris',     bg: 'bg-zinc-500' },
];

function RoleBadge({ nom, couleur }: { nom: string; couleur: string }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: couleur + '33', color: couleur, border: `1px solid ${couleur}55` }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: couleur }} />
            {nom}
        </span>
    );
}

export default function AdminRole({ roles, permissions, stats }: Props) {
    const [showNewModal, setShowNewModal]   = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRole, setSelectedRole]  = useState<Role | null>(null);

    const createForm = useForm({
        nom: '',
        description: '',
        couleur: '#8B5CF6',
        permissions: [] as number[],
    });

    const editForm = useForm({
        nom: '',
        description: '',
        couleur: '#8B5CF6',
        permissions: [] as number[],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/roles', {
            onSuccess: () => { createForm.reset(); setShowNewModal(false); },
        });
    };

    const openEditModal = (role: Role) => {
        setSelectedRole(role);
        editForm.setData({
            nom: role.nom,
            description: role.description || '',
            couleur: role.couleur || '#8B5CF6',
            permissions: role.permissions.map((p) => p.id),
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRole) {
            editForm.put(`/admin/roles/${selectedRole.id}`, {
                onSuccess: () => { setShowEditModal(false); setSelectedRole(null); },
            });
        }
    };

    const handleDelete = (role: Role) => {
        if (role.users_count > 0) {
            alert(`Ce rôle est attribué à ${role.users_count} utilisateur(s). Veuillez les réassigner d'abord.`);
            return;
        }
        if (confirm(`Supprimer le rôle "${role.nom}" ?`)) {
            router.delete(`/admin/roles/${role.id}`);
        }
    };

    const openViewModal = (role: Role) => { setSelectedRole(role); setShowViewModal(true); };

    const togglePermission = (form: any, permId: number) => {
        const current: number[] = form.data.permissions;
        form.setData(
            'permissions',
            current.includes(permId) ? current.filter((id) => id !== permId) : [...current, permId]
        );
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

    return (
        <AdminLayout title="Rôles" subtitle="Gestion des rôles et permissions du système">

            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-[#71717A]">Total rôles</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-violet-400">{stats.avec_utilisateurs}</p>
                    <p className="text-sm text-[#71717A]">Rôles actifs</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-emerald-400">{stats.total_permissions}</p>
                    <p className="text-sm text-[#71717A]">Permissions disponibles</p>
                </div>
            </div>

            {/* Header */}
            <div className="mb-6 flex items-center justify-end">
                <button
                    onClick={() => setShowNewModal(true)}
                    className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nouveau rôle
                </button>
            </div>

            {/* Grid de cartes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                    <div key={role.id}
                        className="group rounded-2xl border border-[#1F1F28] bg-[#16161D] p-5 transition-all hover:border-[#2F2F3A]">
                        {/* Top */}
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {/* Icône colorée */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white"
                                    style={{ backgroundColor: role.couleur + '33', border: `1px solid ${role.couleur}55` }}>
                                    <span style={{ color: role.couleur }}>
                                        {role.nom.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white capitalize">{role.nom}</h3>
                                    <p className="text-xs text-[#71717A]">Créé le {formatDate(role.created_at)}</p>
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button onClick={() => openViewModal(role)}
                                    className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#1F1F28] hover:text-white" title="Voir">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <button onClick={() => openEditModal(role)}
                                    className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#1F1F28] hover:text-white" title="Modifier">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button onClick={() => handleDelete(role)}
                                    className="rounded-lg p-1.5 text-[#71717A] hover:bg-red-500/10 hover:text-red-400" title="Supprimer">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3,6 5,6 21,6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="mb-4 min-h-[2.5rem] text-sm text-[#71717A]">
                            {role.description || 'Aucune description'}
                        </p>

                        {/* Permissions preview */}
                        <div className="mb-4 flex flex-wrap gap-1.5">
                            {role.permissions.slice(0, 4).map((perm) => (
                                <span key={perm.id}
                                    className="rounded-md bg-[#1F1F28] px-2 py-0.5 text-xs text-[#A1A1AA]">
                                    {perm.nom}
                                </span>
                            ))}
                            {role.permissions.length > 4 && (
                                <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-400">
                                    +{role.permissions.length - 4}
                                </span>
                            )}
                            {role.permissions.length === 0 && (
                                <span className="text-xs text-[#52525B] italic">Aucune permission</span>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-[#1F1F28] pt-4">
                            <div className="flex items-center gap-1.5 text-sm text-[#71717A]">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                </svg>
                                <span>
                                    <span className="font-medium text-white">{role.users_count}</span> utilisateur{role.users_count !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <RoleBadge nom={role.nom} couleur={role.couleur} />
                        </div>
                    </div>
                ))}

                {/* Carte "Ajouter" */}
                <button
                    onClick={() => setShowNewModal(true)}
                    className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#2F2F3A] bg-transparent text-[#52525B] transition-all hover:border-violet-500/40 hover:text-violet-400"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-current">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </div>
                    <span className="text-sm font-medium">Nouveau rôle</span>
                </button>
            </div>

            {/* ============================================== */}
            {/* MODAL : VOIR */}
            {/* ============================================== */}
            {showViewModal && selectedRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-[#1F1F28] bg-[#16161D] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#1F1F28] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
                                    style={{ backgroundColor: selectedRole.couleur + '33', color: selectedRole.couleur }}>
                                    {selectedRole.nom.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold capitalize text-white">{selectedRole.nom}</h2>
                                    <p className="text-xs text-[#71717A]">{selectedRole.users_count} utilisateur(s)</p>
                                </div>
                            </div>
                            <button onClick={() => setShowViewModal(false)}
                                className="rounded-full p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <p className="mb-1 text-xs text-[#71717A]">Description</p>
                                <p className="text-sm text-white">{selectedRole.description || '—'}</p>
                            </div>
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                                    Permissions ({selectedRole.permissions.length})
                                </p>
                                {selectedRole.permissions.length === 0 ? (
                                    <p className="text-sm italic text-[#52525B]">Aucune permission attribuée</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRole.permissions.map((perm) => (
                                            <span key={perm.id}
                                                className="rounded-lg bg-[#1F1F28] px-3 py-1.5 text-xs text-[#A1A1AA]">
                                                {perm.nom}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-[#1F1F28] px-6 py-4">
                            <button onClick={() => setShowViewModal(false)}
                                className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:text-white">
                                Fermer
                            </button>
                            <button onClick={() => { setShowViewModal(false); openEditModal(selectedRole); }}
                                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================== */}
            {/* MODAL : NOUVEAU RÔLE */}
            {/* ============================================== */}
            {showNewModal && (
                <RoleFormModal
                    title="Nouveau rôle"
                    subtitle="Créer un rôle et lui attribuer des permissions"
                    form={createForm}
                    permissions={permissions}
                    onSubmit={handleCreate}
                    onClose={() => setShowNewModal(false)}
                    submitLabel="Créer le rôle"
                    onTogglePermission={(id) => togglePermission(createForm, id)}
                />
            )}

            {/* ============================================== */}
            {/* MODAL : ÉDITER RÔLE */}
            {/* ============================================== */}
            {showEditModal && selectedRole && (
                <RoleFormModal
                    title="Modifier le rôle"
                    subtitle={`Édition de "${selectedRole.nom}"`}
                    form={editForm}
                    permissions={permissions}
                    onSubmit={handleUpdate}
                    onClose={() => { setShowEditModal(false); setSelectedRole(null); }}
                    submitLabel="Mettre à jour"
                    onTogglePermission={(id) => togglePermission(editForm, id)}
                />
            )}
        </AdminLayout>
    );
}

/* ============================================== */
/* COMPOSANT : FORMULAIRE RÔLE                    */
/* ============================================== */
interface RoleFormModalProps {
    title: string;
    subtitle: string;
    form: any;
    permissions: Permission[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    submitLabel: string;
    onTogglePermission: (id: number) => void;
}

function RoleFormModal({ title, subtitle, form, permissions, onSubmit, onClose, submitLabel, onTogglePermission }: RoleFormModalProps) {
    const inputCls = (err?: string) =>
        `w-full rounded-xl border px-4 py-3 text-sm text-white outline-none bg-[#0F0F12] placeholder-[#52525B] ${
            err ? 'border-red-500/60 focus:border-red-500' : 'border-[#1F1F28] focus:border-violet-500/50'
        }`;

    // Grouper les permissions par préfixe (ex: "patients.view" → groupe "patients")
    const grouped = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
        const group = perm.nom.includes('.') ? perm.nom.split('.')[0] : 'autres';
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-[#1F1F28] bg-[#16161D] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1F1F28] bg-[#16161D] px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                        <p className="text-sm text-[#71717A]">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Infos de base */}
                    <div>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#71717A]">Informations</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Nom du rôle *</label>
                                <input type="text" value={form.data.nom}
                                    onChange={(e) => form.setData('nom', e.target.value)}
                                    className={inputCls(form.errors.nom)}
                                    placeholder="ex: medecin, infirmier, admin..." />
                                {form.errors.nom && <p className="mt-1 text-xs text-red-400">{form.errors.nom}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Description</label>
                                <textarea value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    rows={2}
                                    className={inputCls() + ' resize-none'}
                                    placeholder="Description du rôle et de ses responsabilités..." />
                            </div>
                            {/* Couleur */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Couleur</label>
                                <div className="flex flex-wrap gap-2">
                                    {COULEURS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => form.setData('couleur', c.value)}
                                            className={`h-8 w-8 rounded-lg transition-all ${
                                                form.data.couleur === c.value
                                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0F0F12] scale-110'
                                                    : 'opacity-70 hover:opacity-100'
                                            }`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    {permissions.length > 0 && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                                    Permissions ({form.data.permissions.length} sélectionnée{form.data.permissions.length > 1 ? 's' : ''})
                                </h3>
                                <div className="flex gap-2">
                                    <button type="button"
                                        onClick={() => form.setData('permissions', permissions.map((p) => p.id))}
                                        className="text-xs text-violet-400 hover:text-violet-300">
                                        Tout sélectionner
                                    </button>
                                    <span className="text-[#71717A]">·</span>
                                    <button type="button"
                                        onClick={() => form.setData('permissions', [])}
                                        className="text-xs text-[#71717A] hover:text-white">
                                        Tout effacer
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                                {Object.entries(grouped).map(([group, perms]) => (
                                    <div key={group}>
                                        <p className="mb-2 text-xs font-medium capitalize text-[#52525B]">{group}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {perms.map((perm) => {
                                                const checked = form.data.permissions.includes(perm.id);
                                                return (
                                                    <label key={perm.id}
                                                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-colors ${
                                                            checked
                                                                ? 'border-violet-500/40 bg-violet-500/10'
                                                                : 'border-[#1F1F28] hover:bg-[#1F1F28]'
                                                        }`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => onTogglePermission(perm.id)}
                                                            className="h-4 w-4 rounded border-[#3F3F46] bg-[#0F0F12] text-violet-500 focus:ring-violet-500"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-medium text-white">{perm.nom}</p>
                                                            {perm.description && (
                                                                <p className="truncate text-xs text-[#71717A]">{perm.description}</p>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-[#1F1F28] pt-4">
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:text-white">
                            Annuler
                        </button>
                        <button type="submit" disabled={form.processing}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">
                            {form.processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}