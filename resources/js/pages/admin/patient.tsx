import AdminLayout from './layout';
import { useState } from 'react';

interface Patient {
    id: number;
    ipp: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    age: number;
    sexe: 'M' | 'F';
    telephone: string;
    email: string;
    adresse: string;
    groupeSanguin: string;
    assurance: string;
    numeroAssurance: string;
    contactUrgence: { nom: string; telephone: string; lien: string };
    statut: 'hospitalise' | 'ambulatoire' | 'sorti' | 'decede';
    service: string;
    chambre: string;
    medecinTraitant: string;
    dateAdmission: string;
    allergies: string[];
    antecedents: string[];
}

export default function AdminPatients() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('');
    const [filterService, setFilterService] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const patients: Patient[] = [
        { id: 1, ipp: 'IPP-2026-0001', nom: 'Nguemo', prenom: 'Jean-Pierre', dateNaissance: '1965-03-15', age: 60, sexe: 'M', telephone: '+237 699 111 222', email: 'jp.nguemo@email.cm', adresse: 'Quartier Bastos, Yaoundé', groupeSanguin: 'O+', assurance: 'CNAMGS', numeroAssurance: 'CN-123456', contactUrgence: { nom: 'Nguemo Marie', telephone: '+237 677 111 222', lien: 'Épouse' }, statut: 'hospitalise', service: 'Cardiologie', chambre: '101', medecinTraitant: 'Dr. Onana Michel', dateAdmission: '2026-01-20', allergies: ['Pénicilline'], antecedents: ['Hypertension', 'Diabète type 2'] },
        { id: 2, ipp: 'IPP-2026-0002', nom: 'Mbarga', prenom: 'Marie-Claire', dateNaissance: '1988-07-22', age: 37, sexe: 'F', telephone: '+237 677 222 333', email: 'mc.mbarga@email.cm', adresse: 'Quartier Mvog-Ada, Yaoundé', groupeSanguin: 'A+', assurance: 'AXA', numeroAssurance: 'AX-789012', contactUrgence: { nom: 'Mbarga Paul', telephone: '+237 699 222 333', lien: 'Époux' }, statut: 'hospitalise', service: 'Gynécologie', chambre: '201', medecinTraitant: 'Dr. Bella Christiane', dateAdmission: '2026-01-22', allergies: [], antecedents: ['Césarienne 2020'] },
        { id: 3, ipp: 'IPP-2026-0003', nom: 'Fotso', prenom: 'Emmanuel', dateNaissance: '1975-11-08', age: 50, sexe: 'M', telephone: '+237 655 333 444', email: 'e.fotso@email.cm', adresse: 'Quartier Omnisport, Yaoundé', groupeSanguin: 'B+', assurance: 'CNAMGS', numeroAssurance: 'CN-234567', contactUrgence: { nom: 'Fotso Jeanne', telephone: '+237 699 333 444', lien: 'Épouse' }, statut: 'hospitalise', service: 'Chirurgie', chambre: '401', medecinTraitant: 'Dr. Tagne Robert', dateAdmission: '2026-01-18', allergies: ['Aspirine', 'Iode'], antecedents: ['Appendicectomie 2010'] },
        { id: 4, ipp: 'IPP-2026-0004', nom: 'Tchamba', prenom: 'Paul', dateNaissance: '1958-02-28', age: 67, sexe: 'M', telephone: '+237 699 444 555', email: 'p.tchamba@email.cm', adresse: 'Quartier Melen, Yaoundé', groupeSanguin: 'AB+', assurance: 'Aucune', numeroAssurance: '', contactUrgence: { nom: 'Tchamba Solange', telephone: '+237 677 444 555', lien: 'Fille' }, statut: 'hospitalise', service: 'Chirurgie', chambre: '403', medecinTraitant: 'Dr. Nguele Patrick', dateAdmission: '2026-01-15', allergies: [], antecedents: ['Fracture fémur 2018', 'Hypertension'] },
        { id: 5, ipp: 'IPP-2026-0005', nom: 'Nkoulou', prenom: 'Françoise', dateNaissance: '1992-09-14', age: 33, sexe: 'F', telephone: '+237 677 555 666', email: 'f.nkoulou@email.cm', adresse: 'Quartier Essos, Yaoundé', groupeSanguin: 'O-', assurance: 'BEAC', numeroAssurance: 'BE-345678', contactUrgence: { nom: 'Nkoulou Pierre', telephone: '+237 699 555 666', lien: 'Frère' }, statut: 'hospitalise', service: 'Gynécologie', chambre: '205', medecinTraitant: 'Dr. Bella Christiane', dateAdmission: '2026-01-21', allergies: ['Sulfamides'], antecedents: ['Grossesse 2022'] },
        { id: 6, ipp: 'IPP-2026-0006', nom: 'Essomba', prenom: 'Martin', dateNaissance: '1970-04-05', age: 55, sexe: 'M', telephone: '+237 655 666 777', email: 'm.essomba@email.cm', adresse: 'Quartier Nkolbisson, Yaoundé', groupeSanguin: 'A-', assurance: 'CNAMGS', numeroAssurance: 'CN-456789', contactUrgence: { nom: 'Essomba Rose', telephone: '+237 677 666 777', lien: 'Épouse' }, statut: 'hospitalise', service: 'Réanimation', chambre: '501', medecinTraitant: 'Dr. Essomba Paul', dateAdmission: '2026-01-19', allergies: [], antecedents: ['Infarctus 2024', 'Pontage coronarien'] },
        { id: 7, ipp: 'IPP-2026-0007', nom: 'Mvondo', prenom: 'Kevin', dateNaissance: '2018-06-12', age: 7, sexe: 'M', telephone: '+237 699 777 888', email: '', adresse: 'Quartier Etoa-Meki, Yaoundé', groupeSanguin: 'B-', assurance: 'CNAMGS', numeroAssurance: 'CN-567890', contactUrgence: { nom: 'Mvondo Jacques', telephone: '+237 699 777 888', lien: 'Père' }, statut: 'hospitalise', service: 'Pédiatrie', chambre: '301', medecinTraitant: 'Dr. Ngo Likeng Anne', dateAdmission: '2026-01-22', allergies: ['Arachides'], antecedents: ['Asthme'] },
        { id: 8, ipp: 'IPP-2026-0008', nom: 'Bella', prenom: 'Sarah', dateNaissance: '2020-01-30', age: 6, sexe: 'F', telephone: '+237 677 888 999', email: '', adresse: 'Quartier Biyem-Assi, Yaoundé', groupeSanguin: 'O+', assurance: 'AXA', numeroAssurance: 'AX-678901', contactUrgence: { nom: 'Bella Christine', telephone: '+237 677 888 999', lien: 'Mère' }, statut: 'hospitalise', service: 'Pédiatrie', chambre: '301', medecinTraitant: 'Dr. Ngo Likeng Anne', dateAdmission: '2026-01-23', allergies: [], antecedents: [] },
        { id: 9, ipp: 'IPP-2025-0892', nom: 'Ateba', prenom: 'Georges', dateNaissance: '1982-12-01', age: 43, sexe: 'M', telephone: '+237 655 999 000', email: 'g.ateba@email.cm', adresse: 'Quartier Nlongkak, Yaoundé', groupeSanguin: 'A+', assurance: 'CNAMGS', numeroAssurance: 'CN-789012', contactUrgence: { nom: 'Ateba Simone', telephone: '+237 699 999 000', lien: 'Sœur' }, statut: 'ambulatoire', service: 'Cardiologie', chambre: '', medecinTraitant: 'Dr. Onana Michel', dateAdmission: '', allergies: [], antecedents: ['Hypertension'] },
        { id: 10, ipp: 'IPP-2025-0756', nom: 'Ngo', prenom: 'Hélène', dateNaissance: '1995-08-19', age: 30, sexe: 'F', telephone: '+237 677 000 111', email: 'h.ngo@email.cm', adresse: 'Quartier Mendong, Yaoundé', groupeSanguin: 'B+', assurance: 'BEAC', numeroAssurance: 'BE-890123', contactUrgence: { nom: 'Ngo Paul', telephone: '+237 655 000 111', lien: 'Père' }, statut: 'ambulatoire', service: 'Gynécologie', chambre: '', medecinTraitant: 'Dr. Bella Christiane', dateAdmission: '', allergies: ['Latex'], antecedents: [] },
        { id: 11, ipp: 'IPP-2025-0623', nom: 'Elong', prenom: 'Patrice', dateNaissance: '1950-05-25', age: 75, sexe: 'M', telephone: '+237 699 123 456', email: '', adresse: 'Quartier Ekounou, Yaoundé', groupeSanguin: 'O+', assurance: 'CNAMGS', numeroAssurance: 'CN-901234', contactUrgence: { nom: 'Elong Richard', telephone: '+237 655 123 456', lien: 'Fils' }, statut: 'sorti', service: 'Pneumologie', chambre: '', medecinTraitant: 'Dr. Tagne Robert', dateAdmission: '2026-01-10', allergies: [], antecedents: ['BPCO', 'Tabagisme'] },
        { id: 12, ipp: 'IPP-2025-0501', nom: 'Mbede', prenom: 'Jacqueline', dateNaissance: '1968-10-03', age: 57, sexe: 'F', telephone: '+237 677 234 567', email: 'j.mbede@email.cm', adresse: 'Quartier Nsimeyong, Yaoundé', groupeSanguin: 'AB-', assurance: 'AXA', numeroAssurance: 'AX-012345', contactUrgence: { nom: 'Mbede Claire', telephone: '+237 699 234 567', lien: 'Fille' }, statut: 'sorti', service: 'Chirurgie', chambre: '', medecinTraitant: 'Dr. Nguele Patrick', dateAdmission: '2026-01-05', allergies: ['Morphine'], antecedents: ['Cholécystectomie 2025'] },
    ];

    const services = ['Cardiologie', 'Gynécologie', 'Pédiatrie', 'Chirurgie', 'Réanimation', 'Urgences', 'Pneumologie'];

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) || patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || patient.ipp.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatut = !filterStatut || patient.statut === filterStatut;
        const matchesService = !filterService || patient.service === filterService;
        return matchesSearch && matchesStatut && matchesService;
    });

    const hospitalises = patients.filter(p => p.statut === 'hospitalise').length;
    const ambulatoires = patients.filter(p => p.statut === 'ambulatoire').length;
    const sortis = patients.filter(p => p.statut === 'sorti').length;

    const getStatutConfig = (statut: string) => {
        const config = {
            hospitalise: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Hospitalisé' },
            ambulatoire: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Ambulatoire' },
            sorti: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Sorti' },
            decede: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Décédé' },
        };
        return config[statut as keyof typeof config] || config.sorti;
    };

    const getGroupeSanguinColor = (groupe: string) => {
        if (groupe.includes('-')) return 'bg-red-500/20 text-red-400';
        return 'bg-emerald-500/20 text-emerald-400';
    };

    return (
        <AdminLayout title="Patients" subtitle="Gestion des dossiers patients">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-white">{patients.length}</p>
                    <p className="text-sm text-[#71717A]">Patients totaux</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-blue-400">{hospitalises}</p>
                    <p className="text-sm text-[#71717A]">Hospitalisés</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-emerald-400">{ambulatoires}</p>
                    <p className="text-sm text-[#71717A]">Ambulatoires</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-gray-400">{sortis}</p>
                    <p className="text-sm text-[#71717A]">Sortis (ce mois)</p>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 w-64 rounded-xl border border-[#1F1F28] bg-[#16161D] pl-10 pr-4 text-sm text-white placeholder-[#52525B] outline-none focus:border-violet-500/50" />
                    </div>
                    <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none">
                        <option value="">Tous les statuts</option>
                        <option value="hospitalise">Hospitalisé</option>
                        <option value="ambulatoire">Ambulatoire</option>
                        <option value="sorti">Sorti</option>
                    </select>
                    <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none">
                        <option value="">Tous les services</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button onClick={() => setShowModal(true)} className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
                    <PlusIcon className="h-4 w-4" />
                    Nouveau patient
                </button>
            </div>

            {/* Patients Table */}
            <div className="overflow-hidden rounded-2xl border border-[#1F1F28] bg-[#16161D]">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#1F1F28] bg-[#0F0F12]">
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Patient</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Médical</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Service</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#71717A]">Statut</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#71717A]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F28]">
                        {filteredPatients.map((patient) => {
                            const statutConfig = getStatutConfig(patient.statut);
                            return (
                                <tr key={patient.id} className="hover:bg-[#1F1F28]/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${patient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                                {patient.prenom[0]}{patient.nom[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{patient.prenom} {patient.nom}</p>
                                                <p className="text-xs text-[#71717A]">{patient.ipp} • {patient.age} ans</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-white">{patient.telephone}</p>
                                        <p className="text-xs text-[#71717A]">{patient.email || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${getGroupeSanguinColor(patient.groupeSanguin)}`}>{patient.groupeSanguin}</span>
                                            {patient.allergies.length > 0 && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">⚠ Allergies</span>}
                                        </div>
                                        <p className="mt-1 text-xs text-[#71717A]">{patient.medecinTraitant}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-white">{patient.service}</p>
                                        {patient.chambre && <p className="text-xs text-[#71717A]">Ch. {patient.chambre}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${statutConfig.bg} ${statutConfig.text}`}>{statutConfig.label}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setSelectedPatient(patient)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"><EyeIcon className="h-4 w-4" /></button>
                                            <button className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"><EditIcon className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Nouveau Patient */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Nouveau patient</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"><XIcon className="h-5 w-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">Prénom</label><input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" /></div>
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">Nom</label><input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" /></div>
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">Date de naissance</label><input type="date" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" /></div>
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">Sexe</label><select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none"><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">Téléphone</label><input type="tel" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" /></div>
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">Groupe sanguin</label><select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}</select></div>
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">Assurance</label><select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none"><option>Aucune</option><option>CNAMGS</option><option>AXA</option><option>BEAC</option></select></div>
                            <div><label className="mb-2 block text-sm text-[#A1A1AA]">N° Assurance</label><input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" /></div>
                            <div className="col-span-2"><label className="mb-2 block text-sm text-[#A1A1AA]">Adresse</label><input type="text" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" /></div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA]">Annuler</button>
                            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white">Créer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Détails Patient */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${selectedPatient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>{selectedPatient.prenom[0]}{selectedPatient.nom[0]}</div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedPatient.prenom} {selectedPatient.nom}</h2>
                                    <p className="text-sm text-[#71717A]">{selectedPatient.ipp} • {selectedPatient.age} ans</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white"><XIcon className="h-5 w-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Groupe sanguin</p>
                                <span className={`rounded px-2 py-1 text-sm font-bold ${getGroupeSanguinColor(selectedPatient.groupeSanguin)}`}>{selectedPatient.groupeSanguin}</span>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Statut</p>
                                <span className={`rounded-lg px-2.5 py-1 text-sm font-medium ${getStatutConfig(selectedPatient.statut).bg} ${getStatutConfig(selectedPatient.statut).text}`}>{getStatutConfig(selectedPatient.statut).label}</span>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Service</p>
                                <p className="font-medium text-white">{selectedPatient.service}</p>
                                {selectedPatient.chambre && <p className="text-xs text-[#52525B]">Chambre {selectedPatient.chambre}</p>}
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Médecin</p>
                                <p className="font-medium text-white">{selectedPatient.medecinTraitant}</p>
                            </div>
                        </div>
                        {selectedPatient.allergies.length > 0 && (
                            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                                <p className="mb-2 text-sm font-medium text-red-400">⚠ Allergies</p>
                                <div className="flex flex-wrap gap-2">{selectedPatient.allergies.map(a => <span key={a} className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs text-red-400">{a}</span>)}</div>
                            </div>
                        )}
                        {selectedPatient.antecedents.length > 0 && (
                            <div className="mt-4 rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-4">
                                <p className="mb-2 text-sm font-medium text-[#A1A1AA]">Antécédents</p>
                                <div className="flex flex-wrap gap-2">{selectedPatient.antecedents.map(a => <span key={a} className="rounded-lg bg-[#1F1F28] px-2.5 py-1 text-xs text-[#A1A1AA]">{a}</span>)}</div>
                            </div>
                        )}
                        <div className="mt-4 rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-4">
                            <p className="mb-2 text-sm font-medium text-[#A1A1AA]">Contact d'urgence</p>
                            <p className="text-white">{selectedPatient.contactUrgence.nom} ({selectedPatient.contactUrgence.lien})</p>
                            <p className="text-sm text-[#71717A]">{selectedPatient.contactUrgence.telephone}</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setSelectedPatient(null)} className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA]">Fermer</button>
                            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white">Dossier complet</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

// Icons
function SearchIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function PlusIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function EyeIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function EditIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function XIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }