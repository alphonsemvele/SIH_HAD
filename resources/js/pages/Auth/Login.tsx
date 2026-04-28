import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [copiedEmail, setCopiedEmail]   = useState(false);
    const [copiedPass,  setCopiedPass]    = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    const copyText = (text: string, which: 'email' | 'pass') => {
        navigator.clipboard.writeText(text);
        if (which === 'email') { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 1800); }
        else                   { setCopiedPass(true);  setTimeout(() => setCopiedPass(false),  1800); }
    };

    const fillDemo = () => {
        setData({ email: 'client@test.com', password: 'password', remember: false });
    };

    return (
        <>
            <Head title="Connexion — MedCare" />

            {/* ── Fond plein écran ──────────────────────────────── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
                <img
                    src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1800&auto=format&fit=crop&q=80"
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Overlay dégradé */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,5,3,0.75) 0%, rgba(245,48,3,0.25) 100%)' }}/>
            </div>

            {/* ── Layout principal ──────────────────────────────── */}
            <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', fontFamily: "'Georgia','Times New Roman',serif" }}>

                {/* ── Colonne gauche — Branding ─────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 60px', maxWidth: 560 }} className="hidden lg:flex">
                    {/* Logo */}
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(245,48,3,0.4)' }}>
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>MedCare</span>
                    </Link>

                    {/* Texte central */}
                    <div>
                       
                        <h1 style={{ fontSize: 'clamp(36px,4vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
                            La plateforme de santé<br/>
                            <span style={{ background: 'linear-gradient(135deg,#f53003,#ff8c6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pensée pour vous</span>
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontFamily: 'system-ui,sans-serif', maxWidth: 380 }}>
                            Gérez vos dossiers patients, tournées HAD, prescriptions et bien plus depuis une seule plateforme sécurisée.
                        </p>

                        {/* Petites stats */}
                        <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
                            {[['500+','Hôpitaux'],['50K+','Soignants'],['99.9%','Uptime']].map(([v, l]) => (
                                <div key={l}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>{v}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'system-ui,sans-serif', marginTop: 4 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Témoignage en bas */}
                    <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '24px 28px', backdropFilter: 'blur(16px)' }}>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontStyle: 'italic', fontFamily: 'system-ui,sans-serif', marginBottom: 16 }}>
                            "MedCare a transformé notre façon de travailler. La gestion des tournées HAD est devenue simple et efficace pour toute l'équipe."
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'system-ui,sans-serif' }}>MK</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'system-ui,sans-serif' }}>Dr. Marie Kouam</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'system-ui,sans-serif' }}>Directrice Médicale, CHU Douala</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Colonne droite — Formulaire ───────────────── */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                    <div style={{ width: '100%', maxWidth: 440 }}>

                        {/* Logo mobile uniquement */}
                        <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 40 }}>
                            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                </div>
                                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>MedCare</span>
                            </Link>
                        </div>

                        {/* Carte formulaire — glassmorphism */}
                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 28, padding: '44px 40px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)' }}>

                            {/* En-tête carte */}
                            <div style={{ marginBottom: 32 }}>
                                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a18', letterSpacing: '-0.5px', marginBottom: 6 }}>Bienvenue</h2>
                                <p style={{ fontSize: 14, color: '#706f6c', fontFamily: 'system-ui,sans-serif', lineHeight: 1.5 }}>Connectez-vous pour accéder à votre espace</p>
                            </div>

                            {status && (
                                <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13, color: '#15803d', fontFamily: 'system-ui,sans-serif' }}>
                                    {status}
                                </div>
                            )}

                            {/* Bouton remplissage auto démo */}
                            <button onClick={fillDemo} style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px dashed #ffd0c8', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28, transition: 'all 0.2s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#f53003'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#ffd0c8'}>
                                <svg className="h-4 w-4" style={{ color: '#f53003' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#f53003', fontFamily: 'system-ui,sans-serif' }}>Remplir avec les identifiants de démo</span>
                            </button>

                            {/* Séparateur */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}/>
                                <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', whiteSpace: 'nowrap' }}>ou entrez vos identifiants</span>
                                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}/>
                            </div>

                            <form onSubmit={submit}>
                                {/* Email */}
                                <div style={{ marginBottom: 18 }}>
                                    <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif', marginBottom: 8 }}>
                                        Adresse email
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                                            <svg className="h-4 w-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                                        </div>
                                        <input
                                            id="email" type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="votre@email.com"
                                            autoFocus
                                            style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${errors.email ? '#f87171' : '#e5e7eb'}`, background: errors.email ? '#fff5f5' : '#fafaf9', padding: '13px 16px 13px 40px', fontSize: 14, color: '#1a1a18', fontFamily: 'system-ui,sans-serif', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                            onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,48,3,0.08)'; }}
                                            onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#f87171' : '#e5e7eb'; e.currentTarget.style.background = errors.email ? '#fff5f5' : '#fafaf9'; e.currentTarget.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    {errors.email && <p style={{ marginTop: 6, fontSize: 12, color: '#ef4444', fontFamily: 'system-ui,sans-serif' }}>{errors.email}</p>}
                                </div>

                                {/* Mot de passe */}
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif' }}>
                                            Mot de passe
                                        </label>
                                        <a href="#" style={{ fontSize: 12, color: '#f53003', textDecoration: 'none', fontFamily: 'system-ui,sans-serif', fontWeight: 500 }}>
                                            Mot de passe oublié ?
                                        </a>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                                            <svg className="h-4 w-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                            style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${errors.password ? '#f87171' : '#e5e7eb'}`, background: errors.password ? '#fff5f5' : '#fafaf9', padding: '13px 44px 13px 40px', fontSize: 14, color: '#1a1a18', fontFamily: 'system-ui,sans-serif', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                            onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,48,3,0.08)'; }}
                                            onBlur={e => { e.currentTarget.style.borderColor = errors.password ? '#f87171' : '#e5e7eb'; e.currentTarget.style.background = errors.password ? '#fff5f5' : '#fafaf9'; e.currentTarget.style.boxShadow = 'none'; }}
                                        />
                                        {/* Toggle visibilité */}
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                            {showPassword
                                                ? <svg className="h-4 w-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                                                : <svg className="h-4 w-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            }
                                        </button>
                                    </div>
                                    {errors.password && <p style={{ marginTop: 6, fontSize: 12, color: '#ef4444', fontFamily: 'system-ui,sans-serif' }}>{errors.password}</p>}
                                </div>

                                {/* Se souvenir */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <div style={{ position: 'relative', width: 18, height: 18 }}>
                                            <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)} style={{ width: 18, height: 18, borderRadius: 5, cursor: 'pointer', accentColor: '#f53003' }}/>
                                        </div>
                                        <span style={{ fontSize: 13, color: '#706f6c', fontFamily: 'system-ui,sans-serif' }}>Se souvenir de moi</span>
                                    </label>
                                </div>

                                {/* Bouton connexion */}
                                <button type="submit" disabled={processing} style={{ width: '100%', padding: '15px', borderRadius: 100, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'system-ui,sans-serif', background: processing ? '#ccc' : 'linear-gradient(135deg,#f53003,#e02a00)', boxShadow: processing ? 'none' : '0 8px 24px rgba(245,48,3,0.35)', transition: 'all 0.2s', letterSpacing: '0.01em' }}
                                    onMouseEnter={e => { if (!processing) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                                    {processing ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            Connexion en cours…
                                        </span>
                                    ) : 'Se connecter'}
                                </button>
                            </form>

                            {/* Identifiants démo rapides */}
                            <div style={{ marginTop: 28, borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                <div style={{ padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <svg className="h-3.5 w-3.5" style={{ color: '#f53003' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: 'system-ui,sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Compte de démonstration</span>
                                </div>
                                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[{ label: 'Email', value: 'client@test.com', type: 'email' as const }, { label: 'Mot de passe', value: 'password', type: 'pass' as const }].map(item => (
                                        <div key={item.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', minWidth: 80 }}>{item.label}</span>
                                                <code style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#1a1a18' }}>{item.value}</code>
                                            </div>
                                            <button onClick={() => copyText(item.value, item.type)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: (item.type === 'email' ? copiedEmail : copiedPass) ? '#f0fdf4' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                                                {(item.type === 'email' ? copiedEmail : copiedPass)
                                                    ? <svg className="h-3.5 w-3.5" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                                                    : <svg className="h-3.5 w-3.5" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                                }
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Retour accueil */}
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'system-ui,sans-serif', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}>
                                ← Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                * { box-sizing: border-box; }
                @media (max-width: 1024px) {
                    .hidden.lg\\:flex { display: none !important; }
                }
            `}</style>
        </>
    );
}