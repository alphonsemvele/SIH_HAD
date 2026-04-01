import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

// Modal telechargement APK avec verification de code
function DownloadModal({ onClose }: { onClose: () => void }) {
    const [code, setCode]           = useState('');
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState(false);
    const [loading, setLoading]     = useState(false);
    const [attempts, setAttempts]   = useState(0);

    const CODE_SECRET = 'MEDCARE2025'; // code à changer selon vos besoins

    const handleVerify = async () => {
        if (!code.trim()) {
            setError('Veuillez saisir un code.');
            return;
        }

        setLoading(true);
        setError('');

        // Simulation d'un délai pour l'UX
        await new Promise(r => setTimeout(r, 800));

        if (code.trim().toUpperCase() === CODE_SECRET) {
            setSuccess(true);
            setLoading(false);
            // Déclencher le téléchargement
            const link = document.createElement('a');
            link.href = '/downloads/medcare.apk';
            link.download = 'MedCare.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setLoading(false);
            if (newAttempts >= 3) {
                setError('Trop de tentatives incorrectes. Contactez votre administrateur.');
            } else {
                setError(`Code incorrect. ${3 - newAttempts} tentative(s) restante(s).`);
            }
            setCode('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleVerify();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-[#1C1C1A]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f53003]/10 dark:bg-[#FF4433]/10">
                            <svg className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Télécharger MedCare APK</h3>
                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Application Android HAD</p>
                        </div>
                    </div>
                    {!success && (
                        <button onClick={onClose} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {!success ? (
                        <>
                            {/* Info */}
                            <div className="mb-6 rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#0F0F0E]">
                                <div className="flex gap-3">
                                    <svg className="h-5 w-5 text-[#706f6c] dark:text-[#A1A09A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Accès réservé aux établissements partenaires</p>
                                        <p className="mt-1 text-xs text-[#706f6c] dark:text-[#A1A09A]">Saisissez le code fourni par votre administrateur pour accéder au téléchargement.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Input code */}
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Code d'accès
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ex: XXXXXX0000"
                                    maxLength={20}
                                    disabled={attempts >= 3 || loading}
                                    className={`w-full rounded-lg border px-4 py-3 text-center text-lg font-mono font-bold tracking-widest transition-colors focus:outline-none focus:ring-2 dark:bg-[#0F0F0E] dark:text-[#EDEDEC]
                                        ${error ? 'border-red-400 bg-red-50 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/10' : 'border-[#e3e3e0] bg-white focus:border-[#f53003] focus:ring-[#f53003]/20 dark:border-[#3E3E3A]'}
                                        ${attempts >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    autoFocus
                                />
                                {error && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Bouton */}
                            <button
                                onClick={handleVerify}
                                disabled={loading || attempts >= 3 || !code.trim()}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f53003] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#d42a03] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#FF4433]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Vérification...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Valider et télécharger
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-center text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                Vous n'avez pas de code ?{' '}
                                <a href="mailto:support@medcare.com" className="text-[#f53003] hover:underline dark:text-[#FF4433]">
                                    Contacter le support
                                </a>
                            </p>
                        </>
                    ) : (
                        /* Succès */
                        <div className="text-center py-4">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Téléchargement lancé !</h4>
                            <p className="mt-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Le fichier <span className="font-mono font-medium text-[#1b1b18] dark:text-[#EDEDEC]">MedCare.apk</span> est en cours de téléchargement.
                            </p>
                            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20">
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">Instructions d'installation :</p>
                                <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                                    <li>Activez "Sources inconnues" dans vos paramètres Android</li>
                                    <li>Ouvrez le fichier APK téléchargé</li>
                                    <li>Suivez les instructions d'installation</li>
                                    <li>Connectez-vous avec vos identifiants MedCare</li>
                                </ol>
                            </div>
                            <button onClick={onClose} className="mt-6 w-full rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#3E3E3A]">
                                Fermer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Welcome() {
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    return (
        <>
            <Head title="Accueil - Système Hospitalier" />
            {showDownloadModal && <DownloadModal onClose={() => setShowDownloadModal(false)} />}

            <div className="min-h-screen bg-gradient-to-br from-[#FDFDFC] to-[#F5F5F3] dark:from-[#1C1C1A] dark:to-[#0F0F0E]">
                {/* Navigation */}
                <nav className="border-b border-[#e3e3e0] bg-white/80 backdrop-blur-sm dark:border-[#3E3E3A] dark:bg-[#1C1C1A]/80 sticky top-0 z-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#f53003] to-[#ff6b4a]">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">MedCare</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <a href="#features" className="hidden md:block text-sm font-medium text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433] transition-colors">Fonctionnalités</a>
                                <a href="#mobile-app" className="hidden md:block text-sm font-medium text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433] transition-colors">App Mobile</a>
                                <a href="#demo" className="hidden md:block text-sm font-medium text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433] transition-colors">Démo</a>
                                <a href="#testimonials" className="hidden md:block text-sm font-medium text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433] transition-colors">Témoignages</a>
                                <a href="#pricing" className="hidden md:block text-sm font-medium text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433] transition-colors">Tarifs</a>
                                <Link href="/login" className="rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#e02a00] hover:shadow-lg dark:bg-[#FF4433] dark:hover:bg-[#ff3322]">
                                    Se connecter
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                            <div className="flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#f53003]/10 px-4 py-2 text-sm font-medium text-[#f53003] dark:bg-[#FF4433]/10 dark:text-[#FF4433] w-fit mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f53003] opacity-75 dark:bg-[#FF4433]"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f53003] dark:bg-[#FF4433]"></span>
                                    </span>
                                    Nouveau : Module HAD Mobile
                                </div>
                                <h1 className="text-5xl font-bold leading-tight text-[#1b1b18] dark:text-[#EDEDEC] sm:text-6xl">
                                    Gestion hospitalière{' '}
                                    <span className="text-[#f53003] dark:text-[#FF4433]">moderne et sécurisée</span>
                                </h1>
                                <p className="mt-6 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                    Une plateforme complète pour optimiser la gestion de votre établissement de santé.
                                    Simplifiez vos processus et améliorez la qualité des soins.
                                </p>
                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Link href="/login" className="rounded-lg bg-[#f53003] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#e02a00] hover:shadow-xl dark:bg-[#FF4433] dark:hover:bg-[#ff3322]">
                                        Commencer maintenant
                                    </Link>
                                    <a href="#demo" className="rounded-lg border-2 border-[#e3e3e0] bg-white px-8 py-4 text-base font-medium text-[#1b1b18] transition-all hover:border-[#f53003] hover:text-[#f53003] dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC] dark:hover:border-[#FF4433] dark:hover:text-[#FF4433]">
                                        Tester la démo
                                    </a>
                                </div>
                                <div className="mt-12 grid grid-cols-3 gap-6">
                                    <div><div className="text-3xl font-bold text-[#f53003] dark:text-[#FF4433]">500+</div><div className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Hôpitaux</div></div>
                                    <div><div className="text-3xl font-bold text-[#f53003] dark:text-[#FF4433]">50K+</div><div className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Utilisateurs</div></div>
                                    <div><div className="text-3xl font-bold text-[#f53003] dark:text-[#FF4433]">99.9%</div><div className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Disponibilité</div></div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="overflow-hidden rounded-2xl shadow-2xl">
                                    <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&auto=format&fit=crop" alt="Médecins utilisant la technologie" className="h-full w-full object-cover" />
                                </div>
                                <div className="absolute -bottom-6 -right-6 -z-10 h-72 w-72 rounded-full bg-[#f53003]/10 blur-3xl dark:bg-[#FF4433]/10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <p className="text-center text-sm font-medium text-[#706f6c] dark:text-[#A1A09A] mb-8">ILS NOUS FONT CONFIANCE</p>
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 items-center justify-items-center opacity-50">
                            <div className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">CHU Douala</div>
                            <div className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Hôpital Central</div>
                            <div className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Clinique Moderne</div>
                            <div className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Centre Santé+</div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-white px-4 py-20 dark:bg-[#1C1C1A] sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] sm:text-4xl">Fonctionnalités principales</h2>
                            <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">Tout ce dont vous avez besoin pour gérer efficacement votre établissement</p>
                        </div>
                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop", title: "Gestion des patients", description: "Dossiers médicaux électroniques complets et sécurisés pour tous vos patients." },
                                { image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&auto=format&fit=crop", title: "Planification intelligente", description: "Optimisez les rendez-vous et la gestion du personnel en temps réel." },
                                { image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop", title: "Rapports & Analyses", description: "Tableaux de bord détaillés pour suivre les performances de votre établissement." },
                                { image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&auto=format&fit=crop", title: "Gestion pharmacie", description: "Suivi des stocks et prescriptions médicamenteuses automatisé." },
                                { image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&auto=format&fit=crop", title: "Facturation simplifiée", description: "Système de facturation intégré avec gestion des assurances." },
                                { image: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=400&auto=format&fit=crop", title: "Sécurité maximale", description: "Cryptage de bout en bout et conformité RGPD garantis." }
                            ].map((feature, index) => (
                                <div key={index} className="group overflow-hidden rounded-xl border border-[#e3e3e0] bg-[#FDFDFC] p-6 transition-all hover:shadow-xl dark:border-[#3E3E3A] dark:bg-[#0F0F0E]">
                                    <div className="mb-4 overflow-hidden rounded-lg">
                                        <img src={feature.image} alt={feature.title} className="h-48 w-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{feature.title}</h3>
                                    <p className="mt-2 text-[#706f6c] dark:text-[#A1A09A]">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════ */}
                {/* SECTION APP MOBILE — MODIFIEE avec bouton download  */}
                {/* ═══════════════════════════════════════════════════ */}
                <section id="mobile-app" className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f53003]/5 to-[#ff6b4a]/5 dark:from-[#FF4433]/5 dark:to-[#ff6655]/5">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#f53003] px-4 py-2 text-sm font-medium text-white mb-6">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Application Mobile HAD
                                </div>
                                <h2 className="text-4xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] sm:text-5xl">
                                    Suivez vos patients{' '}
                                    <span className="text-[#f53003] dark:text-[#FF4433]">sur le terrain</span>
                                </h2>
                                <p className="mt-6 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                    Module HAD (Hospitalisation À Domicile) : un outil performant pour la gestion
                                    mobile de vos patients. Accédez à tous les dossiers, suivez les soins en temps réel
                                    et synchronisez automatiquement avec votre système central.
                                </p>

                                <div className="mt-8 space-y-4">
                                    {[
                                        { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Accès hors ligne", description: "Consultez et modifiez les dossiers même sans connexion internet" },
                                        { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", title: "Synchronisation temps réel", description: "Mise à jour automatique des données dès la reconnexion" },
                                        { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", title: "Saisie intelligente", description: "Formulaires adaptatifs et reconnaissance vocale intégrée" },
                                        { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", title: "Géolocalisation", description: "Optimisez vos tournées avec le GPS intégré" }
                                    ].map((feature, index) => (
                                        <div key={index} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-[#1C1C1A] border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f53003]/10 dark:bg-[#FF4433]/10">
                                                    <svg className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{feature.title}</h3>
                                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Boutons téléchargement MODIFIES ── */}
                                <div className="mt-10 flex flex-wrap gap-4">
                                    <button className="flex items-center gap-3 rounded-lg bg-[#1b1b18] px-6 py-3 text-white transition-all hover:bg-[#2b2b28] dark:bg-white dark:text-[#1b1b18] dark:hover:bg-gray-100">
                                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                        </svg>
                                        <div className="text-left">
                                            <div className="text-xs">Télécharger sur</div>
                                            <div className="text-sm font-semibold">App Store</div>
                                        </div>
                                    </button>
                                    <button className="flex items-center gap-3 rounded-lg bg-[#1b1b18] px-6 py-3 text-white transition-all hover:bg-[#2b2b28] dark:bg-white dark:text-[#1b1b18] dark:hover:bg-gray-100">
                                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                                        </svg>
                                        <div className="text-left">
                                            <div className="text-xs">Disponible sur</div>
                                            <div className="text-sm font-semibold">Google Play</div>
                                        </div>
                                    </button>

                                    {/* ── NOUVEAU : bouton téléchargement APK direct ── */}
                                    <button
                                        onClick={() => setShowDownloadModal(true)}
                                        className="flex items-center gap-3 rounded-lg border-2 border-[#f53003] px-6 py-3 text-[#f53003] transition-all hover:bg-[#f53003] hover:text-white dark:border-[#FF4433] dark:text-[#FF4433] dark:hover:bg-[#FF4433] dark:hover:text-white group"
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <div className="text-left">
                                            <div className="text-xs opacity-75">Téléchargement direct</div>
                                            <div className="text-sm font-semibold">Fichier APK</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Note APK */}
                                <p className="mt-3 flex items-center gap-1.5 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Le téléchargement direct APK nécessite un code d'accès fourni par votre établissement.
                                </p>
                            </div>

                            {/* Mockup mobile */}
                            <div className="relative">
                                <div className="relative mx-auto w-[300px]">
                                    <div className="relative z-10 rounded-[3rem] border-[14px] border-[#1b1b18] dark:border-white bg-[#1b1b18] dark:bg-white shadow-2xl">
                                        <div className="overflow-hidden rounded-[2.3rem]">
                                            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop" alt="Application mobile HAD" className="w-full h-[600px] object-cover" />
                                        </div>
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-[#1b1b18] dark:bg-white rounded-b-2xl"></div>
                                    </div>
                                    <div className="absolute -left-8 top-20 rounded-lg bg-white dark:bg-[#1C1C1A] p-4 shadow-xl border border-[#e3e3e0] dark:border-[#3E3E3A] max-w-[150px] animate-float">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-xs font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Visite terminée</span>
                                        </div>
                                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Patient Martin B.</p>
                                    </div>
                                    <div className="absolute -right-8 bottom-32 rounded-lg bg-white dark:bg-[#1C1C1A] p-4 shadow-xl border border-[#e3e3e0] dark:border-[#3E3E3A] max-w-[150px] animate-float" style={{animationDelay: '1s'}}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-[#f53003] dark:bg-[#FF4433] flex items-center justify-center">
                                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <span className="text-xs font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Prochaine visite</span>
                                        </div>
                                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">14:30 - Dupont L.</p>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 -z-10 h-64 w-64 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20"></div>
                                    <div className="absolute -top-10 -left-10 -z-10 h-64 w-64 rounded-full bg-[#ff6b4a]/20 blur-3xl dark:bg-[#ff6655]/20"></div>
                                </div>
                            </div>
                        </div>

                        {/* Stats app */}
                        <div className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
                            {[
                                { value: '15K+', label: 'Téléchargements' },
                                { value: '4.9★', label: 'Note moyenne' },
                                { value: '200K+', label: 'Visites/mois' },
                                { value: '98%', label: 'Satisfaction' },
                            ].map((s, i) => (
                                <div key={i} className="text-center p-6 rounded-xl bg-white dark:bg-[#1C1C1A] border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                    <div className="text-3xl font-bold text-[#f53003] dark:text-[#FF4433]">{s.value}</div>
                                    <div className="mt-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Demo Section */}
                <section id="demo" className="bg-white px-4 py-20 dark:bg-[#1C1C1A] sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 mb-6">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Accès gratuit immédiat
                                </div>
                                <h2 className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] sm:text-4xl">
                                    Testez MedCare <span className="text-[#f53003] dark:text-[#FF4433]">gratuitement</span>
                                </h2>
                                <p className="mt-6 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                                    Découvrez toutes les fonctionnalités de notre plateforme avec un compte de démonstration.
                                </p>
                                <div className="mt-8 space-y-4">
                                    {["Accès complet à toutes les fonctionnalités","Données de test pré-remplies","Interface réelle de production","Aucune carte bancaire requise"].map((f, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <svg className="h-6 w-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            <span className="text-[#706f6c] dark:text-[#A1A09A]">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10">
                                    <Link href="login" className="inline-flex items-center gap-2 rounded-lg bg-[#f53003] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#e02a00] hover:shadow-xl dark:bg-[#FF4433]">
                                        Accéder à la démo
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="rounded-2xl border-2 border-[#e3e3e0] bg-gradient-to-br from-[#FDFDFC] to-white p-8 shadow-2xl dark:border-[#3E3E3A] dark:from-[#1C1C1A] dark:to-[#0F0F0E]">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f53003]/10 dark:bg-[#FF4433]/10">
                                                <svg className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">Identifiants de démo</h3>
                                        </div>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Utilisez ces identifiants pour vous connecter</p>
                                    </div>
                                    <div className="space-y-4">
                                        {[{ label: 'Email', value: 'client@test.com' }, { label: 'Mot de passe', value: 'password' }].map((item, i) => (
                                            <div key={i} className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#1C1C1A]">
                                                <div className="text-xs font-medium text-[#706f6c] dark:text-[#A1A09A] mb-2">{item.label}</div>
                                                <div className="flex items-center justify-between">
                                                    <code className="text-sm font-mono font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{item.value}</code>
                                                    <button onClick={() => navigator.clipboard.writeText(item.value)} className="rounded p-1.5 text-[#706f6c] hover:bg-[#e3e3e0] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]" title="Copier">
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex gap-3">
                                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-xs text-blue-800 dark:text-blue-300">Ces identifiants donnent accès à un environnement de test complet avec des données fictives.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 -z-10 h-48 w-48 rounded-full bg-[#f53003]/10 blur-3xl dark:bg-[#FF4433]/10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                            <div className="relative order-2 lg:order-1">
                                <div className="overflow-hidden rounded-2xl shadow-2xl">
                                    <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop" alt="Dashboard analytique" className="h-full w-full object-cover" />
                                </div>
                                <div className="absolute -top-6 -left-6 -z-10 h-72 w-72 rounded-full bg-[#f53003]/10 blur-3xl dark:bg-[#FF4433]/10"></div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] sm:text-4xl">Pourquoi choisir MedCare ?</h2>
                                <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">Une solution complète qui s'adapte à vos besoins</p>
                                <div className="mt-8 space-y-6">
                                    {[
                                        { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Rapide et performant", description: "Interface ultra-réactive pour une productivité maximale" },
                                        { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", title: "Sécurité renforcée", description: "Vos données protégées selon les standards les plus élevés" },
                                        { icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", title: "Support dédié", description: "Une équipe disponible 24/7 pour vous accompagner" },
                                        { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", title: "Mises à jour régulières", description: "Nouvelles fonctionnalités ajoutées en permanence" }
                                    ].map((b, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f53003]/10 dark:bg-[#FF4433]/10">
                                                    <svg className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.icon} /></svg>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{b.title}</h3>
                                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">{b.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="testimonials" className="bg-white px-4 py-20 dark:bg-[#1C1C1A] sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] sm:text-4xl">Ce que disent nos clients</h2>
                            <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">Des professionnels de santé satisfaits à travers le pays</p>
                        </div>
                        <div className="mt-16 grid gap-8 md:grid-cols-3">
                            {[
                                { name: "Dr. Marie Kouam", role: "Directrice Médicale, CHU Douala", content: "MedCare a transformé notre façon de travailler. La gestion des dossiers patients est devenue si simple et intuitive.", rating: 5 },
                                { name: "Jean-Paul Mbarga", role: "Administrateur, Clinique Moderne", content: "Un gain de temps considérable dans la gestion administrative. L'équipe support est exceptionnelle.", rating: 5 },
                                { name: "Dr. Sophie Nkongo", role: "Chef de Service, Hôpital Central", content: "La solution la plus complète du marché. Nous avons augmenté notre efficacité de 40% en 6 mois.", rating: 5 }
                            ].map((t, i) => (
                                <div key={i} className="rounded-xl border border-[#e3e3e0] bg-[#FDFDFC] p-8 dark:border-[#3E3E3A] dark:bg-[#0F0F0E]">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(t.rating)].map((_, j) => (
                                            <svg key={j} className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] italic">"{t.content}"</p>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#f53003] to-[#ff6b4a] flex items-center justify-center text-white font-bold">
                                            {t.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{t.name}</div>
                                            <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] sm:text-4xl">Tarifs transparents</h2>
                            <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">Choisissez le plan adapté à la taille de votre établissement</p>
                        </div>
                        <div className="mt-16 grid gap-8 lg:grid-cols-3">
                            {[
                                { name: "Starter", price: "49 000", period: "/mois", description: "Idéal pour les petites cliniques", features: ["Jusqu'à 50 patients","2 utilisateurs","Gestion basique","Support email","Mises à jour incluses"], popular: false },
                                { name: "Professional", price: "149 000", period: "/mois", description: "Pour les établissements en croissance", features: ["Patients illimités","10 utilisateurs","Toutes les fonctionnalités","App mobile HAD incluse","Support prioritaire 24/7","Formation incluse","API accès complet"], popular: true },
                                { name: "Enterprise", price: "Sur devis", period: "", description: "Solution sur mesure pour hôpitaux", features: ["Tout illimité","Utilisateurs illimités","Personnalisation complète","Account manager dédié","SLA garantie 99.9%","Déploiement sur site"], popular: false }
                            ].map((plan, i) => (
                                <div key={i} className={`relative rounded-2xl border p-8 ${plan.popular ? 'border-[#f53003] bg-white shadow-2xl dark:border-[#FF4433] dark:bg-[#1C1C1A] scale-105' : 'border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#1C1C1A]'}`}>
                                    {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="rounded-full bg-gradient-to-r from-[#f53003] to-[#ff6b4a] px-4 py-1 text-sm font-medium text-white">Le plus populaire</span></div>}
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{plan.name}</h3>
                                        <p className="mt-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">{plan.description}</p>
                                        <div className="mt-6"><span className="text-4xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{plan.price}</span>{plan.period && <span className="text-[#706f6c] dark:text-[#A1A09A]">{plan.period}</span>}</div>
                                    </div>
                                    <ul className="mt-8 space-y-4">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="flex items-center gap-3">
                                                <svg className="h-5 w-5 flex-shrink-0 text-[#f53003] dark:text-[#FF4433]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className={`mt-8 w-full rounded-lg px-6 py-3 text-sm font-medium transition-all ${plan.popular ? 'bg-[#f53003] text-white hover:bg-[#e02a00] dark:bg-[#FF4433]' : 'border-2 border-[#e3e3e0] bg-white text-[#1b1b18] hover:border-[#f53003] hover:text-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0F0F0E] dark:text-[#EDEDEC]'}`}>
                                        {plan.price === "Sur devis" ? "Nous contacter" : "Commencer l'essai gratuit"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="bg-white px-4 py-20 dark:bg-[#1C1C1A] sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] sm:text-4xl">Questions fréquentes</h2>
                            <p className="mt-4 text-lg text-[#706f6c] dark:text-[#A1A09A]">Tout ce que vous devez savoir sur MedCare</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { question: "Comment démarrer avec MedCare ?", answer: "Créez simplement un compte, choisissez votre plan et notre équipe vous accompagnera dans la configuration initiale. Une formation complète est incluse." },
                                { question: "L'application mobile HAD fonctionne-t-elle hors ligne ?", answer: "Oui, l'app mobile HAD permet de consulter et modifier les dossiers patients même sans connexion. Les données se synchronisent automatiquement dès que vous êtes reconnecté." },
                                { question: "Mes données sont-elles sécurisées ?", answer: "Absolument. Nous utilisons un cryptage de bout en bout, des serveurs sécurisés et sommes conformes aux normes RGPD et HIPAA." },
                                { question: "Puis-je essayer avant d'acheter ?", answer: "Oui, nous offrons un essai gratuit de 14 jours sans engagement ni carte bancaire requise." },
                                { question: "Le support technique est-il disponible en français ?", answer: "Oui, notre équipe support francophone est disponible 24/7 par chat, email et téléphone." },
                                { question: "Puis-je changer de plan plus tard ?", answer: "Bien sûr, vous pouvez upgrader ou downgrader votre plan à tout moment selon vos besoins." }
                            ].map((faq, i) => (
                                <details key={i} className="group rounded-lg border border-[#e3e3e0] bg-[#FDFDFC] dark:border-[#3E3E3A] dark:bg-[#0F0F0E]">
                                    <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {faq.question}
                                        <svg className="h-5 w-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </summary>
                                    <div className="px-6 pb-6 text-[#706f6c] dark:text-[#A1A09A]">{faq.answer}</div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#f53003] to-[#ff6b4a] p-12 text-center shadow-2xl dark:from-[#FF4433] dark:to-[#ff6655]">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold text-white sm:text-4xl">Prêt à transformer votre hôpital ?</h2>
                                <p className="mt-4 text-lg text-white/90">Rejoignez des centaines d'établissements qui nous font confiance</p>
                                <Link href="/login" className="mt-8 inline-block rounded-lg bg-white px-8 py-4 text-base font-medium text-[#f53003] transition-all hover:bg-gray-50 hover:shadow-xl dark:text-[#FF4433]">
                                    Accéder à la plateforme
                                </Link>
                            </div>
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-[#e3e3e0] bg-white px-4 py-12 dark:border-[#3E3E3A] dark:bg-[#1C1C1A] sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-8 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#f53003] to-[#ff6b4a]">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                    </div>
                                    <span className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">MedCare</span>
                                </div>
                                <p className="mt-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">La solution complète pour la gestion hospitalière moderne. Sécurisée, intuitive et performante.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Produit</h4>
                                <ul className="mt-4 space-y-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {[["#features","Fonctionnalités"],["#mobile-app","App Mobile HAD"],["#demo","Démo"],["#pricing","Tarifs"],["#","Sécurité"]].map(([href, label]) => (
                                        <li key={label}><a href={href} className="hover:text-[#f53003] dark:hover:text-[#FF4433]">{label}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Support</h4>
                                <ul className="mt-4 space-y-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {["Documentation","Contact","FAQ"].map(label => (
                                        <li key={label}><a href="#" className="hover:text-[#f53003] dark:hover:text-[#FF4433]">{label}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-12 border-t border-[#e3e3e0] pt-8 text-center text-sm text-[#706f6c] dark:border-[#3E3E3A] dark:text-[#A1A09A]">
                            <p>&copy; 2024 MedCare. Tous droits réservés.</p>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>
        </>
    );
}