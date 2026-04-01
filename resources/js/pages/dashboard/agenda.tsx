import { Link } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface Personnel {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    sexe: string;
    fonction: 'Médecin' | 'Infirmier' | 'Sage-femme' | 'Technicien' | 'Pharmacien' | 'Aide-soignant' | 'Administratif';
    specialite: string;
    service: string;
    telephone: string;
    photo: string | null;
}

interface Presence {
    id: number;
    personnel: Personnel;
    date: string;
    equipe: 'Matin' | 'Après-midi' | 'Nuit' | 'Journée';
    heureDebut: string;
    heureFin: string;
    heureArrivee: string | null;
    heureDepart: string | null;
    status: 'Planifié' | 'Présent' | 'Retard' | 'Absent' | 'Congé' | 'Maladie' | 'Terminé';
    notes: string | null;
}

interface Conge {
    id: number;
    personnel: Personnel;
    type: 'Congé annuel' | 'Congé maladie' | 'Congé maternité' | 'Formation' | 'Récupération';
    dateDebut: string;
    dateFin: string;
    status: 'En attente' | 'Approuvé' | 'Refusé';
    motif: string;
}

export default function Agenda() {
    const [activeTab, setActiveTab] = useState<'aujourdhui' | 'planning' | 'conges' | 'statistiques'>('aujourdhui');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedEquipe, setSelectedEquipe] = useState<string>('');
    const [showPointage, setShowPointage] = useState(false);
    const [showDemandeConge, setShowDemandeConge] = useState(false);
    const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

    const services = [
        'Cardiologie', 'Pneumologie', 'Neurologie', 'Orthopédie', 'Pédiatrie',
        'Chirurgie', 'Médecine interne', 'Gynécologie', 'Urgences', 'Réanimation',
        'Laboratoire', 'Imagerie', 'Pharmacie', 'Administration'
    ];

    const personnelList: Personnel[] = [
        { id: 1, matricule: 'MED-001', nom: 'Onana', prenom: 'Michel', sexe: 'M', fonction: 'Médecin', specialite: 'Cardiologie', service: 'Cardiologie', telephone: '+237 699 111 001', photo: null },
        { id: 2, matricule: 'MED-002', nom: 'Bella', prenom: 'Christiane', sexe: 'F', fonction: 'Médecin', specialite: 'Gynécologie', service: 'Gynécologie', telephone: '+237 699 111 002', photo: null },
        { id: 3, matricule: 'MED-003', nom: 'Tagne', prenom: 'Robert', sexe: 'M', fonction: 'Médecin', specialite: 'Pneumologie', service: 'Pneumologie', telephone: '+237 699 111 003', photo: null },
        { id: 4, matricule: 'MED-004', nom: 'Nguele', prenom: 'Patrick', sexe: 'M', fonction: 'Médecin', specialite: 'Neurologie', service: 'Neurologie', telephone: '+237 699 111 004', photo: null },
        { id: 5, matricule: 'MED-005', nom: 'Ngo Likeng', prenom: 'Anne', sexe: 'F', fonction: 'Médecin', specialite: 'Orthopédie', service: 'Orthopédie', telephone: '+237 699 111 005', photo: null },
        { id: 6, matricule: 'MED-006', nom: 'Essomba', prenom: 'Paul', sexe: 'M', fonction: 'Médecin', specialite: 'Médecine interne', service: 'Médecine interne', telephone: '+237 699 111 006', photo: null },
        { id: 7, matricule: 'MED-007', nom: 'Mvondo', prenom: 'Jacques', sexe: 'M', fonction: 'Médecin', specialite: 'Dermatologie', service: 'Médecine interne', telephone: '+237 699 111 007', photo: null },
        { id: 8, matricule: 'MED-008', nom: 'Nkodo', prenom: 'François', sexe: 'M', fonction: 'Médecin', specialite: 'Radiologie', service: 'Imagerie', telephone: '+237 699 111 008', photo: null },
        { id: 9, matricule: 'INF-001', nom: 'Ngo Likeng', prenom: 'Anne-Marie', sexe: 'F', fonction: 'Infirmier', specialite: 'Soins intensifs', service: 'Urgences', telephone: '+237 677 222 001', photo: null },
        { id: 10, matricule: 'INF-002', nom: 'Mbede', prenom: 'Claire', sexe: 'F', fonction: 'Infirmier', specialite: 'Pédiatrie', service: 'Pédiatrie', telephone: '+237 677 222 002', photo: null },
        { id: 11, matricule: 'INF-003', nom: 'Ateba', prenom: 'Simone', sexe: 'F', fonction: 'Infirmier', specialite: 'Chirurgie', service: 'Chirurgie', telephone: '+237 677 222 003', photo: null },
        { id: 12, matricule: 'INF-004', nom: 'Fouda', prenom: 'Eric', sexe: 'M', fonction: 'Technicien', specialite: 'Radiologie', service: 'Imagerie', telephone: '+237 677 222 004', photo: null },
        { id: 13, matricule: 'INF-005', nom: 'Ekambi', prenom: 'Josiane', sexe: 'F', fonction: 'Sage-femme', specialite: 'Obstétrique', service: 'Gynécologie', telephone: '+237 677 222 005', photo: null },
        { id: 14, matricule: 'INF-006', nom: 'Nkotto', prenom: 'Fabienne', sexe: 'F', fonction: 'Pharmacien', specialite: 'Pharmacie clinique', service: 'Pharmacie', telephone: '+237 677 222 006', photo: null },
        { id: 15, matricule: 'INF-007', nom: 'Eyene', prenom: 'Martin', sexe: 'M', fonction: 'Infirmier', specialite: 'Cardiologie', service: 'Cardiologie', telephone: '+237 677 222 007', photo: null },
        { id: 16, matricule: 'INF-008', nom: 'Mbassi', prenom: 'Jeanne', sexe: 'F', fonction: 'Infirmier', specialite: 'Réanimation', service: 'Réanimation', telephone: '+237 677 222 008', photo: null },
        { id: 17, matricule: 'INF-009', nom: 'Tchinda', prenom: 'Serge', sexe: 'M', fonction: 'Infirmier', specialite: 'Urgences', service: 'Urgences', telephone: '+237 677 222 009', photo: null },
        { id: 18, matricule: 'INF-010', nom: 'Ngah', prenom: 'Béatrice', sexe: 'F', fonction: 'Aide-soignant', specialite: 'Soins généraux', service: 'Médecine interne', telephone: '+237 677 222 010', photo: null },
        { id: 19, matricule: 'ADM-001', nom: 'Elong', prenom: 'Richard', sexe: 'M', fonction: 'Administratif', specialite: 'Direction', service: 'Administration', telephone: '+237 655 333 001', photo: null },
        { id: 20, matricule: 'ADM-002', nom: 'Ndam', prenom: 'Solange', sexe: 'F', fonction: 'Administratif', specialite: 'Accueil', service: 'Administration', telephone: '+237 655 333 002', photo: null },
    ];

    const presencesAujourdhui: Presence[] = [
        { id: 1, personnel: personnelList[0], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: '05:52', heureDepart: null, status: 'Présent', notes: null },
        { id: 2, personnel: personnelList[1], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: '06:15', heureDepart: null, status: 'Retard', notes: 'Embouteillage' },
        { id: 3, personnel: personnelList[2], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: '05:45', heureDepart: null, status: 'Présent', notes: null },
        { id: 4, personnel: personnelList[3], date: '21/01/2025', equipe: 'Après-midi', heureDebut: '14:00', heureFin: '22:00', heureArrivee: null, heureDepart: null, status: 'Planifié', notes: null },
        { id: 5, personnel: personnelList[4], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: '05:58', heureDepart: null, status: 'Présent', notes: null },
        { id: 6, personnel: personnelList[5], date: '21/01/2025', equipe: 'Journée', heureDebut: '08:00', heureFin: '17:00', heureArrivee: '07:55', heureDepart: null, status: 'Présent', notes: null },
        { id: 7, personnel: personnelList[6], date: '21/01/2025', equipe: 'Journée', heureDebut: '08:00', heureFin: '17:00', heureArrivee: null, heureDepart: null, status: 'Congé', notes: 'Congé annuel' },
        { id: 8, personnel: personnelList[7], date: '21/01/2025', equipe: 'Matin', heureDebut: '07:00', heureFin: '15:00', heureArrivee: '06:50', heureDepart: null, status: 'Présent', notes: null },
        { id: 9, personnel: personnelList[8], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: '05:55', heureDepart: null, status: 'Présent', notes: null },
        { id: 10, personnel: personnelList[9], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: '05:48', heureDepart: null, status: 'Présent', notes: null },
        { id: 11, personnel: personnelList[10], date: '21/01/2025', equipe: 'Après-midi', heureDebut: '14:00', heureFin: '22:00', heureArrivee: null, heureDepart: null, status: 'Planifié', notes: null },
        { id: 12, personnel: personnelList[11], date: '21/01/2025', equipe: 'Matin', heureDebut: '07:00', heureFin: '15:00', heureArrivee: '06:55', heureDepart: null, status: 'Présent', notes: null },
        { id: 13, personnel: personnelList[12], date: '21/01/2025', equipe: 'Nuit', heureDebut: '22:00', heureFin: '06:00', heureArrivee: null, heureDepart: null, status: 'Planifié', notes: null },
        { id: 14, personnel: personnelList[13], date: '21/01/2025', equipe: 'Journée', heureDebut: '08:00', heureFin: '17:00', heureArrivee: '08:05', heureDepart: null, status: 'Retard', notes: null },
        { id: 15, personnel: personnelList[14], date: '21/01/2025', equipe: 'Nuit', heureDebut: '22:00', heureFin: '06:00', heureArrivee: null, heureDepart: null, status: 'Planifié', notes: null },
        { id: 16, personnel: personnelList[15], date: '21/01/2025', equipe: 'Nuit', heureDebut: '22:00', heureFin: '06:00', heureArrivee: null, heureDepart: null, status: 'Planifié', notes: null },
        { id: 17, personnel: personnelList[16], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: null, heureDepart: null, status: 'Absent', notes: 'Non justifié' },
        { id: 18, personnel: personnelList[17], date: '21/01/2025', equipe: 'Matin', heureDebut: '06:00', heureFin: '14:00', heureArrivee: '06:00', heureDepart: null, status: 'Présent', notes: null },
        { id: 19, personnel: personnelList[18], date: '21/01/2025', equipe: 'Journée', heureDebut: '08:00', heureFin: '17:00', heureArrivee: '07:45', heureDepart: null, status: 'Présent', notes: null },
        { id: 20, personnel: personnelList[19], date: '21/01/2025', equipe: 'Journée', heureDebut: '08:00', heureFin: '17:00', heureArrivee: null, heureDepart: null, status: 'Maladie', notes: 'Certificat médical' },
    ];

    const conges: Conge[] = [
        { id: 1, personnel: personnelList[6], type: 'Congé annuel', dateDebut: '20/01/2025', dateFin: '03/02/2025', status: 'Approuvé', motif: 'Vacances familiales' },
        { id: 2, personnel: personnelList[19], type: 'Congé maladie', dateDebut: '21/01/2025', dateFin: '25/01/2025', status: 'Approuvé', motif: 'Grippe' },
        { id: 3, personnel: personnelList[12], type: 'Formation', dateDebut: '27/01/2025', dateFin: '31/01/2025', status: 'Approuvé', motif: 'Formation échographie obstétricale' },
        { id: 4, personnel: personnelList[10], type: 'Récupération', dateDebut: '24/01/2025', dateFin: '24/01/2025', status: 'En attente', motif: 'Heures supplémentaires du 15/01' },
        { id: 5, personnel: personnelList[4], type: 'Congé annuel', dateDebut: '10/02/2025', dateFin: '24/02/2025', status: 'En attente', motif: 'Voyage' },
    ];

    const stats = {
        totalPersonnel: presencesAujourdhui.length,
        presents: presencesAujourdhui.filter(p => p.status === 'Présent').length,
        retards: presencesAujourdhui.filter(p => p.status === 'Retard').length,
        absents: presencesAujourdhui.filter(p => p.status === 'Absent').length,
        conges: presencesAujourdhui.filter(p => p.status === 'Congé' || p.status === 'Maladie').length,
        planifies: presencesAujourdhui.filter(p => p.status === 'Planifié').length,
    };

    const equipesStats = {
        matin: presencesAujourdhui.filter(p => p.equipe === 'Matin'),
        apresMidi: presencesAujourdhui.filter(p => p.equipe === 'Après-midi'),
        nuit: presencesAujourdhui.filter(p => p.equipe === 'Nuit'),
        journee: presencesAujourdhui.filter(p => p.equipe === 'Journée'),
    };

    const filteredPresences = presencesAujourdhui.filter(p => {
        if (selectedService && p.personnel.service !== selectedService) return false;
        if (selectedEquipe && p.equipe !== selectedEquipe) return false;
        return true;
    });

    return (
        <DashboardLayout title="Agenda du personnel" subtitle="Gestion des présences et plannings">
            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard title="Total planifié" value={stats.totalPersonnel} icon={<UsersIcon />} color="blue" />
                <StatCard title="Présents" value={stats.presents} icon={<CheckCircleIcon />} color="green" />
                <StatCard title="Retards" value={stats.retards} icon={<ClockAlertIcon />} color="orange" />
                <StatCard title="Absents" value={stats.absents} icon={<XCircleIcon />} color="red" />
                <StatCard title="Congés/Maladie" value={stats.conges} icon={<CalendarOffIcon />} color="purple" />
                <StatCard title="À venir" value={stats.planifies} icon={<ClockIcon />} color="gray" />
            </div>

            {/* Équipes du jour */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <EquipeCard
                    title="Équipe Matin"
                    horaire="06:00 - 14:00"
                    total={equipesStats.matin.length}
                    presents={equipesStats.matin.filter(p => p.status === 'Présent' || p.status === 'Retard').length}
                    color="amber"
                />
                <EquipeCard
                    title="Équipe Après-midi"
                    horaire="14:00 - 22:00"
                    total={equipesStats.apresMidi.length}
                    presents={equipesStats.apresMidi.filter(p => p.status === 'Présent' || p.status === 'Retard').length}
                    color="orange"
                />
                <EquipeCard
                    title="Équipe Nuit"
                    horaire="22:00 - 06:00"
                    total={equipesStats.nuit.length}
                    presents={equipesStats.nuit.filter(p => p.status === 'Présent' || p.status === 'Retard').length}
                    color="indigo"
                />
                <EquipeCard
                    title="Journée"
                    horaire="08:00 - 17:00"
                    total={equipesStats.journee.length}
                    presents={equipesStats.journee.filter(p => p.status === 'Présent' || p.status === 'Retard').length}
                    color="teal"
                />
            </div>

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 rounded-lg bg-[#f5f5f3] p-1 dark:bg-[#1C1C1A]">
                <button
                    onClick={() => setActiveTab('aujourdhui')}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'aujourdhui' ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]' : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'}`}
                >
                    Aujourd'hui
                </button>
                <button
                    onClick={() => setActiveTab('planning')}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'planning' ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]' : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'}`}
                >
                    Planning semaine
                </button>
                <button
                    onClick={() => setActiveTab('conges')}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'conges' ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]' : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'}`}
                >
                    Congés & Absences
                </button>
                <button
                    onClick={() => setActiveTab('statistiques')}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'statistiques' ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]' : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]'}`}
                >
                    Statistiques
                </button>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="relative flex-1 sm:max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#706f6c] dark:text-[#A1A09A]" />
                        <input
                            type="text"
                            placeholder="Rechercher un agent..."
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1b1b18] placeholder-[#706f6c] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:placeholder-[#A1A09A]"
                        />
                    </div>
                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous les services</option>
                        {services.map((service) => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                    <select
                        value={selectedEquipe}
                        onChange={(e) => setSelectedEquipe(e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Toutes les équipes</option>
                        <option value="Matin">Équipe Matin</option>
                        <option value="Après-midi">Équipe Après-midi</option>
                        <option value="Nuit">Équipe Nuit</option>
                        <option value="Journée">Journée</option>
                    </select>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPointage(true)}
                        className="flex items-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b18] transition-colors hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <FingerprintIcon className="h-5 w-5" />
                        Pointage
                    </button>
                    <button
                        onClick={() => setShowDemandeConge(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Demande de congé
                    </button>
                </div>
            </div>

            {/* Modal Pointage */}
            {showPointage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                        <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Pointage</h2>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Enregistrer une arrivée ou un départ</p>
                            </div>
                            <button onClick={() => setShowPointage(false)} className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f5f3] dark:bg-[#1C1C1A]">
                                    <FingerprintIcon className="h-10 w-10 text-[#f53003] dark:text-[#FF4433]" />
                                </div>
                                <p className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Agent</label>
                                <select className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                                    <option value="">Sélectionner un agent...</option>
                                    {personnelList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.matricule} - {p.prenom} {p.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center gap-2 rounded-lg border-2 border-green-500 bg-green-50 p-4 transition-colors hover:bg-green-100 dark:border-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                                    <ArrowDownIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    <span className="font-medium text-green-700 dark:text-green-400">Arrivée</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 rounded-lg border-2 border-red-500 bg-red-50 p-4 transition-colors hover:bg-red-100 dark:border-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30">
                                    <ArrowUpIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    <span className="font-medium text-red-700 dark:text-red-400">Départ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Demande Congé */}
            {showDemandeConge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Demande de congé</h2>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Soumettre une demande d'absence</p>
                            </div>
                            <button onClick={() => setShowDemandeConge(false)} className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Agent *</label>
                                <select className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                                    <option value="">Sélectionner...</option>
                                    {personnelList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.prenom} {p.nom} - {p.service}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Type de congé *</label>
                                <select className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                                    <option value="">Sélectionner...</option>
                                    <option value="annuel">Congé annuel</option>
                                    <option value="maladie">Congé maladie</option>
                                    <option value="maternite">Congé maternité</option>
                                    <option value="formation">Formation</option>
                                    <option value="recuperation">Récupération</option>
                                    <option value="exceptionnel">Congé exceptionnel</option>
                                </select>
                            </div>
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Date début *</label>
                                    <input type="date" className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Date fin *</label>
                                    <input type="date" className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Motif *</label>
                                <textarea rows={3} placeholder="Décrivez le motif de votre demande..." className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]" />
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Pièce jointe</label>
                                <div className="rounded-lg border-2 border-dashed border-[#e3e3e0] p-4 text-center dark:border-[#3E3E3A]">
                                    <UploadIcon className="mx-auto h-8 w-8 text-[#706f6c] dark:text-[#A1A09A]" />
                                    <p className="mt-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">Glissez un fichier ou cliquez pour sélectionner</p>
                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Certificat médical, convocation...</p>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#e3e3e0] bg-[#fafaf9] px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                            <button onClick={() => setShowDemandeConge(false)} className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b18] transition-colors hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                                Annuler
                            </button>
                            <button className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] dark:bg-[#FF4433]">
                                <CheckIcon className="h-4 w-4" />
                                Soumettre
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenu selon l'onglet */}
            {activeTab === 'aujourdhui' && (
                <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#e3e3e0] bg-[#fafaf9] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Agent</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Fonction</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Équipe</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Horaires</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Arrivée</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Statut</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                                {filteredPresences.map((presence) => (
                                    <tr key={presence.id} className="transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#1C1C1A]">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${presence.personnel.sexe === 'M' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                                    {presence.personnel.prenom[0]}{presence.personnel.nom[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{presence.personnel.prenom} {presence.personnel.nom}</p>
                                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{presence.personnel.matricule}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <FonctionBadge fonction={presence.personnel.fonction} />
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                            {presence.personnel.service}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4">
                                            <EquipeBadge equipe={presence.equipe} />
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            {presence.heureDebut} - {presence.heureFin}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4">
                                            {presence.heureArrivee ? (
                                                <span className={`text-sm font-medium ${presence.status === 'Retard' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    {presence.heureArrivee}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">-</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4">
                                            <StatusBadge status={presence.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]" title="Voir profil">
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]" title="Modifier">
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                                <button className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]" title="Appeler">
                                                    <PhoneIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'conges' && (
                <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="border-b border-[#e3e3e0] bg-[#fafaf9] px-4 py-3 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                        <h3 className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Demandes de congés</h3>
                    </div>
                    <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                        {conges.map((conge) => (
                            <div key={conge.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${conge.personnel.sexe === 'M' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                        {conge.personnel.prenom[0]}{conge.personnel.nom[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{conge.personnel.prenom} {conge.personnel.nom}</p>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{conge.personnel.service}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{conge.type}</p>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{conge.dateDebut} → {conge.dateFin}</p>
                                    </div>
                                    <CongeStatusBadge status={conge.status} />
                                    {conge.status === 'En attente' && (
                                        <div className="flex items-center gap-2">
                                            <button className="rounded-lg bg-green-100 p-2 text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                            <button className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                                                <XIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'planning' && (
                <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Planning de la semaine</h3>
                        <div className="flex items-center gap-2">
                            <button className="rounded-lg border border-[#e3e3e0] p-2 dark:border-[#3E3E3A]">
                                <ChevronLeftIcon className="h-4 w-4 text-[#706f6c]" />
                            </button>
                            <span className="px-3 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">20 - 26 Janvier 2025</span>
                            <button className="rounded-lg border border-[#e3e3e0] p-2 dark:border-[#3E3E3A]">
                                <ChevronRightIcon className="h-4 w-4 text-[#706f6c]" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="w-48 border-b border-r border-[#e3e3e0] bg-[#fafaf9] px-4 py-3 text-left text-sm font-medium text-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#A1A09A]">Agent</th>
                                    {['Lun 20', 'Mar 21', 'Mer 22', 'Jeu 23', 'Ven 24', 'Sam 25', 'Dim 26'].map((jour) => (
                                        <th key={jour} className="border-b border-r border-[#e3e3e0] bg-[#fafaf9] px-2 py-3 text-center text-sm font-medium text-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#A1A09A]">{jour}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {personnelList.slice(0, 10).map((p) => (
                                    <tr key={p.id}>
                                        <td className="border-b border-r border-[#e3e3e0] px-4 py-2 dark:border-[#3E3E3A]">
                                            <div className="flex items-center gap-2">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${p.sexe === 'M' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                                    {p.prenom[0]}{p.nom[0]}
                                                </div>
                                                <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{p.prenom} {p.nom[0]}.</span>
                                            </div>
                                        </td>
                                        {[0, 1, 2, 3, 4, 5, 6].map((_, i) => {
                                            const shifts = ['M', 'M', 'A', 'A', 'N', 'R', 'R'];
                                            const shift = shifts[(p.id + i) % 7];
                                            const colors: Record<string, string> = {
                                                'M': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                                'A': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                                'N': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
                                                'R': 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400',
                                            };
                                            return (
                                                <td key={i} className="border-b border-r border-[#e3e3e0] p-1 text-center dark:border-[#3E3E3A]">
                                                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded text-xs font-medium ${colors[shift]}`}>
                                                        {shift}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-amber-100 text-xs font-medium text-amber-700">M</span>
                            <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Matin</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-orange-100 text-xs font-medium text-orange-700">A</span>
                            <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Après-midi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-xs font-medium text-indigo-700">N</span>
                            <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Nuit</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500">R</span>
                            <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Repos</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'statistiques' && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h3 className="mb-4 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Taux de présence par service</h3>
                        <div className="space-y-3">
                            {services.slice(0, 8).map((service, i) => {
                                const taux = 85 + Math.random() * 15;
                                return (
                                    <div key={service}>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{service}</span>
                                            <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{taux.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                            <div className={`h-full rounded-full ${taux >= 95 ? 'bg-green-500' : taux >= 85 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${taux}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h3 className="mb-4 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Absences ce mois</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#1C1C1A]">
                                <p className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">12</p>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Congés annuels</p>
                            </div>
                            <div className="rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#1C1C1A]">
                                <p className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">5</p>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Arrêts maladie</p>
                            </div>
                            <div className="rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#1C1C1A]">
                                <p className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">3</p>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Formations</p>
                            </div>
                            <div className="rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#1C1C1A]">
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">2</p>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Absences injustifiées</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// Composants auxiliaires
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        gray: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return (
        <div className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>{icon}</div>
                <div>
                    <p className="text-2xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{value}</p>
                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{title}</p>
                </div>
            </div>
        </div>
    );
}

function EquipeCard({ title, horaire, total, presents, color }: { title: string; horaire: string; total: number; presents: number; color: 'amber' | 'orange' | 'indigo' | 'teal' }) {
    const colors = {
        amber: 'border-l-amber-500',
        orange: 'border-l-orange-500',
        indigo: 'border-l-indigo-500',
        teal: 'border-l-teal-500',
    };
    return (
        <div className={`rounded-xl border border-[#e3e3e0] border-l-4 ${colors[color]} bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{title}</p>
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{horaire}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{presents}/{total}</p>
                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">présents</p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Planifié': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        'Présent': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Retard': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Absent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'Congé': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Maladie': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Terminé': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles['Planifié']}`}>{status}</span>;
}

function FonctionBadge({ fonction }: { fonction: string }) {
    const styles: Record<string, string> = {
        'Médecin': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Infirmier': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Sage-femme': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        'Technicien': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Pharmacien': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        'Aide-soignant': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Administratif': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[fonction] || styles['Administratif']}`}>{fonction}</span>;
}

function EquipeBadge({ equipe }: { equipe: string }) {
    const styles: Record<string, string> = {
        'Matin': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Après-midi': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Nuit': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        'Journée': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[equipe] || styles['Journée']}`}>{equipe}</span>;
}

function CongeStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'En attente': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Approuvé': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Refusé': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles['En attente']}`}>{status}</span>;
}

// Icônes
function SearchIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function PlusIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function UsersIcon() {
    return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function CheckCircleIcon() {
    return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function ClockAlertIcon() {
    return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function XCircleIcon() {
    return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function CalendarOffIcon() {
    return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M9 14L15 20M15 14L9 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function ClockIcon() {
    return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function FingerprintIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M17 17V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M7 14V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}
function CloseIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function CheckIcon({ className }: { className?: string }) {
    return (<svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function XIcon({ className }: { className?: string }) {
    return (<svg className={className || "h-4 w-4"} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function ArrowDownIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function ArrowUpIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function EyeIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>);
}
function EditIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function PhoneIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12787 3.62476 2.2165 3.36162C2.30513 3.09849 2.44756 2.85669 2.63476 2.65163C2.82196 2.44656 3.0498 2.28271 3.30379 2.17053C3.55777 2.05834 3.83233 2.00027 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4136 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function UploadIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 3V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function ChevronLeftIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function ChevronRightIcon({ className }: { className?: string }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}