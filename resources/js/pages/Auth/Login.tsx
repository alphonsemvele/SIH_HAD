import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Connexion" />

            <div className="min-h-screen flex bg-gradient-to-br from-[#FDFDFC] to-[#F5F5F3] dark:from-[#1C1C1A] dark:to-[#0F0F0E]">
                {/* Partie gauche - Formulaire */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#f53003] to-[#ff6b4a]">
                                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    MedCare
                                </span>
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-[#1C1C1A] rounded-2xl shadow-xl p-8 border border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <h2 className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-2">
                                Bienvenue
                            </h2>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] mb-8">
                                Connectez-vous pour accéder à votre espace
                            </p>

                            {status && (
                                <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit}>
                                {/* Email */}
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] mb-2">
                                        Adresse email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-2 focus:ring-[#f53003]/20 dark:border-[#3E3E3A] dark:bg-[#0F0F0E] dark:text-[#EDEDEC]"
                                        placeholder="votre@email.com"
                                        autoFocus
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                    )}
                                </div>

                                {/* Mot de passe */}
                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] mb-2">
                                        Mot de passe
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-2 focus:ring-[#f53003]/20 dark:border-[#3E3E3A] dark:bg-[#0F0F0E] dark:text-[#EDEDEC]"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember me */}
                                <div className="mb-6 flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-4 w-4 rounded border-[#e3e3e0] text-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]"
                                        />
                                        <span className="ml-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            Se souvenir de moi
                                        </span>
                                    </label>
                                    <a href="#" className="text-sm font-medium text-[#f53003] hover:text-[#e02a00] dark:text-[#FF4433] dark:hover:text-[#ff3322]">
                                        Mot de passe oublié ?
                                    </a>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-lg bg-[#f53003] px-4 py-3 text-base font-medium text-white transition-all hover:bg-[#e02a00] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#FF4433] dark:hover:bg-[#ff3322]"
                                >
                                    {processing ? 'Connexion...' : 'Se connecter'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Pas encore de compte ?{' '}
                                    <a href="#" className="font-medium text-[#f53003] hover:text-[#e02a00] dark:text-[#FF4433] dark:hover:text-[#ff3322]">
                                        Créer un compte
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link href="/" className="text-sm text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433]">
                                ← Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Partie droite - Identifiants démo */}
                <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-[#f53003] to-[#ff6b4a] dark:from-[#FF4433] dark:to-[#ff6655] p-12">
                    <div className="max-w-md w-full">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white mb-6">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Compte de démonstration
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">
                                Testez toutes les fonctionnalités
                            </h3>
                            <p className="text-white/90 text-lg">
                                Utilisez ces identifiants pour accéder à un environnement de test complet
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Carte Email */}
                            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-white/70 mb-1">Email</div>
                                            <code className="text-base font-mono font-semibold text-white">
                                                client@test.com
                                            </code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText('client@test.com')}
                                        className="rounded-lg p-2 text-white/80 hover:bg-white/20 transition-colors"
                                        title="Copier"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Carte Mot de passe */}
                            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-white/70 mb-1">Mot de passe</div>
                                            <code className="text-base font-mono font-semibold text-white">
                                                password
                                            </code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText('password')}
                                        className="rounded-lg p-2 text-white/80 hover:bg-white/20 transition-colors"
                                        title="Copier"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
                            <div className="flex gap-3">
                                <svg className="h-5 w-5 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-white font-medium mb-1">
                                        Environnement de test
                                    </p>
                                    <p className="text-xs text-white/80">
                                        Ces identifiants donnent accès à une version complète avec des données fictives. Explorez librement !
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center gap-3 text-white/90">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm">Accès immédiat sans inscription</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm">Toutes les fonctionnalités débloquées</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm">Données réinitialisées quotidiennement</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}