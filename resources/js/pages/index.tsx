import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// ─── Modal APK ────────────────────────────────────────────────────────────────

function DownloadModal({ onClose }: { onClose: () => void }) {
    const [code, setCode]         = useState('');
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);
    const [loading, setLoading]   = useState(false);
    const [attempts, setAttempts] = useState(0);
    const CODE_SECRET = 'MEDCARE2025';

    const handleVerify = async () => {
        if (!code.trim()) { setError('Veuillez saisir un code.'); return; }
        setLoading(true); setError('');
        await new Promise(r => setTimeout(r, 800));
        if (code.trim().toUpperCase() === CODE_SECRET) {
            setSuccess(true); setLoading(false);
            const a = document.createElement('a');
            a.href = '/downloads/medcare.apk'; a.download = 'MedCare.apk';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } else {
            const n = attempts + 1; setAttempts(n); setLoading(false);
            setError(n >= 3 ? 'Trop de tentatives. Contactez votre administrateur.' : `Code incorrect. ${3 - n} tentative(s) restante(s).`);
            setCode('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,10,8,0.75)', backdropFilter: 'blur(14px)' }}>
            <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(255,255,255,0.9)' }}>
                <div className="px-8 pt-8 pb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f53003,#ff8c6a)' }}>
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a18' }}>Télécharger MedCare APK</h3>
                            </div>
                            <p style={{ fontSize: 13, color: '#706f6c', fontFamily: 'system-ui,sans-serif', marginLeft: 52 }}>Application Android HAD — accès partenaires</p>
                        </div>
                        {!success && <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #eee', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg className="h-4 w-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
                    </div>
                    {!success ? (
                        <>
                            <div style={{ background: '#fafaf9', borderRadius: 16, padding: '14px 18px', marginBottom: 24 }}>
                                <p style={{ fontSize: 13, color: '#706f6c', fontFamily: 'system-ui,sans-serif', lineHeight: 1.6 }}>Saisissez le code fourni par votre administrateur pour accéder au téléchargement sécurisé.</p>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif', marginBottom: 8 }}>Code d'accès</label>
                                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleVerify()}
                                    placeholder="XXXXXX0000" maxLength={20} disabled={attempts >= 3 || loading} autoFocus
                                    style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${error ? '#f87171' : '#e5e7eb'}`, background: error ? '#fff5f5' : '#fff', padding: '14px 20px', textAlign: 'center', fontSize: 20, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.15em', outline: 'none', transition: 'border 0.2s' }}/>
                                {error && <p style={{ marginTop: 8, fontSize: 12, color: '#ef4444', fontFamily: 'system-ui,sans-serif' }}>{error}</p>}
                            </div>
                            <button onClick={handleVerify} disabled={loading || attempts >= 3 || !code.trim()}
                                style={{ width: '100%', padding: '14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'system-ui,sans-serif', background: 'linear-gradient(135deg,#f53003,#e02a00)', boxShadow: '0 4px 20px rgba(245,48,3,0.3)', opacity: (!code.trim() || loading || attempts >= 3) ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                {loading ? 'Vérification…' : 'Valider et télécharger'}
                            </button>
                            <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#9ca3af', fontFamily: 'system-ui,sans-serif' }}>Pas de code ? <a href="mailto:support@medcare.com" style={{ color: '#f53003', textDecoration: 'none' }}>Contacter le support</a></p>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><svg className="h-8 w-8" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a18', marginBottom: 8 }}>Téléchargement lancé !</h4>
                            <p style={{ fontSize: 14, color: '#706f6c', fontFamily: 'system-ui,sans-serif', marginBottom: 20 }}>Le fichier <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a1a18' }}>MedCare.apk</code> est en cours de téléchargement.</p>
                            <div style={{ background: '#eff6ff', borderRadius: 14, padding: '16px 20px', textAlign: 'left', marginBottom: 24 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 8, fontFamily: 'system-ui,sans-serif' }}>Instructions :</p>
                                <ol style={{ fontSize: 12, color: '#2563eb', fontFamily: 'system-ui,sans-serif', paddingLeft: 16 }}>
                                    <li style={{ marginBottom: 4 }}>Activez "Sources inconnues" dans les paramètres</li>
                                    <li style={{ marginBottom: 4 }}>Ouvrez le fichier APK téléchargé</li>
                                    <li>Connectez-vous avec vos identifiants MedCare</li>
                                </ol>
                            </div>
                            <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 100, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif' }}>Fermer</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Welcome() {
    const [showModal, setShowModal] = useState(false);
    const [scrollY, setScrollY]    = useState(0);
    const [navBg, setNavBg]        = useState(false);
    const [faqOpen, setFaqOpen]    = useState<number | null>(null);

    useEffect(() => {
        const onScroll = () => { setScrollY(window.scrollY); setNavBg(window.scrollY > 60); };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="MedCare — Gestion hospitalière moderne" />
            {showModal && <DownloadModal onClose={() => setShowModal(false)} />}

            <div style={{ overflowX: 'hidden', fontFamily: "'Georgia','Times New Roman',serif", color: '#1a1a18' }}>

                {/* ══════════════════════════════════════════════════ */}
                {/* NAVIGATION                                          */}
                {/* ══════════════════════════════════════════════════ */}
                <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, padding: '0 2rem', transition: 'all 0.4s ease', background: navBg ? 'rgba(255,255,255,0.93)' : 'transparent', backdropFilter: navBg ? 'blur(20px)' : 'none', borderBottom: navBg ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </div>
                            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: navBg ? '#1a1a18' : '#fff' }}>MedCare</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                            {[['#features','Fonctionnalités'],['#how-it-works','Comment ça marche'],['#mobile-app','App Mobile'],['#demo','Démo'],['#faq','FAQ']].map(([href, label], i) => (
                                <a key={i} href={href} style={{ fontSize: 13, color: navBg ? '#555' : 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'system-ui,sans-serif', fontWeight: 500, letterSpacing: '0.01em' }}
                                    onMouseEnter={e => (e.target as HTMLElement).style.color = '#f53003'}
                                    onMouseLeave={e => (e.target as HTMLElement).style.color = navBg ? '#555' : 'rgba(255,255,255,0.85)'}>
                                    {label}
                                </a>
                            ))}
                            <Link href="/login" style={{ background: 'linear-gradient(135deg,#f53003,#e02a00)', color: '#fff', padding: '10px 22px', borderRadius: 100, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'system-ui,sans-serif', boxShadow: '0 4px 16px rgba(245,48,3,0.35)', letterSpacing: '0.01em' }}>
                                Connexion
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ══════════════════════════════════════════════════ */}
                {/* HERO — Plein écran avec parallax                   */}
                {/* ══════════════════════════════════════════════════ */}
                <section style={{ position: 'relative', height: '100vh', minHeight: 720, overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1800&auto=format&fit=crop&q=80"
                        alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${scrollY * 0.3}px)` }}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(10,10,8,0.78) 0%,rgba(30,10,5,0.55) 60%,rgba(245,48,3,0.18) 100%)' }}/>
                    <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
                        
                        <h1 style={{ fontSize: 'clamp(44px,7.5vw,88px)', fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-2.5px', maxWidth: 860, marginBottom: 28 }}>
                            La santé mérite la{' '}
                            <span style={{ background: 'linear-gradient(135deg,#f53003,#ff8c6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>meilleure</span>
                            {' '}technologie
                        </h1>
                        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 540, lineHeight: 1.8, fontFamily: 'system-ui,sans-serif', fontWeight: 400, marginBottom: 48 }}>
                            Plateforme complète de gestion hospitalière — dossiers patients, tournées HAD, prescriptions, et bien plus. Conçue pour l'Afrique.
                        </p>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Link href="/login" style={{ background: 'linear-gradient(135deg,#f53003,#e02a00)', color: '#fff', padding: '16px 38px', borderRadius: 100, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 32px rgba(245,48,3,0.45)', letterSpacing: '0.01em' }}>
                                Accéder à la plateforme
                            </Link>
                            <a href="#how-it-works" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '16px 38px', borderRadius: 100, fontSize: 15, fontWeight: 500, textDecoration: 'none', fontFamily: 'system-ui,sans-serif', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                                Comment ça marche →
                            </a>
                        </div>
                    </div>
                    {/* Stats bar */}
                    <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', gap: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
                        {[['500+','Hôpitaux partenaires'],['50 000+','Soignants actifs'],['2M+','Visites enregistrées'],['99.9%','Disponibilité']].map(([v, l], i) => (
                            <div key={i} style={{ padding: '18px 28px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{v}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'system-ui,sans-serif', marginTop: 3, letterSpacing: '0.02em' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* TRUST — Partenaires                                 */}
                {/* ══════════════════════════════════════════════════ */}
              

                {/* ══════════════════════════════════════════════════ */}
                {/* FEATURES — Grille avec images                       */}
                {/* ══════════════════════════════════════════════════ */}
                <section id="features" style={{ padding: '120px 24px', background: '#fafaf9' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 72 }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#f53003', fontFamily: 'system-ui,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Fonctionnalités</p>
                            <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.05, color: '#1a1a18', maxWidth: 580, margin: '0 auto' }}>
                                Tout ce dont votre établissement a besoin
                            </h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                            {[
                                { img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80', title: 'Dossiers patients', desc: 'Dossiers médicaux électroniques complets. Historique, prescriptions, examens et suivi des soins centralisés.' },
                                { img: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&auto=format&fit=crop&q=80', title: 'Tournées HAD', desc: 'Planifiez et suivez les visites à domicile. Récurrence intelligente, GPS et validation des soins en temps réel.' },
                                { img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80', title: 'Pharmacie & Stocks', desc: 'Gestion des prescriptions, alertes de rupture de stock et traçabilité complète des médicaments.' },
                                { img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80', title: 'Tableaux de bord', desc: 'Analyses en temps réel, KPIs hospitaliers et rapports exportables pour piloter votre activité efficacement.' },
                                { img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80', title: 'Facturation intégrée', desc: 'Facturation automatisée, gestion des assurances et suivi des paiements en un seul endroit.' },
                                { img: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=600&auto=format&fit=crop&q=80', title: 'Sécurité & Conformité', desc: 'Cryptage de bout en bout, journaux d\'audit complets et conformité RGPD pour vos données sensibles.' },
                            ].map((f, i) => (
                                <div key={i} style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', border: '1px solid #ebebea', cursor: 'default', transition: 'transform 0.3s,box-shadow 0.3s' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-8px)'; el.style.boxShadow='0 24px 64px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform='none'; el.style.boxShadow='none'; }}>
                                    <div style={{ height: 196, overflow: 'hidden' }}>
                                        <img src={f.img} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                            onMouseEnter={e => (e.target as HTMLElement).style.transform='scale(1.06)'}
                                            onMouseLeave={e => (e.target as HTMLElement).style.transform='scale(1)'}/>
                                    </div>
                                    <div style={{ padding: '22px 26px 28px' }}>
                                        <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 10, color: '#1a1a18' }}>{f.title}</h3>
                                        <p style={{ fontSize: 13, color: '#706f6c', lineHeight: 1.7, fontFamily: 'system-ui,sans-serif' }}>{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* HOW IT WORKS — Étapes sur fond image sombre         */}
                {/* ══════════════════════════════════════════════════ */}
                <section id="how-it-works" style={{ position: 'relative', padding: '120px 24px', overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1800&auto=format&fit=crop&q=80"
                        alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(5,5,3,0.9),rgba(20,8,3,0.85))' }}/>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 80 }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#ff8c6a', fontFamily: 'system-ui,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Comment ça marche</p>
                            <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1.1 }}>
                                Opérationnel en 3 étapes
                            </h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}>
                            {/* Ligne de connexion */}
                            <div style={{ position: 'absolute', top: 48, left: '16.66%', right: '16.66%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(245,48,3,0.5),transparent)', zIndex: 0 }}/>
                            {[
                                { num: '01', title: 'Configuration initiale', desc: 'Notre équipe vous accompagne dans la configuration complète de votre établissement. Import de vos données, paramétrage des services et formation du personnel inclus.', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                                { num: '02', title: 'Formation des équipes', desc: 'Sessions de formation adaptées à chaque profil utilisateur — médecins, infirmiers, administrateurs. Des tutoriels vidéo et une documentation complète sont disponibles.', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
                                { num: '03', title: 'Déploiement & Suivi', desc: 'Mise en production progressive avec suivi en temps réel. Notre équipe reste disponible pour toute question et les mises à jour sont déployées automatiquement.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                            ].map((step, i) => (
                                <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,48,3,0.15)', border: '1.5px solid rgba(245,48,3,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', backdropFilter: 'blur(10px)' }}>
                                        <svg className="h-8 w-8" style={{ color: '#ff8c6a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon}/></svg>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#f53003', letterSpacing: '0.1em', fontFamily: 'system-ui,sans-serif', marginBottom: 12 }}>{step.num}</div>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', marginBottom: 16 }}>{step.title}</h3>
                                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontFamily: 'system-ui,sans-serif' }}>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* VALEURS — 2 colonnes : image + texte                */}
                {/* ══════════════════════════════════════════════════ */}
                <section style={{ padding: '120px 24px', background: '#fff' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ borderRadius: 32, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 40px 100px rgba(0,0,0,0.12)' }}>
                                <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                            </div>
                            {/* Stat card */}
                            <div style={{ position: 'absolute', bottom: -20, right: -20, background: '#fff', borderRadius: 20, padding: '20px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #eee' }}>
                                <div style={{ fontSize: 36, fontWeight: 800, color: '#f53003', letterSpacing: '-1px', lineHeight: 1 }}>40%</div>
                                <div style={{ fontSize: 13, color: '#706f6c', fontFamily: 'system-ui,sans-serif', marginTop: 4 }}>d'efficacité en plus</div>
                                <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', marginTop: 2 }}>dès le 1er mois</div>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#f53003', fontFamily: 'system-ui,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 20 }}>Pourquoi MedCare</p>
                            <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#1a1a18', marginBottom: 24 }}>
                                Pensé par des soignants,<br/>pour des soignants
                            </h2>
                            <p style={{ fontSize: 16, color: '#706f6c', lineHeight: 1.8, fontFamily: 'system-ui,sans-serif', marginBottom: 44 }}>
                                MedCare est né d'une collaboration étroite avec des équipes hospitalières africaines. Chaque fonctionnalité répond à un besoin réel du terrain, identifié directement avec les professionnels de santé.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {[
                                    ['Interface intuitive', 'Prise en main en moins de 30 minutes, sans formation intensive.'],
                                    ['Conçu pour l\'Afrique', 'Fonctionne avec une connexion limitée, adapté aux réalités locales.'],
                                    ['Support humain', 'Une équipe francophone disponible 24h/24 et 7j/7.'],
                                    ['Mises à jour continues', 'Nouvelles fonctionnalités déployées chaque mois selon vos retours.'],
                                ].map(([title, sub], i) => (
                                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f5', border: '1px solid #ffd0c8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                            <svg className="h-4 w-4" style={{ color: '#f53003' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', fontFamily: 'system-ui,sans-serif', marginBottom: 3 }}>{title}</div>
                                            <div style={{ fontSize: 13, color: '#706f6c', fontFamily: 'system-ui,sans-serif', lineHeight: 1.6 }}>{sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* APP MOBILE — Image + fonctionnalités               */}
                {/* ══════════════════════════════════════════════════ */}
                <section id="mobile-app" style={{ padding: '120px 24px', background: '#fafaf9' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1px solid #ffd0c8', borderRadius: 100, padding: '8px 16px', marginBottom: 28 }}>
                                <svg className="h-4 w-4" style={{ color: '#f53003' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                <span style={{ fontSize: 12, color: '#f53003', fontFamily: 'system-ui,sans-serif', fontWeight: 700, letterSpacing: '0.04em' }}>Application Mobile HAD</span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#1a1a18', marginBottom: 20 }}>
                                Suivez vos patients<br/>sur le terrain
                            </h2>
                            <p style={{ fontSize: 16, color: '#706f6c', lineHeight: 1.8, fontFamily: 'system-ui,sans-serif', marginBottom: 40 }}>
                                Module HAD complet pour la gestion mobile de vos soins à domicile. Interface optimisée pour le terrain, même sans connexion stable.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 40 }}>
                                {[
                                    ['Accès hors ligne', 'Consultez les dossiers sans internet'],
                                    ['GPS intégré', 'Optimisez vos tournées quotidiennes'],
                                    ['Synchro auto', 'Données synchronisées à la reconnexion'],
                                    ['Saisie vocale', 'Dictée des observations terrain'],
                                    ['Notifications', 'Alertes en temps réel sur vos cas'],
                                    ['Dark mode', 'Interface adaptée aux conditions lumineuses'],
                                ].map(([title, sub], i) => (
                                    <div key={i} style={{ padding: '16px 18px', borderRadius: 14, background: '#fff', border: '1px solid #eee' }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', fontFamily: 'system-ui,sans-serif', marginBottom: 3 }}>{title}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', lineHeight: 1.5 }}>{sub}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {[['App Store',<svg key="ios" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>,'Télécharger sur'],
                                 ['Google Play',<svg key="gp" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/></svg>,'Disponible sur']].map(([label, icon, sub], i) => (
                                    <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1a1a18', color: '#fff', padding: '13px 20px', borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>
                                        {icon as React.ReactNode}
                                        <div><div style={{ fontSize: 10, opacity: 0.6 }}>{sub as string}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{label as string}</div></div>
                                    </button>
                                ))}
                                <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', color: '#f53003', padding: '13px 20px', borderRadius: 14, border: '2px solid #f53003', cursor: 'pointer', fontFamily: 'system-ui,sans-serif', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='#f53003'; el.style.color='#fff'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color='#f53003'; }}>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                    <div><div style={{ fontSize: 10, opacity: 0.75 }}>Direct</div><div style={{ fontSize: 13, fontWeight: 700 }}>Fichier APK</div></div>
                                </button>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ borderRadius: 32, overflow: 'hidden', aspectRatio: '4/5', boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}>
                                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                            </div>
                            <div style={{ position: 'absolute', bottom: 32, right: -24, background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', border: '1px solid #eee', minWidth: 180 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></div>
                                    <div><div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a18', fontFamily: 'system-ui,sans-serif' }}>Visite validée</div><div style={{ fontSize: 11, color: '#706f6c', fontFamily: 'system-ui,sans-serif' }}>Patient Martin B.</div></div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', top: 32, left: -24, background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', border: '1px solid #eee' }}>
                                <div style={{ fontSize: 11, color: '#706f6c', fontFamily: 'system-ui,sans-serif', marginBottom: 4 }}>Prochaine visite</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#f53003', letterSpacing: '-0.5px', lineHeight: 1 }}>14:30</div>
                                <div style={{ fontSize: 12, color: '#1a1a18', fontFamily: 'system-ui,sans-serif', marginTop: 3 }}>Dupont L. — Ch. 12</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* DÉMO — Split image / formulaire                     */}
                {/* ══════════════════════════════════════════════════ */}
                <section id="demo" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 640 }}>
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&auto=format&fit=crop&q=80" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(5,5,3,0.72),rgba(245,48,3,0.18))' }}/>
                            <div style={{ position: 'relative', zIndex: 2, padding: '80px 60px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#ff8c6a', fontFamily: 'system-ui,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Démo gratuite</p>
                                <h2 style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>Testez sans<br/>engagement</h2>
                                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontFamily: 'system-ui,sans-serif', marginBottom: 32 }}>
                                    Accédez à un environnement complet avec données de test. Aucune carte bancaire requise.
                                </p>
                                {['Accès complet à toutes les fonctionnalités','Données de test pré-remplies','Interface de production réelle'].map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(245,48,3,0.3)', border: '1px solid rgba(245,48,3,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg className="h-3 w-3" style={{ color: '#ff8c6a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                        </div>
                                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'system-ui,sans-serif' }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: '#fafaf9', padding: '80px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: '#1a1a18', marginBottom: 8 }}>Identifiants de démonstration</h3>
                            <p style={{ fontSize: 14, color: '#706f6c', fontFamily: 'system-ui,sans-serif', marginBottom: 36, lineHeight: 1.6 }}>
                                Un environnement de test complet avec des données fictives — aucune donnée réelle n'est affectée.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                                {[{ label: 'Adresse e-mail', value: 'client@test.com' }, { label: 'Mot de passe', value: 'password' }].map((item, i) => (
                                    <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 20px' }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{item.label}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <code style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: '#1a1a18', letterSpacing: '0.02em' }}>{item.value}</code>
                                            <button onClick={() => navigator.clipboard.writeText(item.value)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg className="h-4 w-4" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(135deg,#f53003,#e02a00)', color: '#fff', padding: '16px 32px', borderRadius: 100, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 24px rgba(245,48,3,0.3)' }}>
                                Accéder à la démo
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* SÉCURITÉ — fond image clair                         */}
                {/* ══════════════════════════════════════════════════ */}
                <section style={{ position: 'relative', padding: '120px 24px', overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1800&auto=format&fit=crop&q=80"
                        alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.93)' }}/>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 72 }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#f53003', fontFamily: 'system-ui,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Sécurité & Conformité</p>
                            <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#1a1a18', lineHeight: 1.1, maxWidth: 520, margin: '0 auto' }}>
                                Vos données sont en sécurité
                            </h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                            {[
                                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Cryptage AES-256', desc: 'Toutes les données sont chiffrées au repos et en transit.' },
                                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Conformité RGPD', desc: 'Respect des réglementations européennes et africaines.' },
                                { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title: 'Journaux d\'audit', desc: 'Traçabilité complète de toutes les actions utilisateurs.' },
                                { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Sauvegardes auto', desc: 'Backup quotidien avec rétention de 90 jours garantie.' },
                            ].map((item, i) => (
                                <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', border: '1px solid #eee', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <svg className="h-7 w-7" style={{ color: '#f53003' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon}/></svg>
                                    </div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', marginBottom: 10 }}>{item.title}</h3>
                                    <p style={{ fontSize: 13, color: '#706f6c', lineHeight: 1.7, fontFamily: 'system-ui,sans-serif' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* TÉMOIGNAGES — fond image sombre                    */}
                {/* ══════════════════════════════════════════════════ */}
                <section id="testimonials" style={{ position: 'relative', padding: '120px 24px', overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1800&auto=format&fit=crop&q=80"
                        alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,3,0.9)' }}/>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 72 }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#f53003', fontFamily: 'system-ui,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Témoignages</p>
                            <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1.1 }}>Ce que disent nos clients</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                            {[
                                { name: 'Dr. Marie Kouam', role: 'Directrice Médicale, CHU Douala', text: 'MedCare a transformé notre façon de travailler. La gestion des dossiers est devenue simple et intuitive pour toute l\'équipe médicale.' },
                                { name: 'Jean-Paul Mbarga', role: 'Administrateur, Clinique Moderne', text: 'Un gain de temps considérable dans la gestion administrative. L\'équipe support est exceptionnelle et toujours disponible pour nous accompagner.' },
                                { name: 'Dr. Sophie Nkongo', role: 'Chef de Service, Hôpital Central', text: 'La solution la plus complète du marché. Nous avons augmenté notre efficacité de 40% en 6 mois. Je recommande à tous les établissements.' },
                            ].map((t, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '32px', backdropFilter: 'blur(12px)' }}>
                                    <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                                        {[...Array(5)].map((_, j) => <svg key={j} className="h-4 w-4" style={{ color: '#f53003' }} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                                    </div>
                                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 28, fontFamily: 'system-ui,sans-serif' }}>"{t.text}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{t.name.split(' ').map(n => n[0]).join('')}</div>
                                        <div><div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'system-ui,sans-serif' }}>{t.name}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'system-ui,sans-serif', marginTop: 2 }}>{t.role}</div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Chiffres */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 60 }}>
                            {[['15 000+','Téléchargements app'],['4.9 ★','Note moyenne'],['200 000+','Visites / mois'],['98%','Satisfaction client']].map(([v, l], i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>{v}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'system-ui,sans-serif', marginTop: 8 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* FAQ — fond clair avec image subtile                 */}
                {/* ══════════════════════════════════════════════════ */}
                <section id="faq" style={{ position: 'relative', padding: '120px 24px', overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&auto=format&fit=crop&q=80"
                        alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(253,253,252,0.96)' }}/>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#f53003', fontFamily: 'system-ui,sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>FAQ</p>
                            <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#1a1a18', lineHeight: 1.1 }}>Questions fréquentes</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { q: 'Comment démarrer avec MedCare ?', a: 'Créez un compte, choisissez votre plan et notre équipe vous accompagnera dans la configuration initiale. Une formation complète est incluse sans frais supplémentaires.' },
                                { q: 'L\'application mobile HAD fonctionne-t-elle hors ligne ?', a: 'Oui, l\'app mobile HAD permet de consulter et modifier les dossiers patients même sans connexion. Les données se synchronisent automatiquement dès la reconnexion.' },
                                { q: 'Mes données sont-elles sécurisées ?', a: 'Absolument. Nous utilisons un cryptage AES-256 de bout en bout, des serveurs sécurisés en Afrique et sommes conformes aux normes RGPD.' },
                                { q: 'Puis-je migrer mes données existantes ?', a: 'Oui, notre équipe technique prend en charge la migration complète de vos données depuis n\'importe quel système existant, sans interruption de service.' },
                                { q: 'Combien de temps dure la formation ?', a: 'La formation de base dure 2 jours pour les utilisateurs standard. Des formations avancées par rôle (médecin, infirmier, administrateur) sont disponibles sur demande.' },
                                { q: 'Le support technique est-il disponible en français ?', a: 'Oui, notre équipe support francophone est disponible 24h/24 et 7j/7 par chat, email et téléphone pour tous les plans.' },
                                { q: 'Puis-je utiliser MedCare sur tablette et smartphone ?', a: 'MedCare est entièrement responsive et disponible sur navigateur web (desktop, tablette), et via l\'application native Android et iOS pour le module HAD.' },
                                { q: 'Y a-t-il un contrat d\'engagement minimum ?', a: 'Non, vous pouvez commencer avec un abonnement mensuel sans engagement. Des tarifs préférentiels sont disponibles pour les engagements annuels.' },
                            ].map((item, i) => (
                                <div key={i} style={{ borderRadius: 18, border: '1px solid #eee', background: '#fff', overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: faqOpen === i ? '0 8px 32px rgba(0,0,0,0.06)' : 'none' }}>
                                    <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', fontFamily: 'system-ui,sans-serif', lineHeight: 1.5, paddingRight: 16 }}>{item.q}</span>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: faqOpen === i ? '#f53003' : '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                                            <svg className="h-4 w-4" style={{ color: faqOpen === i ? '#fff' : '#706f6c', transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                                        </div>
                                    </button>
                                    {faqOpen === i && (
                                        <div style={{ padding: '0 24px 20px', fontSize: 14, color: '#706f6c', lineHeight: 1.8, fontFamily: 'system-ui,sans-serif', borderTop: '1px solid #f0f0ee' }}>
                                            <div style={{ paddingTop: 16 }}>{item.a}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════ */}
                {/* CTA FINAL — Image pleine avec overlay rouge         */}
                {/* ══════════════════════════════════════════════════ */}
                <section style={{ position: 'relative', padding: '140px 24px', overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1800&auto=format&fit=crop&q=80"
                        alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(245,48,3,0.9),rgba(180,20,0,0.95))' }}/>
                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 24 }}>
                            Rejoignez 500+<br/>établissements
                        </h2>
                        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontFamily: 'system-ui,sans-serif', marginBottom: 48 }}>
                            Commencez votre transformation digitale dès aujourd'hui. Essai gratuit de 14 jours, sans engagement, sans carte bancaire.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/login" style={{ background: '#fff', color: '#f53003', padding: '18px 44px', borderRadius: 100, fontSize: 16, fontWeight: 800, textDecoration: 'none', fontFamily: 'system-ui,sans-serif', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', letterSpacing: '0.01em' }}>
                                Accéder à la plateforme
                            </Link>
                            <a href="#demo" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '18px 44px', borderRadius: 100, fontSize: 16, fontWeight: 600, textDecoration: 'none', fontFamily: 'system-ui,sans-serif', border: '1.5px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}>
                                Voir la démo →
                            </a>
                        </div>
                        <p style={{ marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'system-ui,sans-serif' }}>
                            Aucune carte bancaire · Annulation à tout moment · Support 24/7 inclus
                        </p>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────────── */}
                <footer style={{ background: '#0a0a08', padding: '72px 24px 36px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 60 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                    </div>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>MedCare</span>
                                </div>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: 300, fontFamily: 'system-ui,sans-serif', marginBottom: 24 }}>
                                    La solution complète pour la gestion hospitalière moderne en Afrique. Sécurisée, intuitive et performante.
                                </p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
                                       'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z'].map((path, i) => (
                                        <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path}/></svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                            {[
                                { title: 'Produit', links: [['#features','Fonctionnalités'],['#how-it-works','Comment ça marche'],['#mobile-app','App Mobile HAD'],['#demo','Démo'],['#faq','FAQ']] },
                                { title: 'Entreprise', links: [['#','À propos'],['#','Blog'],['#','Carrières'],['#','Contact']] },
                                { title: 'Support', links: [['#','Documentation'],['#','API Reference'],['#','Statut'],['#','Sécurité']] },
                            ].map((col, i) => (
                                <div key={i}>
                                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'system-ui,sans-serif' }}>{col.title}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {col.links.map(([href, label]) => (
                                            <a key={label} href={href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontFamily: 'system-ui,sans-serif', transition: 'color 0.2s' }}
                                                onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                                                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}>
                                                {label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'system-ui,sans-serif' }}>&copy; 2025 MedCare. Tous droits réservés.</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'system-ui,sans-serif' }}>Conçu pour les soignants d'Afrique 🌍</p>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.5)} }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
            `}</style>
        </>
    );
}