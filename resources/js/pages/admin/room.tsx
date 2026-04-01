import AdminLayout from './layout';
import { useState } from 'react';

interface Chambre {
    id: number;
    numero: string;
    etage: string;
    service: string;
    type: 'individuelle' | 'double' | 'triple' | 'salle_commune';
    lits: number;
    litsOccupes: number;
    tarifJournalier: number;
    equipements: string[];
    statut: 'disponible' | 'occupee' | 'maintenance' | 'reservee';
    patients: { nom: string; lit: number }[];
}

export default function AdminChambres() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterService, setFilterService] = useState('');
    const [filterStatut, setFilterStatut] = useState('');
    const [filterType, setFilterType] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedChambre, setSelectedChambre] = useState<Chambre | null>(null);

    const chambres: Chambre[] = [
        { id: 1, numero: '101', etage: '1er étage', service: 'Cardiologie', type: 'individuelle', lits: 1, litsOccupes: 1, tarifJournalier: 75000, equipements: ['TV', 'Climatisation', 'Salle de bain privée', 'WiFi'], statut: 'occupee', patients: [{ nom: 'Nguemo Jean-Pierre', lit: 1 }] },
        { id: 2, numero: '102', etage: '1er étage', service: 'Cardiologie', type: 'double', lits: 2, litsOccupes: 1, tarifJournalier: 50000, equipements: ['TV', 'Climatisation', 'WiFi'], statut: 'occupee', patients: [{ nom: 'Mbarga Marie-Claire', lit: 1 }] },
        { id: 3, numero: '103', etage: '1er étage', service: 'Cardiologie', type: 'double', lits: 2, litsOccupes: 0, tarifJournalier: 50000, equipements: ['TV', 'Climatisation', 'WiFi'], statut: 'disponible', patients: [] },
        { id: 4, numero: '104', etage: '1er étage', service: 'Cardiologie', type: 'individuelle', lits: 1, litsOccupes: 0, tarifJournalier: 75000, equipements: ['TV', 'Climatisation', 'Salle de bain privée', 'WiFi', 'Réfrigérateur'], statut: 'maintenance', patients: [] },
        { id: 5, numero: '201', etage: '2ème étage', service: 'Gynécologie', type: 'individuelle', lits: 1, litsOccupes: 1, tarifJournalier: 75000, equipements: ['TV', 'Climatisation', 'Salle de bain privée', 'WiFi'], statut: 'occupee', patients: [{ nom: 'Nkoulou Françoise', lit: 1 }] },
        { id: 6, numero: '202', etage: '2ème étage', service: 'Gynécologie', type: 'double', lits: 2, litsOccupes: 2, tarifJournalier: 50000, equipements: ['TV', 'Climatisation', 'WiFi'], statut: 'occupee', patients: [{ nom: 'Eyene Bernadette', lit: 1 }, { nom: 'Tchamba Solange', lit: 2 }] },
        { id: 7, numero: '203', etage: '2ème étage', service: 'Gynécologie', type: 'triple', lits: 3, litsOccupes: 2, tarifJournalier: 35000, equipements: ['Ventilateur', 'WiFi'], statut: 'occupee', patients: [{ nom: 'Fouda Hélène', lit: 1 }, { nom: 'Ateba Rose', lit: 3 }] },
        { id: 8, numero: '204', etage: '2ème étage', service: 'Gynécologie', type: 'individuelle', lits: 1, litsOccupes: 0, tarifJournalier: 75000, equipements: ['TV', 'Climatisation', 'Salle de bain privée', 'WiFi'], statut: 'reservee', patients: [] },
        { id: 9, numero: '301', etage: '3ème étage', service: 'Pédiatrie', type: 'double', lits: 2, litsOccupes: 2, tarifJournalier: 45000, equipements: ['TV', 'Climatisation', 'WiFi', 'Espace jeux'], statut: 'occupee', patients: [{ nom: 'Petit Mvondo Kevin', lit: 1 }, { nom: 'Petite Bella Sarah', lit: 2 }] },
        { id: 10, numero: '302', etage: '3ème étage', service: 'Pédiatrie', type: 'triple', lits: 3, litsOccupes: 1, tarifJournalier: 30000, equipements: ['TV', 'Ventilateur', 'WiFi'], statut: 'occupee', patients: [{ nom: 'Petit Onana Lucas', lit: 2 }] },
        { id: 11, numero: '303', etage: '3ème étage', service: 'Pédiatrie', type: 'salle_commune', lits: 6, litsOccupes: 4, tarifJournalier: 15000, equipements: ['Ventilateur', 'WiFi'], statut: 'occupee', patients: [{ nom: 'Enfant Tagne', lit: 1 }, { nom: 'Enfant Ngo', lit: 2 }, { nom: 'Enfant Elong', lit: 4 }, { nom: 'Enfant Mbede', lit: 5 }] },
        { id: 12, numero: '401', etage: '4ème étage', service: 'Chirurgie', type: 'individuelle', lits: 1, litsOccupes: 1, tarifJournalier: 100000, equipements: ['TV', 'Climatisation', 'Salle de bain privée', 'WiFi', 'Réfrigérateur', 'Canapé visiteur'], statut: 'occupee', patients: [{ nom: 'Fotso Emmanuel', lit: 1 }] },
        { id: 13, numero: '402', etage: '4ème étage', service: 'Chirurgie', type: 'double', lits: 2, litsOccupes: 0, tarifJournalier: 60000, equipements: ['TV', 'Climatisation', 'WiFi'], statut: 'disponible', patients: [] },
        { id: 14, numero: '403', etage: '4ème étage', service: 'Chirurgie', type: 'individuelle', lits: 1, litsOccupes: 1, tarifJournalier: 100000, equipements: ['TV', 'Climatisation', 'Salle de bain privée', 'WiFi', 'Réfrigérateur'], statut: 'occupee', patients: [{ nom: 'Tchamba Paul', lit: 1 }] },
        { id: 15, numero: '501', etage: '5ème étage', service: 'Réanimation', type: 'individuelle', lits: 1, litsOccupes: 1, tarifJournalier: 150000, equipements: ['Monitoring cardiaque', 'Respirateur', 'Climatisation'], statut: 'occupee', patients: [{ nom: 'Essomba Martin', lit: 1 }] },
        { id: 16, numero: '502', etage: '5ème étage', service: 'Réanimation', type: 'individuelle', lits: 1, litsOccupes: 1, tarifJournalier: 150000, equipements: ['Monitoring cardiaque', 'Respirateur', 'Climatisation'], statut: 'occupee', patients: [{ nom: 'Nkodo Patrice', lit: 1 }] },
        { id: 17, numero: '503', etage: '5ème étage', service: 'Réanimation', type: 'individuelle', lits: 1, litsOccupes: 0, tarifJournalier: 150000, equipements: ['Monitoring cardiaque', 'Respirateur', 'Climatisation'], statut: 'disponible', patients: [] },
        { id: 18, numero: 'URG-01', etage: 'RDC', service: 'Urgences', type: 'salle_commune', lits: 8, litsOccupes: 5, tarifJournalier: 25000, equipements: ['Monitoring', 'Oxygène'], statut: 'occupee', patients: [{ nom: 'Patient 1', lit: 1 }, { nom: 'Patient 2', lit: 3 }, { nom: 'Patient 3', lit: 4 }, { nom: 'Patient 4', lit: 6 }, { nom: 'Patient 5', lit: 7 }] },
    ];

    const services = ['Cardiologie', 'Gynécologie', 'Pédiatrie', 'Chirurgie', 'Réanimation', 'Urgences', 'Pneumologie', 'Neurologie'];

    const filteredChambres = chambres.filter(chambre => {
        const matchesSearch = chambre.numero.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = !filterService || chambre.service === filterService;
        const matchesStatut = !filterStatut || chambre.statut === filterStatut;
        const matchesType = !filterType || chambre.type === filterType;
        return matchesSearch && matchesService && matchesStatut && matchesType;
    });

    const totalLits = chambres.reduce((acc, c) => acc + c.lits, 0);
    const totalOccupes = chambres.reduce((acc, c) => acc + c.litsOccupes, 0);
    const chambresDisponibles = chambres.filter(c => c.statut === 'disponible').length;
    const chambresMaintenance = chambres.filter(c => c.statut === 'maintenance').length;

    const getStatutConfig = (statut: string) => {
        const config = {
            disponible: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Disponible', icon: '✓' },
            occupee: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Occupée', icon: '●' },
            maintenance: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Maintenance', icon: '⚠' },
            reservee: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', label: 'Réservée', icon: '◐' },
        };
        return config[statut as keyof typeof config] || config.disponible;
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            individuelle: 'Individuelle',
            double: 'Double',
            triple: 'Triple',
            salle_commune: 'Salle commune',
        };
        return labels[type as keyof typeof labels] || type;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price);
    };

    return (
        <AdminLayout title="Chambres" subtitle="Gestion des chambres et lits">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-white">{chambres.length}</p>
                    <p className="text-sm text-[#71717A]">Chambres totales</p>
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
                    <p className="text-2xl font-bold text-emerald-400">{chambresDisponibles}</p>
                    <p className="text-sm text-[#71717A]">Chambres libres</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-red-400">{chambresMaintenance}</p>
                    <p className="text-sm text-[#71717A]">En maintenance</p>
                </div>
            </div>

            {/* Occupation Bar */}
            <div className="mb-6 rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Taux d'occupation global</span>
                    <span className="text-sm text-[#A1A1AA]">{totalOccupes} / {totalLits} lits</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-[#1F1F28]">
                    <div
                        className={`h-full rounded-full transition-all ${totalOccupes / totalLits > 0.9 ? 'bg-red-500' : totalOccupes / totalLits > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(totalOccupes / totalLits) * 100}%` }}
                    />
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
                        <input
                            type="text"
                            placeholder="N° chambre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-40 rounded-xl border border-[#1F1F28] bg-[#16161D] pl-10 pr-4 text-sm text-white placeholder-[#52525B] outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none">
                        <option value="">Tous les services</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none">
                        <option value="">Tous les types</option>
                        <option value="individuelle">Individuelle</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                        <option value="salle_commune">Salle commune</option>
                    </select>
                    <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none">
                        <option value="">Tous les statuts</option>
                        <option value="disponible">Disponible</option>
                        <option value="occupee">Occupée</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reservee">Réservée</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-xl border border-[#1F1F28] bg-[#16161D]">
                        <button onClick={() => setViewMode('grid')} className={`rounded-l-xl px-3 py-2 ${viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-[#71717A]'}`}>
                            <GridIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`rounded-r-xl px-3 py-2 ${viewMode === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-[#71717A]'}`}>
                            <ListIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <button onClick={() => setShowModal(true)} className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
                        <PlusIcon className="h-4 w-4" />
                        Nouvelle chambre
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredChambres.map((chambre) => {
                        const statutConfig = getStatutConfig(chambre.statut);
                        return (
                            <div
                                key={chambre.id}
                                onClick={() => setSelectedChambre(chambre)}
                                className={`cursor-pointer rounded-2xl border bg-[#16161D] p-4 transition-all hover:border-violet-500/30 ${statutConfig.border}`}
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Ch. {chambre.numero}</h3>
                                        <p className="text-xs text-[#71717A]">{chambre.etage}</p>
                                    </div>
                                    <span className={`rounded-lg px-2 py-1 text-xs font-medium ${statutConfig.bg} ${statutConfig.text}`}>
                                        {statutConfig.label}
                                    </span>
                                </div>

                                <div className="mb-3 flex items-center gap-2 text-sm text-[#A1A1AA]">
                                    <BuildingIcon className="h-4 w-4 text-[#52525B]" />
                                    {chambre.service}
                                </div>

                                <div className="mb-3">
                                    <div className="mb-1 flex justify-between text-xs">
                                        <span className="text-[#71717A]">{getTypeLabel(chambre.type)}</span>
                                        <span className="text-white">{chambre.litsOccupes}/{chambre.lits} lits</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: chambre.lits }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-2 flex-1 rounded-full ${i < chambre.litsOccupes ? 'bg-blue-500' : 'bg-[#1F1F28]'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {chambre.patients.length > 0 && (
                                    <div className="mb-3 space-y-1">
                                        {chambre.patients.slice(0, 2).map((patient, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                                                <UserIcon className="h-3 w-3" />
                                                <span className="truncate">{patient.nom}</span>
                                                <span className="text-[#52525B]">Lit {patient.lit}</span>
                                            </div>
                                        ))}
                                        {chambre.patients.length > 2 && (
                                            <p className="text-xs text-[#52525B]">+{chambre.patients.length - 2} autres</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t border-[#1F1F28] pt-3">
                                    <span className="text-sm font-medium text-white">{formatPrice(chambre.tarifJournalier)}</span>
                                    <span className="text-xs text-[#71717A]">/ jour</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="overflow-hidden rounded-2xl border border-[#1F1F28] bg-[#16161D]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1F1F28] bg-[#0F0F12]">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Chambre</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Service</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Occupation</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Tarif</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#71717A]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F28]">
                            {filteredChambres.map((chambre) => {
                                const statutConfig = getStatutConfig(chambre.statut);
                                return (
                                    <tr key={chambre.id} className="hover:bg-[#1F1F28]/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">Ch. {chambre.numero}</p>
                                            <p className="text-xs text-[#71717A]">{chambre.etage}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#A1A1AA]">{chambre.service}</td>
                                        <td className="px-6 py-4 text-sm text-[#A1A1AA]">{getTypeLabel(chambre.type)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: chambre.lits }).map((_, i) => (
                                                        <div key={i} className={`h-3 w-3 rounded-sm ${i < chambre.litsOccupes ? 'bg-blue-500' : 'bg-[#1F1F28]'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-[#A1A1AA]">{chambre.litsOccupes}/{chambre.lits}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{formatPrice(chambre.tarifJournalier)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${statutConfig.bg} ${statutConfig.text}`}>
                                                {statutConfig.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"><EyeIcon className="h-4 w-4" /></button>
                                                <button className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"><EditIcon className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Nouvelle Chambre */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Nouvelle chambre</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Numéro</label>
                                <input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none focus:border-violet-500/50" placeholder="Ex: 105" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Étage</label>
                                <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">
                                    <option>RDC</option>
                                    <option>1er étage</option>
                                    <option>2ème étage</option>
                                    <option>3ème étage</option>
                                    <option>4ème étage</option>
                                    <option>5ème étage</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Service</label>
                                <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">
                                    {services.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Type</label>
                                <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">
                                    <option value="individuelle">Individuelle (1 lit)</option>
                                    <option value="double">Double (2 lits)</option>
                                    <option value="triple">Triple (3 lits)</option>
                                    <option value="salle_commune">Salle commune (6+ lits)</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Nombre de lits</label>
                                <input type="number" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" placeholder="1" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Tarif journalier (FCFA)</label>
                                <input type="number" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" placeholder="50000" />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Équipements</label>
                                <div className="flex flex-wrap gap-2">
                                    {['TV', 'Climatisation', 'WiFi', 'Salle de bain privée', 'Réfrigérateur', 'Ventilateur'].map(eq => (
                                        <label key={eq} className="flex items-center gap-2 rounded-lg border border-[#1F1F28] bg-[#0F0F12] px-3 py-2 text-sm text-[#A1A1AA]">
                                            <input type="checkbox" className="rounded border-[#1F1F28] bg-[#16161D] text-violet-500" />
                                            {eq}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:text-white">Annuler</button>
                            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20">Créer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Détails Chambre */}
            {selectedChambre && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Chambre {selectedChambre.numero}</h2>
                                <p className="text-sm text-[#71717A]">{selectedChambre.etage} • {selectedChambre.service}</p>
                            </div>
                            <button onClick={() => setSelectedChambre(null)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Type</p>
                                <p className="font-medium text-white">{getTypeLabel(selectedChambre.type)}</p>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Tarif</p>
                                <p className="font-medium text-white">{formatPrice(selectedChambre.tarifJournalier)}/jour</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="mb-2 text-sm font-medium text-[#A1A1AA]">Occupation des lits</p>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: selectedChambre.lits }).map((_, i) => {
                                    const patient = selectedChambre.patients.find(p => p.lit === i + 1);
                                    return (
                                        <div key={i} className={`rounded-xl border p-3 text-center ${patient ? 'border-blue-500/30 bg-blue-500/10' : 'border-[#1F1F28] bg-[#0F0F12]'}`}>
                                            <BedIcon className={`mx-auto mb-1 h-6 w-6 ${patient ? 'text-blue-400' : 'text-[#52525B]'}`} />
                                            <p className="text-xs text-[#71717A]">Lit {i + 1}</p>
                                            {patient && <p className="mt-1 truncate text-xs text-white">{patient.nom.split(' ')[0]}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="mb-2 text-sm font-medium text-[#A1A1AA]">Équipements</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedChambre.equipements.map(eq => (
                                    <span key={eq} className="rounded-lg bg-[#1F1F28] px-2.5 py-1 text-xs text-[#A1A1AA]">{eq}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSelectedChambre(null)} className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] hover:text-white">Fermer</button>
                            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white">Modifier</button>
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
function GridIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
}
function ListIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}
function BuildingIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /></svg>;
}
function UserIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function EyeIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function EditIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function XIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function BedIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>;
}