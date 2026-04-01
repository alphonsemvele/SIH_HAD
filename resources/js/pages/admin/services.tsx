import AdminLayout from './layout';
import { useState } from 'react';

interface Service {
    id: number;
    nom: string;
    code: string;
    description: string;
    responsable: string;
    telephone: string;
    etage: string;
    lits: number;
    litsOccupes: number;
    personnel: number;
    statut: 'actif' | 'inactif';
    couleur: string;
}

export default function AdminServices() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const services: Service[] = [
        { id: 1, nom: 'Cardiologie', code: 'CARDIO', description: 'Maladies cardiovasculaires', responsable: 'Dr. Onana Michel', telephone: '+237 699 123 456', etage: '3ème étage', lits: 24, litsOccupes: 18, personnel: 15, statut: 'actif', couleur: 'red' },
        { id: 2, nom: 'Gynécologie-Obstétrique', code: 'GYNECO', description: 'Santé de la femme et maternité', responsable: 'Dr. Bella Christiane', telephone: '+237 677 234 567', etage: '2ème étage', lits: 32, litsOccupes: 28, personnel: 22, statut: 'actif', couleur: 'pink' },
        { id: 3, nom: 'Urgences', code: 'URG', description: 'Prise en charge des urgences 24h/24', responsable: 'Dr. Mbarga Pierre', telephone: '+237 655 345 678', etage: 'RDC', lits: 16, litsOccupes: 12, personnel: 28, statut: 'actif', couleur: 'orange' },
        { id: 4, nom: 'Pédiatrie', code: 'PED', description: 'Soins aux enfants 0-15 ans', responsable: 'Dr. Nkoulou Françoise', telephone: '+237 699 456 789', etage: '1er étage', lits: 28, litsOccupes: 20, personnel: 18, statut: 'actif', couleur: 'cyan' },
        { id: 5, nom: 'Pneumologie', code: 'PNEUMO', description: 'Maladies respiratoires', responsable: 'Dr. Tagne Robert', telephone: '+237 677 567 890', etage: '4ème étage', lits: 20, litsOccupes: 14, personnel: 12, statut: 'actif', couleur: 'blue' },
        { id: 6, nom: 'Neurologie', code: 'NEURO', description: 'Système nerveux', responsable: 'Dr. Nguele Patrick', telephone: '+237 655 678 901', etage: '4ème étage', lits: 18, litsOccupes: 15, personnel: 10, statut: 'actif', couleur: 'violet' },
        { id: 7, nom: 'Chirurgie générale', code: 'CHIR', description: 'Interventions chirurgicales', responsable: 'Dr. Fotso Emmanuel', telephone: '+237 699 789 012', etage: '5ème étage', lits: 30, litsOccupes: 22, personnel: 25, statut: 'actif', couleur: 'emerald' },
        { id: 8, nom: 'Réanimation', code: 'REA', description: 'Soins intensifs', responsable: 'Dr. Tchamba Paul', telephone: '+237 677 890 123', etage: '5ème étage', lits: 12, litsOccupes: 10, personnel: 20, statut: 'actif', couleur: 'red' },
        { id: 9, nom: 'Médecine interne', code: 'MED-INT', description: 'Pathologies médicales complexes', responsable: 'Dr. Essomba Paul', telephone: '+237 655 901 234', etage: '2ème étage', lits: 26, litsOccupes: 19, personnel: 14, statut: 'actif', couleur: 'amber' },
        { id: 10, nom: 'Dermatologie', code: 'DERMA', description: 'Maladies de la peau', responsable: 'Dr. Mvondo Jacques', telephone: '+237 699 012 345', etage: '1er étage', lits: 8, litsOccupes: 4, personnel: 6, statut: 'actif', couleur: 'pink' },
        { id: 11, nom: 'Ophtalmologie', code: 'OPHTA', description: 'Soins des yeux', responsable: 'Dr. Ngo Marie', telephone: '+237 677 123 456', etage: '1er étage', lits: 6, litsOccupes: 2, personnel: 5, statut: 'actif', couleur: 'blue' },
        { id: 12, nom: 'Radiologie', code: 'RADIO', description: 'Imagerie médicale', responsable: 'Dr. Nkodo François', telephone: '+237 655 234 567', etage: 'Sous-sol', lits: 0, litsOccupes: 0, personnel: 8, statut: 'actif', couleur: 'gray' },
    ];

    const filteredServices = services.filter(s =>
        s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalLits = services.reduce((acc, s) => acc + s.lits, 0);
    const totalOccupes = services.reduce((acc, s) => acc + s.litsOccupes, 0);
    const totalPersonnel = services.reduce((acc, s) => acc + s.personnel, 0);

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            red: 'bg-red-500/20 text-red-400',
            pink: 'bg-pink-500/20 text-pink-400',
            orange: 'bg-orange-500/20 text-orange-400',
            cyan: 'bg-cyan-500/20 text-cyan-400',
            blue: 'bg-blue-500/20 text-blue-400',
            violet: 'bg-violet-500/20 text-violet-400',
            emerald: 'bg-emerald-500/20 text-emerald-400',
            amber: 'bg-amber-500/20 text-amber-400',
            gray: 'bg-gray-500/20 text-gray-400',
        };
        return colors[color] || colors.gray;
    };

    return (
        <AdminLayout title="Services" subtitle="Gestion des services hospitaliers">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-white">{services.length}</p>
                    <p className="text-sm text-[#71717A]">Services actifs</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-blue-400">{totalLits}</p>
                    <p className="text-sm text-[#71717A]">Lits totaux</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-amber-400">{totalOccupes}</p>
                    <p className="text-sm text-[#71717A]">Lits occupés ({Math.round(totalOccupes / totalLits * 100)}%)</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-emerald-400">{totalPersonnel}</p>
                    <p className="text-sm text-[#71717A]">Personnel total</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
                    <input
                        type="text"
                        placeholder="Rechercher un service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-64 rounded-xl border border-[#1F1F28] bg-[#16161D] pl-10 pr-4 text-sm text-white placeholder-[#52525B] outline-none focus:border-violet-500/50"
                    />
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20"
                >
                    <PlusIcon className="h-4 w-4" />
                    Nouveau service
                </button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                    <div
                        key={service.id}
                        className="group rounded-2xl border border-[#1F1F28] bg-[#16161D] p-5 transition-all hover:border-violet-500/30"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getColorClasses(service.couleur)}`}>
                                    <BuildingIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{service.nom}</h3>
                                    <span className="text-xs text-[#71717A]">{service.code}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                    <EditIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <p className="mb-4 text-sm text-[#71717A]">{service.description}</p>

                        <div className="mb-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-[#A1A1AA]">
                                <UserIcon className="h-4 w-4 text-[#52525B]" />
                                {service.responsable}
                            </div>
                            <div className="flex items-center gap-2 text-[#A1A1AA]">
                                <MapPinIcon className="h-4 w-4 text-[#52525B]" />
                                {service.etage}
                            </div>
                        </div>

                        {/* Occupation bar */}
                        {service.lits > 0 && (
                            <div className="mb-4">
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-[#71717A]">Occupation</span>
                                    <span className="text-white">{service.litsOccupes}/{service.lits} lits</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[#1F1F28]">
                                    <div
                                        className={`h-full rounded-full ${service.litsOccupes / service.lits > 0.9 ? 'bg-red-500' : service.litsOccupes / service.lits > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${(service.litsOccupes / service.lits) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-[#1F1F28] pt-4">
                            <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                                <UsersIcon className="h-4 w-4" />
                                {service.personnel} agents
                            </div>
                            <span className={`rounded-lg px-2 py-1 text-xs font-medium ${service.statut === 'actif' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {service.statut === 'actif' ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Nouveau service</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Nom du service</label>
                                <input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50" placeholder="Ex: Cardiologie" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Code</label>
                                <input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50" placeholder="Ex: CARDIO" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Étage/Localisation</label>
                                <input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50" placeholder="Ex: 3ème étage" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Responsable</label>
                                <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50">
                                    <option value="">Sélectionner</option>
                                    <option>Dr. Onana Michel</option>
                                    <option>Dr. Bella Christiane</option>
                                    <option>Dr. Tagne Robert</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Nombre de lits</label>
                                <input type="number" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50" placeholder="0" />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Description</label>
                                <textarea rows={2} className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50" placeholder="Description du service..." />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:text-white">Annuler</button>
                            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20">Créer</button>
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
function PlusIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function BuildingIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" /></svg>;
}
function EditIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function UserIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function MapPinIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function UsersIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
}
function XIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}