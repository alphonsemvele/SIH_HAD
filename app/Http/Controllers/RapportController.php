<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

// ── Models ────────────────────────────────────────────────────────────────────
use App\Models\User;
use App\Models\Service;
use App\Models\Patient;
use App\Models\DossierMedical;
use App\Models\Lit;
use App\Models\Medicament;
use App\Models\Prescription;
use App\Models\Analyse;
use App\Models\ExamenImagerie;
use App\Models\Tournee;
use App\Models\RapportHistorique;

class RapportController extends Controller
{
    // ─── Page principale ──────────────────────────────────────────────────────

    public function index()
    {
        $stats = [
            'total_generes' => RapportHistorique::count(),
            'ce_mois'       => RapportHistorique::whereMonth('created_at', now()->month)
                                                 ->whereYear('created_at',  now()->year)->count(),
            'telecharges'   => RapportHistorique::where('statut', 'disponible')->count(),
            'en_cours'      => RapportHistorique::where('statut', 'generation')->count(),
        ];

        $historique = RapportHistorique::with('user')
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($r) => [
                'id'          => $r->id,
                'titre'       => $r->titre,
                'type'        => $r->type,
                'format'      => $r->format,
                'taille'      => $r->taille ?? '—',
                'genere_le'   => $r->created_at->format('d/m/Y H:i'),
                'genere_par'  => $r->user->name ?? 'Système',
                'statut'      => $r->statut,
                'url'         => $r->statut === 'disponible' ? route('rapports.retelecharger', $r->id) : null,
            ]);

        $services = Service::where('actif', true)->orderBy('nom')->get(['id', 'nom']);

        return Inertia::render('dashboard/rapports', [
            'stats'      => $stats,
            'historique' => $historique,
            'services'   => $services,
        ]);
    }

    // ─── Téléchargement principal ─────────────────────────────────────────────

    public function telecharger(Request $request)
    {
        $request->validate([
            'rapport_id'    => 'required|string',
            'format'        => 'required|in:pdf,xlsx,csv',
            'periode_debut' => 'nullable|date',
            'periode_fin'   => 'nullable|date|after_or_equal:periode_debut',
        ]);

        $rapportId   = $request->input('rapport_id');
        $format      = $request->input('format');
        $debut       = $request->input('periode_debut') ? Carbon::parse($request->input('periode_debut'))->startOfDay() : now()->startOfMonth();
        $fin         = $request->input('periode_fin')   ? Carbon::parse($request->input('periode_fin'))->endOfDay()     : now()->endOfDay();
        $serviceId   = $request->input('service_id');
        $extra       = $request->except(['rapport_id', 'format', 'periode_debut', 'periode_fin']);

        // Récupérer les données selon le type de rapport
        $data  = $this->getData($rapportId, $debut, $fin, $serviceId, $extra);
        $titre = $this->getTitre($rapportId);

        // Enregistrer dans l'historique
        $historique = RapportHistorique::create([
            'user_id' => auth()->id(),
            'type'    => $rapportId,
            'titre'   => $titre,
            'format'  => $format,
            'statut'  => 'disponible',
        ]);

        // Générer selon le format
        $response = match ($format) {
            'pdf'  => $this->genererPdf($data, $titre, $debut, $fin, $historique),
            'xlsx' => $this->genererExcel($data, $titre, $debut, $fin, $historique),
            'csv'  => $this->genererCsv($data, $titre, $historique),
        };

        return $response;
    }

    // ─── Re-téléchargement depuis l'historique ────────────────────────────────

    public function retelecharger(RapportHistorique $rapport)
    {
        // On régénère avec les mêmes paramètres sauvegardés
        $data  = $this->getData($rapport->type, now()->startOfMonth(), now()->endOfDay());
        $titre = $rapport->titre;

        return match ($rapport->format) {
            'pdf'  => $this->genererPdf($data,  $titre, now()->startOfMonth(), now()->endOfDay(), $rapport),
            'xlsx' => $this->genererExcel($data, $titre, now()->startOfMonth(), now()->endOfDay(), $rapport),
            'csv'  => $this->genererCsv($data,  $titre, $rapport),
        };
    }

    // ─── Suppression ──────────────────────────────────────────────────────────

    public function destroy(RapportHistorique $rapport)
    {
        $rapport->delete();
        return back()->with('success', 'Rapport supprimé.');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // COLLECTE DES DONNÉES
    // ══════════════════════════════════════════════════════════════════════════

    private function getData(string $type, Carbon $debut, Carbon $fin, ?string $serviceId = null, array $extra = []): array
    {
        return match ($type) {
            'patients'   => $this->dataPatients($debut, $fin, $serviceId),
            'dossiers'   => $this->dataDossiers($debut, $fin, $serviceId),
            'pharmacie'  => $this->dataPharmacie($debut, $fin, $extra['type'] ?? null),
            'laboratoire'=> $this->dataLaboratoire($debut, $fin, $extra['categorie'] ?? null, $extra['urgents'] ?? null),
            'imagerie'   => $this->dataImagerie($debut, $fin, $extra['modalite'] ?? null),
            'had'        => $this->dataHad($debut, $fin, $serviceId),
            'personnel'  => $this->dataPersonnel($extra['fonction'] ?? null),
            'activite'   => $this->dataActivite($debut, $fin),
            default      => [],
        };
    }

    // ── Patients ──────────────────────────────────────────────────────────────

    private function dataPatients(Carbon $debut, Carbon $fin, ?string $serviceId): array
    {
        $q = Patient::with('dossierMedical.service')
            ->whereBetween('created_at', [$debut, $fin]);

        if ($serviceId && $serviceId !== 'Tous') {
            $q->whereHas('dossierMedical', fn($d) => $d->where('service_id', $serviceId));
        }

        $patients = $q->orderBy('nom')->get();

        return [
            'headers' => ['Matricule', 'Nom', 'Prénom', 'Date naissance', 'Sexe', 'Téléphone', 'Service', 'Date admission'],
            'rows'    => $patients->map(fn($p) => [
                $p->matricule ?? '—',
                $p->nom,
                $p->prenom,
                $p->date_naissance ? Carbon::parse($p->date_naissance)->format('d/m/Y') : '—',
                $p->sexe === 'M' ? 'Masculin' : 'Féminin',
                $p->telephone ?? '—',
                $p->dossierMedical?->service?->nom ?? '—',
                $p->created_at->format('d/m/Y'),
            ])->toArray(),
            'summary' => [
                'Total patients'      => $patients->count(),
                'Hommes'              => $patients->where('sexe', 'M')->count(),
                'Femmes'              => $patients->where('sexe', 'F')->count(),
                'Période'             => $debut->format('d/m/Y') . ' — ' . $fin->format('d/m/Y'),
            ],
        ];
    }

    // ── Dossiers médicaux ─────────────────────────────────────────────────────

    private function dataDossiers(Carbon $debut, Carbon $fin, ?string $serviceId): array
    {
        $q = DossierMedical::with(['patient', 'service', 'medecinResponsable'])
            ->whereBetween('date_admission', [$debut, $fin]);

        if ($serviceId && $serviceId !== 'Tous les services') {
            $q->where('service_id', $serviceId);
        }

        $dossiers = $q->orderBy('date_admission', 'desc')->get();

        return [
            'headers' => ['N° Dossier', 'Patient', 'Service', 'Médecin', 'Admission', 'Sortie', 'Statut', 'Diagnostic'],
            'rows'    => $dossiers->map(fn($d) => [
                $d->numero_dossier ?? '—',
                $d->patient ? $d->patient->nom . ' ' . $d->patient->prenom : '—',
                $d->service?->nom ?? '—',
                $d->medecinResponsable?->name ?? '—',
                $d->date_admission  ? Carbon::parse($d->date_admission)->format('d/m/Y')  : '—',
                $d->date_sortie     ? Carbon::parse($d->date_sortie)->format('d/m/Y')     : 'En cours',
                ucfirst($d->statut ?? '—'),
                $d->diagnostic_principal ?? '—',
            ])->toArray(),
            'summary' => [
                'Total dossiers'  => $dossiers->count(),
                'Hospitalisés'    => $dossiers->where('statut', 'hospitalise')->count(),
                'Sortis'          => $dossiers->where('statut', 'sorti')->count(),
                'Durée moy. séjour' => $dossiers->filter(fn($d) => $d->date_sortie)
                    ->avg(fn($d) => Carbon::parse($d->date_admission)->diffInDays(Carbon::parse($d->date_sortie))) . ' jours',
            ],
        ];
    }

    // ── Pharmacie ─────────────────────────────────────────────────────────────

    private function dataPharmacie(Carbon $debut, Carbon $fin, ?string $typePhar): array
    {
        $prescriptions = Prescription::with(['patient', 'medecin', 'lignes.medicament'])
            ->whereBetween('date_prescription', [$debut, $fin])
            ->get();

        $rows = [];
        foreach ($prescriptions as $pres) {
            foreach ($pres->lignes ?? [] as $ligne) {
                $rows[] = [
                    $pres->patient?->nom . ' ' . $pres->patient?->prenom,
                    $ligne->medicament?->nom ?? '—',
                    $ligne->medicament?->forme ?? '—',
                    $ligne->posologie ?? '—',
                    $ligne->duree_jours ? $ligne->duree_jours . ' j' : '—',
                    $pres->medecin?->name ?? '—',
                    Carbon::parse($pres->date_prescription)->format('d/m/Y'),
                    ucfirst($pres->statut ?? '—'),
                ];
            }
        }

        return [
            'headers' => ['Patient', 'Médicament', 'Forme', 'Posologie', 'Durée', 'Prescripteur', 'Date', 'Statut'],
            'rows'    => $rows,
            'summary' => [
                'Prescriptions'         => $prescriptions->count(),
                'Lignes de prescription'=> count($rows),
                'Médecins prescripteurs' => $prescriptions->pluck('medecin_id')->unique()->count(),
            ],
        ];
    }

    // ── Laboratoire ───────────────────────────────────────────────────────────

    private function dataLaboratoire(Carbon $debut, Carbon $fin, ?string $categorie, ?string $urgentsOnly): array
    {
        $q = Analyse::with(['patient', 'typeExamen', 'prescripteur'])
            ->whereBetween('date_prescription', [$debut, $fin]);

        if ($categorie && $categorie !== 'Toutes') {
            $q->whereHas('typeExamen', fn($t) => $t->where('categorie', $categorie));
        }
        if ($urgentsOnly === '1') {
            $q->where('urgent', true);
        }

        $analyses = $q->orderBy('date_prescription', 'desc')->get();

        return [
            'headers' => ['N° Analyse', 'Patient', 'Type d\'examen', 'Catégorie', 'Prescripteur', 'Date', 'Urgent', 'Statut'],
            'rows'    => $analyses->map(fn($a) => [
                $a->numero ?? '—',
                $a->patient ? $a->patient->nom . ' ' . $a->patient->prenom : '—',
                $a->typeExamen?->nom ?? $a->type ?? '—',
                $a->typeExamen?->categorie ?? $a->categorie ?? '—',
                $a->prescripteur?->name ?? $a->prescripteur ?? '—',
                $a->date_prescription ? Carbon::parse($a->date_prescription)->format('d/m/Y') : '—',
                $a->urgent ? 'OUI' : 'Non',
                ucfirst(str_replace('_', ' ', $a->statut ?? '—')),
            ])->toArray(),
            'summary' => [
                'Total analyses'    => $analyses->count(),
                'Urgentes'          => $analyses->where('urgent', true)->count(),
                'Validées'          => $analyses->where('statut', 'valide')->count(),
                'En cours'          => $analyses->where('statut', 'en_cours')->count(),
            ],
        ];
    }

    // ── Imagerie ──────────────────────────────────────────────────────────────

    private function dataImagerie(Carbon $debut, Carbon $fin, ?string $modalite): array
    {
        $q = ExamenImagerie::with(['patient', 'typeExamen', 'prescripteur'])
            ->whereBetween('date_prescription', [$debut, $fin]);

        if ($modalite && $modalite !== 'Toutes') {
            $q->where('modalite', $modalite);
        }

        $examens = $q->orderBy('date_prescription', 'desc')->get();

        return [
            'headers' => ['N° Examen', 'Patient', 'Type', 'Modalité', 'Région', 'Prescripteur', 'Date', 'Priorité', 'Statut'],
            'rows'    => $examens->map(fn($e) => [
                $e->numero ?? '—',
                $e->patient ? $e->patient->nom . ' ' . $e->patient->prenom : '—',
                $e->type ?? '—',
                $e->modalite ?? '—',
                $e->region_anatomique ?? '—',
                $e->prescripteur ?? '—',
                $e->date_prescription ? Carbon::parse($e->date_prescription)->format('d/m/Y') : '—',
                ucfirst($e->priorite_raw ?? $e->priorite ?? '—'),
                ucfirst(str_replace('_', ' ', $e->statut_raw ?? $e->statut ?? '—')),
            ])->toArray(),
            'summary' => [
                'Total examens'   => $examens->count(),
                'Interprétés'     => $examens->where('statut_raw', 'interprete')->count(),
                'Urgents'         => $examens->where('priorite_raw', 'tres_urgent')->count(),
                'Réalisés'        => $examens->where('statut_raw', 'realise')->count(),
            ],
        ];
    }

    // ── HAD / Tournées ────────────────────────────────────────────────────────

    private function dataHad(Carbon $debut, Carbon $fin, ?string $serviceId): array
    {
        $q = Tournee::with(['soignant', 'service', 'visiteHads.patient'])
            ->whereBetween('date', [$debut, $fin]);

        if ($serviceId && $serviceId !== 'Tous les services') {
            $q->where('service_id', $serviceId);
        }

        $tournees = $q->orderBy('date', 'desc')->get();

        return [
            'headers' => ['Date', 'Service', 'Soignant', 'Type', 'Patients prévus', 'Patients vus', 'Taux', 'H. début', 'H. fin', 'Statut'],
            'rows'    => $tournees->map(fn($t) => [
                Carbon::parse($t->date)->format('d/m/Y'),
                $t->service?->nom ?? '—',
                $t->soignant?->name ?? '—',
                match($t->type) { 'complete' => 'Complète', 'cas_critiques' => 'Cas critiques', 'chambre_specifique' => 'Chambre spécifique', default => $t->type },
                $t->patients_total,
                $t->patients_vus,
                $t->patients_total > 0 ? round(($t->patients_vus / $t->patients_total) * 100) . '%' : '—',
                $t->heure_debut_prevue ?? '—',
                $t->heure_fin_effective ?? $t->heure_fin_prevue ?? '—',
                ucfirst($t->statut ?? '—'),
            ])->toArray(),
            'summary' => [
                'Tournées'         => $tournees->count(),
                'Terminées'        => $tournees->where('statut', 'terminee')->count(),
                'Patients vus'     => $tournees->sum('patients_vus'),
                'Taux global'      => $tournees->sum('patients_total') > 0
                    ? round(($tournees->sum('patients_vus') / $tournees->sum('patients_total')) * 100) . '%'
                    : '—',
            ],
        ];
    }

    // ── Personnel ─────────────────────────────────────────────────────────────

    private function dataPersonnel(?string $fonction): array
    {
        $q = User::with('service');

        if ($fonction && $fonction !== 'Toutes') {
            $q->where('fonction', $fonction);
        }

        $personnel = $q->orderBy('lastname')->orderBy('name')->get();

        return [
            'headers' => ['Matricule', 'Nom', 'Prénom', 'Fonction', 'Spécialité', 'Service', 'Email', 'Téléphone', 'Statut', 'Embauché le'],
            'rows'    => $personnel->map(fn($p) => [
                $p->matricule ?? '—',
                $p->lastname  ?? $p->name,
                $p->name,
                $p->fonction  ?? '—',
                $p->specialite ?? '—',
                $p->service?->nom ?? '—',
                $p->email,
                $p->telephone ?? '—',
                ucfirst($p->statut ?? '—'),
                $p->date_embauche ? Carbon::parse($p->date_embauche)->format('d/m/Y') : '—',
            ])->toArray(),
            'summary' => [
                'Total agents'    => $personnel->count(),
                'Médecins'        => $personnel->where('fonction', 'Médecin')->count(),
                'Infirmiers'      => $personnel->whereIn('fonction', ['Infirmière', 'Infirmière Chef'])->count(),
                'Actifs'          => $personnel->where('statut', 'actif')->count(),
                'En congé'        => $personnel->where('statut', 'conge')->count(),
            ],
        ];
    }

    // ── Activité globale ──────────────────────────────────────────────────────

    private function dataActivite(Carbon $debut, Carbon $fin): array
    {
        return [
            'headers' => ['Indicateur', 'Valeur', 'Variation'],
            'rows'    => [
                ['Nouveaux patients',          Patient::whereBetween('created_at', [$debut, $fin])->count(), ''],
                ['Admissions (dossiers)',       DossierMedical::whereBetween('date_admission', [$debut, $fin])->count(), ''],
                ['Prescriptions émises',        Prescription::whereBetween('date_prescription', [$debut, $fin])->count(), ''],
                ['Analyses biologiques',        Analyse::whereBetween('date_prescription', [$debut, $fin])->count(), ''],
                ['Examens imagerie',            ExamenImagerie::whereBetween('date_prescription', [$debut, $fin])->count(), ''],
                ['Tournées HAD',                Tournee::whereBetween('date', [$debut, $fin])->count(), ''],
                ['Lits occupés (actuellement)', Lit::where('statut', 'occupe')->count(), ''],
                ['Taux d\'occupation',          Lit::count() > 0 ? round((Lit::where('statut', 'occupe')->count() / Lit::count()) * 100) . '%' : '—', ''],
                ['Personnel actif',             User::where('statut', 'actif')->count(), ''],
                ['Services actifs',             Service::where('actif', true)->count(), ''],
            ],
            'summary' => [
                'Période' => $debut->format('d/m/Y') . ' — ' . $fin->format('d/m/Y'),
            ],
        ];
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GÉNÉRATEURS DE FICHIERS
    // ══════════════════════════════════════════════════════════════════════════

    private function genererPdf(array $data, string $titre, Carbon $debut, Carbon $fin, RapportHistorique $historique)
    {
        // Générer le HTML du rapport
        $html = $this->buildHtml($data, $titre, $debut, $fin);

        // Utiliser DomPDF si disponible, sinon retourner le HTML brut
        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)
                ->setPaper('A4', 'landscape');

            $taille = strlen($pdf->output());
            $historique->update([
                'taille' => $this->formatBytes($taille),
                'statut' => 'disponible',
            ]);

            $filename = $this->makeFilename($titre, $debut, $fin, 'pdf');
            return $pdf->download($filename);
        }

        // Fallback HTML → fichier téléchargeable
        $filename = $this->makeFilename($titre, $debut, $fin, 'html');
        $historique->update(['taille' => $this->formatBytes(strlen($html)), 'statut' => 'disponible']);
        return response($html, 200, [
            'Content-Type'        => 'text/html; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function genererExcel(array $data, string $titre, Carbon $debut, Carbon $fin, RapportHistorique $historique)
    {
        // Utiliser Laravel Excel si disponible
        if (class_exists(\Maatwebsite\Excel\Facades\Excel::class)) {
            $export   = new \App\Exports\RapportExport($data, $titre, $debut, $fin);
            $filename = $this->makeFilename($titre, $debut, $fin, 'xlsx');
            $historique->update(['taille' => '—', 'statut' => 'disponible']);
            return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
        }

        // Fallback CSV si Excel non disponible
        return $this->genererCsv($data, $titre, $historique);
    }

    private function genererCsv(array $data, string $titre, RapportHistorique $historique)
    {
        $filename = $this->makeFilename($titre, now(), now(), 'csv');

        $rows   = [];
        // En-tête du fichier
        $rows[] = [strtoupper($titre), date('d/m/Y H:i')];
        $rows[] = [];

        // Résumé
        if (!empty($data['summary'])) {
            $rows[] = ['=== RÉSUMÉ ==='];
            foreach ($data['summary'] as $key => $val) {
                $rows[] = [$key, $val];
            }
            $rows[] = [];
        }

        // Tableau principal
        if (!empty($data['headers'])) {
            $rows[] = $data['headers'];
        }
        foreach ($data['rows'] ?? [] as $row) {
            $rows[] = $row;
        }

        // Construire le CSV
        ob_start();
        $out = fopen('php://output', 'w');
        // BOM UTF-8 pour Excel
        fputs($out, "\xEF\xBB\xBF");
        foreach ($rows as $row) {
            fputcsv($out, array_map(fn($v) => $v ?? '', $row), ';');
        }
        fclose($out);
        $csv = ob_get_clean();

        $historique->update(['taille' => $this->formatBytes(strlen($csv)), 'statut' => 'disponible']);

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GÉNÉRATION HTML (pour PDF)
    // ══════════════════════════════════════════════════════════════════════════

    private function buildHtml(array $data, string $titre, Carbon $debut, Carbon $fin): string
    {
        $dateRange = $debut->format('d/m/Y') . ' — ' . $fin->format('d/m/Y');
        $genereA   = now()->format('d/m/Y à H:i');
        $genereP   = auth()->user()?->name ?? 'Système';

        $summaryHtml = '';
        if (!empty($data['summary'])) {
            $items = collect($data['summary'])->map(fn($v, $k) =>
                '<div class="summary-item"><span class="summary-label">' . htmlspecialchars($k) . '</span><span class="summary-value">' . htmlspecialchars((string)$v) . '</span></div>'
            )->implode('');
            $summaryHtml = '<div class="summary">' . $items . '</div>';
        }

        $thHtml = collect($data['headers'] ?? [])->map(fn($h) => '<th>' . htmlspecialchars($h) . '</th>')->implode('');

        $trHtml = '';
        foreach ($data['rows'] ?? [] as $i => $row) {
            $class  = $i % 2 === 0 ? '' : ' class="alt"';
            $tds    = collect($row)->map(fn($c) => '<td>' . htmlspecialchars((string)($c ?? '—')) . '</td>')->implode('');
            $trHtml .= "<tr{$class}>{$tds}</tr>";
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>{$titre}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; color: #1a1a18; background: #fff; }

.header { background: linear-gradient(135deg, #1a2035, #2d3a5a); color: white; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
.header-left h1 { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
.header-left p  { font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 3px; }
.header-right   { text-align: right; font-size: 9px; color: rgba(255,255,255,0.7); }
.header-right strong { display: block; font-size: 11px; color: #fff; margin-bottom: 2px; }

.logo-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f53003; margin-right: 6px; box-shadow: 0 0 6px rgba(245,48,3,0.6); }

.accent-bar { height: 3px; background: linear-gradient(90deg, #f53003, #3b82f6, #10b981); }

.content { padding: 16px 24px; }

.summary { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.summary-item { background: #f8f8f7; border: 1px solid #eeeeed; border-radius: 8px; padding: 8px 12px; min-width: 120px; }
.summary-label { display: block; font-size: 8px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
.summary-value { display: block; font-size: 14px; font-weight: 700; color: #1a1a18; }

table { width: 100%; border-collapse: collapse; font-size: 9px; }
thead tr { background: #1a2035; color: white; }
thead th { padding: 8px 10px; text-align: left; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
tbody tr:hover { background: #f0f9ff; }
tbody tr.alt { background: #fafaf9; }
tbody td { padding: 7px 10px; border-bottom: 1px solid #f0f0ee; vertical-align: middle; }

.footer { margin-top: 20px; padding: 10px 24px; border-top: 1px solid #eeeeed; display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af; }

.badge { display: inline-block; padding: 2px 7px; border-radius: 100px; font-size: 8px; font-weight: 700; }
.badge-ok  { background: #f0fdf4; color: #16a34a; }
.badge-err { background: #fef2f2; color: #dc2626; }
</style>
</head>
<body>
<div class="header">
    <div class="header-left">
        <h1><span class="logo-dot"></span>MedCare — {$titre}</h1>
        <p>Période : {$dateRange}</p>
    </div>
    <div class="header-right">
        <strong>Généré le {$genereA}</strong>
        Par {$genereP}
    </div>
</div>
<div class="accent-bar"></div>
<div class="content">
    {$summaryHtml}
    <table>
        <thead><tr>{$thHtml}</tr></thead>
        <tbody>{$trHtml}</tbody>
    </table>
</div>
<div class="footer">
    <span>MedCare — Système d'information hospitalier</span>
    <span>Document confidentiel — {$genereA}</span>
</div>
</body>
</html>
HTML;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private function makeFilename(string $titre, Carbon $debut, Carbon $fin, string $ext): string
    {
        $slug  = strtolower(str_replace([' ', "'", '/'], ['_', '', '-'], $titre));
        $range = $debut->format('Ymd') . '_' . $fin->format('Ymd');
        return "medcare_{$slug}_{$range}.{$ext}";
    }

    private function getTitre(string $type): string
    {
        return match ($type) {
            'patients'    => 'Rapport Patients',
            'dossiers'    => 'Rapport Dossiers médicaux',
            'pharmacie'   => 'Rapport Pharmacie',
            'laboratoire' => 'Rapport Laboratoire',
            'imagerie'    => 'Rapport Imagerie',
            'had'         => 'Rapport HAD — Tournées',
            'personnel'   => 'Rapport Personnel',
            'activite'    => "Rapport d'activité global",
            default       => 'Rapport',
        };
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024)       return $bytes . ' o';
        if ($bytes < 1048576)    return round($bytes / 1024, 1) . ' Ko';
        return round($bytes / 1048576, 2) . ' Mo';
    }
}