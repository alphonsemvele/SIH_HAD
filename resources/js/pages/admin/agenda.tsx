import AdminLayout from './layout';
import { useState } from 'react';

interface RendezVous {
    id: number;
    patient: { nom: string; prenom: string; telephone: string; avatar: string };
    medecin: string;
    service: string;
    type: 'consultation' | 'suivi' | 'examen' | 'chirurgie' | 'vaccination';
    date: string;
    heure: string;
    duree: number;
    statut: 'confirme' | 'en_attente' | 'annule' | 'termine' | 'absent';
    notes: string;
}

interface CreneauHoraire {
    heure: string;
    rdvs: RendezVous[];
}

export default function AdminAgenda() {
    const [currentDate, setCurrentDate] = useState(new Date('2026-01-23'));
    const [viewMode, setViewMode] = useState<'jour' | 'semaine' | 'mois'>('jour');
    const [filterService, setFilterService] = useState('');
    const [filterMedecin, setFilterMedecin] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);

    const rendezVous: RendezVous[] = [
        { id: 1, patient: { nom: 'Ateba', prenom: 'Georges', telephone: '+237 655 999 000', avatar: 'AG' }, medecin: 'Dr. Onana Michel', service: 'Cardiologie', type: 'suivi', date: '2026-01-23', heure: '08:00', duree: 30, statut: 'confirme', notes: 'Contrôle tension' },
        { id: 2, patient: { nom: 'Ngo', prenom: 'Hélène', telephone: '+237 677 000 111', avatar: 'NH' }, medecin: 'Dr. Bella Christiane', service: 'Gynécologie', type: 'consultation', date: '2026-01-23', heure: '08:30', duree: 45, statut: 'confirme', notes: 'Première consultation grossesse' },
        { id: 3, patient: { nom: 'Fouda', prenom: 'Martin', telephone: '+237 699 123 789', avatar: 'FM' }, medecin: 'Dr. Onana Michel', service: 'Cardiologie', type: 'examen', date: '2026-01-23', heure: '09:00', duree: 60, statut: 'en_attente', notes: 'ECG + Echo' },
        { id: 4, patient: { nom: 'Mbede', prenom: 'Pauline', telephone: '+237 677 456 123', avatar: 'MP' }, medecin: 'Dr. Tagne Robert', service: 'Pneumologie', type: 'consultation', date: '2026-01-23', heure: '09:00', duree: 30, statut: 'confirme', notes: 'Toux persistante' },
        { id: 5, patient: { nom: 'Eyene', prenom: 'Patrick', telephone: '+237 655 789 456', avatar: 'EP' }, medecin: 'Dr. Nguele Patrick', service: 'Neurologie', type: 'suivi', date: '2026-01-23', heure: '09:30', duree: 30, statut: 'confirme', notes: 'Contrôle migraines' },
        { id: 6, patient: { nom: 'Elong', prenom: 'Sylvie', telephone: '+237 699 321 654', avatar: 'ES' }, medecin: 'Dr. Bella Christiane', service: 'Gynécologie', type: 'examen', date: '2026-01-23', heure: '10:00', duree: 30, statut: 'confirme', notes: 'Échographie' },
        { id: 7, patient: { nom: 'Tchinda', prenom: 'Roger', telephone: '+237 677 654 987', avatar: 'TR' }, medecin: 'Dr. Onana Michel', service: 'Cardiologie', type: 'consultation', date: '2026-01-23', heure: '10:30', duree: 30, statut: 'annule', notes: 'Annulé par patient' },
        { id: 8, patient: { nom: 'Mvondo', prenom: 'Alice', telephone: '+237 655 147 258', avatar: 'MA' }, medecin: 'Dr. Tagne Robert', service: 'Pneumologie', type: 'suivi', date: '2026-01-23', heure: '10:30', duree: 30, statut: 'confirme', notes: 'Asthme - contrôle' },
        { id: 9, patient: { nom: 'Nkodo', prenom: 'Jean', telephone: '+237 699 258 369', avatar: 'NJ' }, medecin: 'Dr. Nguele Patrick', service: 'Neurologie', type: 'examen', date: '2026-01-23', heure: '11:00', duree: 45, statut: 'en_attente', notes: 'IRM cérébrale' },
        { id: 10, patient: { nom: 'Bella', prenom: 'Christine', telephone: '+237 677 369 147', avatar: 'BC' }, medecin: 'Dr. Bella Christiane', service: 'Gynécologie', type: 'consultation', date: '2026-01-23', heure: '11:00', duree: 30, statut: 'confirme', notes: 'Suivi post-partum' },
        { id: 11, patient: { nom: 'Onana', prenom: 'Fabrice', telephone: '+237 655 741 852', avatar: 'OF' }, medecin: 'Dr. Onana Michel', service: 'Cardiologie', type: 'consultation', date: '2026-01-23', heure: '11:30', duree: 30, statut: 'confirme', notes: 'Douleurs thoraciques' },
        { id: 12, patient: { nom: 'Essomba', prenom: 'Diane', telephone: '+237 699 852 963', avatar: 'ED' }, medecin: 'Dr. Tagne Robert', service: 'Pneumologie', type: 'consultation', date: '2026-01-23', heure: '11:30', duree: 30, statut: 'termine', notes: 'Bronchite' },
        { id: 13, patient: { nom: 'Ngah', prenom: 'Pierre', telephone: '+237 677 963 741', avatar: 'NP' }, medecin: 'Dr. Onana Michel', service: 'Cardiologie', type: 'suivi', date: '2026-01-23', heure: '14:00', duree: 30, statut: 'confirme', notes: 'Post-infarctus' },
        { id: 14, patient: { nom: 'Atangana', prenom: 'Marie', telephone: '+237 655 159 357', avatar: 'AM' }, medecin: 'Dr. Bella Christiane', service: 'Gynécologie', type: 'vaccination', date: '2026-01-23', heure: '14:00', duree: 15, statut: 'confirme', notes: 'Vaccin HPV' },
        { id: 15, patient: { nom: 'Tabi', prenom: 'Emmanuel', telephone: '+237 699 357 159', avatar: 'TE' }, medecin: 'Dr. Nguele Patrick', service: 'Neurologie', type: 'consultation', date: '2026-01-23', heure: '14:30', duree: 30, statut: 'confirme', notes: 'Vertiges' },
        { id: 16, patient: { nom: 'Mbassi', prenom: 'Jeanne', telephone: '+237 677 753 951', avatar: 'MJ' }, medecin: 'Dr. Tagne Robert', service: 'Pneumologie', type: 'examen', date: '2026-01-23', heure: '15:00', duree: 45, statut: 'en_attente', notes: 'Scanner thoracique' },
        { id: 17, patient: { nom: 'Fotso', prenom: 'Bernard', telephone: '+237 655 951 753', avatar: 'FB' }, medecin: 'Dr. Onana Michel', service: 'Cardiologie', type: 'chirurgie', date: '2026-01-23', heure: '15:00', duree: 120, statut: 'confirme', notes: 'Pose de stent' },
        { id: 18, patient: { nom: 'Ndam', prenom: 'Rose', telephone: '+237 699 654 321', avatar: 'NR' }, medecin: 'Dr. Bella Christiane', service: 'Gynécologie', type: 'suivi', date: '2026-01-23', heure: '16:00', duree: 30, statut: 'confirme', notes: 'Suivi FIV' },
    ];

    const medecins = ['Dr. Onana Michel', 'Dr. Bella Christiane', 'Dr. Tagne Robert', 'Dr. Nguele Patrick', 'Dr. Essomba Paul', 'Dr. Ngo Likeng Anne'];
    const services = ['Cardiologie', 'Gynécologie', 'Pneumologie', 'Neurologie', 'Pédiatrie', 'Chirurgie'];

    const filteredRdvs = rendezVous.filter(rdv => {
        const matchesService = !filterService || rdv.service === filterService;
        const matchesMedecin = !filterMedecin || rdv.medecin === filterMedecin;
        return matchesService && matchesMedecin;
    });

    const rdvsAujourdhui = filteredRdvs.filter(rdv => rdv.date === '2026-01-23');
    const confirmes = rdvsAujourdhui.filter(r => r.statut === 'confirme').length;
    const enAttente = rdvsAujourdhui.filter(r => r.statut === 'en_attente').length;
    const annules = rdvsAujourdhui.filter(r => r.statut === 'annule').length;
    const termines = rdvsAujourdhui.filter(r => r.statut === 'termine').length;

    // Créer les créneaux horaires
    const heures = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

    const getStatutConfig = (statut: string) => {
        const config = {
            confirme: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Confirmé' },
            en_attente: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'En attente' },
            annule: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Annulé' },
            termine: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Terminé' },
            absent: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Absent' },
        };
        return config[statut as keyof typeof config] || config.en_attente;
    };

    const getTypeConfig = (type: string) => {
        const config = {
            consultation: { bg: 'bg-violet-500/20', text: 'text-violet-400', icon: '🩺' },
            suivi: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '📋' },
            examen: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '🔬' },
            chirurgie: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '⚕️' },
            vaccination: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: '💉' },
        };
        return config[type as keyof typeof config] || config.consultation;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const navigateDate = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const getWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    };

    return (
        <AdminLayout title="Agenda" subtitle="Gestion des rendez-vous">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-white">{rdvsAujourdhui.length}</p>
                    <p className="text-sm text-[#71717A]">RDV aujourd'hui</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-emerald-400">{confirmes}</p>
                    <p className="text-sm text-[#71717A]">Confirmés</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-amber-400">{enAttente}</p>
                    <p className="text-sm text-[#71717A]">En attente</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-blue-400">{termines}</p>
                    <p className="text-sm text-[#71717A]">Terminés</p>
                </div>
                <div className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                    <p className="text-2xl font-bold text-red-400">{annules}</p>
                    <p className="text-sm text-[#71717A]">Annulés</p>
                </div>
            </div>

            {/* Navigation & Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigateDate(-1)} className="rounded-lg border border-[#1F1F28] bg-[#16161D] p-2 text-[#71717A] hover:text-white">
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <div className="min-w-[280px] text-center">
                            <p className="text-lg font-semibold capitalize text-white">{formatDate(currentDate)}</p>
                        </div>
                        <button onClick={() => navigateDate(1)} className="rounded-lg border border-[#1F1F28] bg-[#16161D] p-2 text-[#71717A] hover:text-white">
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <button onClick={() => setCurrentDate(new Date('2026-01-23'))} className="rounded-lg border border-[#1F1F28] bg-[#16161D] px-4 py-2 text-sm text-[#A1A1AA] hover:text-white">
                        Aujourd'hui
                    </button>

                    {/* View Mode */}
                    <div className="flex rounded-xl border border-[#1F1F28] bg-[#16161D]">
                        {['jour', 'semaine', 'mois'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`px-4 py-2 text-sm capitalize ${viewMode === mode ? 'bg-violet-500/20 text-violet-400' : 'text-[#71717A] hover:text-white'} ${mode === 'jour' ? 'rounded-l-xl' : mode === 'mois' ? 'rounded-r-xl' : ''}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none">
                        <option value="">Tous les services</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterMedecin} onChange={(e) => setFilterMedecin(e.target.value)} className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none">
                        <option value="">Tous les médecins</option>
                        {medecins.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button onClick={() => setShowModal(true)} className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
                        <PlusIcon className="h-4 w-4" />
                        Nouveau RDV
                    </button>
                </div>
            </div>

            {/* Vue Jour */}
            {viewMode === 'jour' && (
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] overflow-hidden">
                    <div className="grid grid-cols-[80px_1fr] divide-x divide-[#1F1F28]">
                        {/* Colonne heures */}
                        <div className="divide-y divide-[#1F1F28]">
                            <div className="h-12 border-b border-[#1F1F28] bg-[#0F0F12]" />
                            {heures.map((heure) => (
                                <div key={heure} className="flex h-20 items-start justify-end pr-3 pt-1">
                                    <span className="text-xs text-[#71717A]">{heure}</span>
                                </div>
                            ))}
                        </div>

                        {/* Colonne RDV */}
                        <div>
                            <div className="h-12 border-b border-[#1F1F28] bg-[#0F0F12] px-4 flex items-center">
                                <span className="text-sm font-medium text-white">Rendez-vous</span>
                            </div>
                            <div className="relative">
                                {heures.map((heure, index) => (
                                    <div key={heure} className="h-20 border-b border-[#1F1F28] px-2 py-1">
                                        <div className="flex flex-wrap gap-2">
                                            {rdvsAujourdhui.filter(rdv => rdv.heure === heure).map((rdv) => {
                                                const statutConfig = getStatutConfig(rdv.statut);
                                                const typeConfig = getTypeConfig(rdv.type);
                                                return (
                                                    <div
                                                        key={rdv.id}
                                                        onClick={() => setSelectedRdv(rdv)}
                                                        className={`cursor-pointer rounded-lg border p-2 transition-all hover:scale-[1.02] ${statutConfig.border} ${statutConfig.bg}`}
                                                        style={{ minWidth: '200px' }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span>{typeConfig.icon}</span>
                                                            <span className="text-sm font-medium text-white">{rdv.patient.prenom} {rdv.patient.nom}</span>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2 text-xs text-[#A1A1AA]">
                                                            <span>{rdv.medecin}</span>
                                                            <span>•</span>
                                                            <span>{rdv.duree} min</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vue Semaine */}
            {viewMode === 'semaine' && (
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] overflow-hidden">
                    <div className="grid grid-cols-8 divide-x divide-[#1F1F28]">
                        {/* Header */}
                        <div className="border-b border-[#1F1F28] bg-[#0F0F12] p-3">
                            <span className="text-xs text-[#71717A]">Heure</span>
                        </div>
                        {getWeekDays().map((day, i) => {
                            const isToday = day.toDateString() === new Date('2026-01-23').toDateString();
                            return (
                                <div key={i} className={`border-b border-[#1F1F28] p-3 text-center ${isToday ? 'bg-violet-500/10' : 'bg-[#0F0F12]'}`}>
                                    <p className="text-xs text-[#71717A] capitalize">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                                    <p className={`text-lg font-bold ${isToday ? 'text-violet-400' : 'text-white'}`}>{day.getDate()}</p>
                                </div>
                            );
                        })}

                        {/* Corps */}
                        {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((heure) => (
                            <>
                                <div key={`h-${heure}`} className="border-b border-[#1F1F28] p-2">
                                    <span className="text-xs text-[#71717A]">{heure}</span>
                                </div>
                                {getWeekDays().map((day, i) => {
                                    const dayRdvs = rendezVous.filter(r => r.heure.startsWith(heure.split(':')[0]) && r.date === day.toISOString().split('T')[0]);
                                    return (
                                        <div key={`${heure}-${i}`} className="border-b border-[#1F1F28] p-1 min-h-[60px]">
                                            {dayRdvs.slice(0, 2).map((rdv) => {
                                                const typeConfig = getTypeConfig(rdv.type);
                                                return (
                                                    <div key={rdv.id} className={`mb-1 rounded px-1.5 py-0.5 text-xs ${typeConfig.bg} ${typeConfig.text} truncate`}>
                                                        {rdv.patient.prenom[0]}. {rdv.patient.nom}
                                                    </div>
                                                );
                                            })}
                                            {dayRdvs.length > 2 && (
                                                <span className="text-xs text-[#52525B]">+{dayRdvs.length - 2}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>
            )}

            {/* Vue Mois */}
            {viewMode === 'mois' && (
                <div className="rounded-2xl border border-[#1F1F28] bg-[#16161D] overflow-hidden">
                    <div className="grid grid-cols-7 gap-px bg-[#1F1F28]">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour) => (
                            <div key={jour} className="bg-[#0F0F12] p-3 text-center">
                                <span className="text-xs font-medium text-[#71717A]">{jour}</span>
                            </div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const dayNum = i - 3 + 1; // Janvier 2026 commence un jeudi
                            const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
                            const isToday = dayNum === 23;
                            const dayRdvCount = isCurrentMonth ? Math.floor(Math.random() * 8) : 0;
                            return (
                                <div key={i} className={`min-h-[100px] bg-[#16161D] p-2 ${!isCurrentMonth ? 'opacity-30' : ''}`}>
                                    <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm ${isToday ? 'bg-violet-500 text-white' : 'text-[#A1A1AA]'}`}>
                                        {isCurrentMonth ? dayNum : dayNum <= 0 ? 31 + dayNum : dayNum - 31}
                                    </div>
                                    {isCurrentMonth && dayRdvCount > 0 && (
                                        <div className="space-y-1">
                                            {dayRdvCount >= 1 && <div className="h-1.5 rounded-full bg-violet-500/60" style={{ width: `${Math.min(dayRdvCount * 15, 100)}%` }} />}
                                            <span className="text-xs text-[#71717A]">{dayRdvCount} RDV</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Liste des RDV du jour */}
            <div className="mt-6 rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Liste des rendez-vous</h3>
                <div className="space-y-3">
                    {rdvsAujourdhui.map((rdv) => {
                        const statutConfig = getStatutConfig(rdv.statut);
                        const typeConfig = getTypeConfig(rdv.type);
                        return (
                            <div key={rdv.id} className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:bg-[#1F1F28]/50 ${statutConfig.border} ${rdv.statut === 'annule' ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{rdv.heure}</p>
                                        <p className="text-xs text-[#71717A]">{rdv.duree} min</p>
                                    </div>
                                    <div className="h-12 w-px bg-[#1F1F28]" />
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${typeConfig.bg}`}>
                                        {typeConfig.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{rdv.patient.prenom} {rdv.patient.nom}</p>
                                        <p className="text-sm text-[#71717A]">{rdv.medecin} • {rdv.service}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${statutConfig.bg} ${statutConfig.text}`}>
                                        {statutConfig.label}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedRdv(rdv)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Nouveau RDV */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Nouveau rendez-vous</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm text-[#A1A1AA]">Patient</label>
                                <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">
                                    <option>Sélectionner un patient</option>
                                    <option>Ateba Georges</option>
                                    <option>Ngo Hélène</option>
                                    <option>Fouda Martin</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm text-[#A1A1AA]">Date</label>
                                    <input type="date" className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm text-[#A1A1AA]">Heure</label>
                                    <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">
                                        {heures.map(h => <option key={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm text-[#A1A1AA]">Médecin</label>
                                    <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">
                                        {medecins.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm text-[#A1A1AA]">Type</label>
                                    <select className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none">
                                        <option value="consultation">Consultation</option>
                                        <option value="suivi">Suivi</option>
                                        <option value="examen">Examen</option>
                                        <option value="chirurgie">Chirurgie</option>
                                        <option value="vaccination">Vaccination</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-[#A1A1AA]">Notes</label>
                                <textarea rows={3} className="w-full rounded-xl border border-[#1F1F28] bg-[#0F0F12] px-4 py-3 text-white outline-none" placeholder="Notes pour le RDV..." />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA]">Annuler</button>
                            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white">Créer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Détails RDV */}
            {selectedRdv && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-[#1F1F28] bg-[#16161D] p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Détails du rendez-vous</h2>
                            <button onClick={() => setSelectedRdv(null)} className="rounded-lg p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-lg font-bold text-white">
                                {selectedRdv.patient.avatar}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white">{selectedRdv.patient.prenom} {selectedRdv.patient.nom}</p>
                                <p className="text-sm text-[#71717A]">{selectedRdv.patient.telephone}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Date & Heure</p>
                                <p className="font-medium text-white">{selectedRdv.date} à {selectedRdv.heure}</p>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Durée</p>
                                <p className="font-medium text-white">{selectedRdv.duree} minutes</p>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Médecin</p>
                                <p className="font-medium text-white">{selectedRdv.medecin}</p>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Service</p>
                                <p className="font-medium text-white">{selectedRdv.service}</p>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Type</p>
                                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-sm ${getTypeConfig(selectedRdv.type).bg} ${getTypeConfig(selectedRdv.type).text}`}>
                                    {getTypeConfig(selectedRdv.type).icon} {selectedRdv.type}
                                </span>
                            </div>
                            <div className="rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Statut</p>
                                <span className={`rounded-lg px-2.5 py-1 text-sm font-medium ${getStatutConfig(selectedRdv.statut).bg} ${getStatutConfig(selectedRdv.statut).text}`}>
                                    {getStatutConfig(selectedRdv.statut).label}
                                </span>
                            </div>
                        </div>

                        {selectedRdv.notes && (
                            <div className="mt-4 rounded-xl border border-[#1F1F28] bg-[#0F0F12] p-3">
                                <p className="text-xs text-[#71717A]">Notes</p>
                                <p className="text-sm text-white">{selectedRdv.notes}</p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-between">
                            <button className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20">
                                Annuler le RDV
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedRdv(null)} className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA]">Fermer</button>
                                <button className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white">Modifier</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

// Icons
function ChevronLeftIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>; }
function ChevronRightIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>; }
function PlusIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function EyeIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function EditIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function XIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }