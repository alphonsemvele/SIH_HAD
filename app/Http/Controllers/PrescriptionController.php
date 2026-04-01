<?php

namespace App\Http\Controllers;

use App\Models\Anomalie;
use App\Models\Medicament;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Prescription::with([
            "patient:id,nom,prenom,date_naissance,sexe",
            "medecin:id,name,lastname",
            "anomalie:id,titre,description,severite,statut",
            "lignePrescriptions",
        ]);

        if ($request->filled("search")) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where("numero", "like", "%{$s}%")
                  ->orWhereHas("patient", fn($q) =>
                      $q->where("nom", "like", "%{$s}%")
                        ->orWhere("prenom", "like", "%{$s}%")
                  );
            });
        }

        if ($request->filled("statut")) {
            $query->where("statut", $request->statut);
        }

        $stats = [
            "total"     => Prescription::count(),
            "en_cours"  => Prescription::where("statut", "en_cours")->count(),
            "delivrees" => Prescription::where("statut", "delivree")->count(),
            "expirees"  => Prescription::where("statut", "expiree")->count(),
        ];

        return Inertia::render("dashboard/prescription", [
            "prescriptions" => $query->latest()->paginate(15)->withQueryString(),
            "patients"      => Patient::orderBy("nom")->get(["id", "nom", "prenom", "date_naissance", "sexe"]),
            "medicaments"   => Medicament::orderBy("nom")->get(["id", "nom", "dosage", "forme"]),
            "stats"         => $stats,
            "filters"       => $request->only(["search", "statut"]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            "patient_id"             => ["required", "exists:patients,id"],
            "anomalie_id"            => ["nullable", "exists:anomalies,id"],
            "instructions_generales" => ["nullable", "string"],
            "date_validite"          => ["nullable", "date", "after:today"],
            "lignes"                 => ["required", "array", "min:1"],
            "lignes.*.medicament_id" => ["required", "exists:medicaments,id"],
            "lignes.*.posologie"     => ["required", "string"],
            "lignes.*.duree"         => ["required", "string"],
            "lignes.*.quantite"      => ["required", "integer", "min:1"],
            "lignes.*.instructions"  => ["nullable", "string"],
        ]);

        // Generer le numero
        $annee   = now()->year;
        $dernier = Prescription::whereYear("created_at", $annee)->count() + 1;
        $numero  = "RX-" . $annee . "-" . str_pad($dernier, 4, "0", STR_PAD_LEFT);

        // Creer la prescription (anomalie_id = BelongsTo FK)
        $prescription = Prescription::create([
            "numero"                 => $numero,
            "patient_id"             => $data["patient_id"],
            "medecin_id"             => auth()->id(),
            "anomalie_id"            => $data["anomalie_id"] ?? null,
            "instructions_generales" => $data["instructions_generales"] ?? null,
            "date_prescription"      => now(),
            "date_validite"          => $data["date_validite"] ?? null,
            "statut"                 => "en_cours",
        ]);

        // Creer les lignes (stockage medicaments dans ligne_prescriptions)
        foreach ($data["lignes"] as $ligne) {
            $medicament = Medicament::find($ligne["medicament_id"]);
            $prescription->lignePrescriptions()->create([
                "medicament_id"  => $ligne["medicament_id"],
                "medicament_nom" => $medicament->nom,
                "dosage"         => $medicament->dosage,
                "forme"          => $medicament->forme,
                "posologie"      => $ligne["posologie"],
                "duree"          => $ligne["duree"],
                "quantite"       => $ligne["quantite"],
                "instructions"   => $ligne["instructions"] ?? null,
            ]);
        }

        // Marquer l anomalie comme traitee si liee (BelongsTo)
        if (!empty($data["anomalie_id"])) {
            Anomalie::where("id", $data["anomalie_id"])
                    ->update(["statut" => "traite"]);
        }

        return redirect()->route("prescriptions.index")
            ->with("success", "Prescription {$numero} creee avec succes.");
    }

    public function updateStatut(Request $request, Prescription $prescription): RedirectResponse
    {
        $request->validate([
            "statut" => ["required", "in:en_cours,delivree,expiree,annulee"],
        ]);
        $prescription->update(["statut" => $request->statut]);
        return back()->with("success", "Statut mis a jour.");
    }

    public function renouveler(Prescription $prescription): RedirectResponse
    {
        $annee   = now()->year;
        $dernier = Prescription::whereYear("created_at", $annee)->count() + 1;
        $numero  = "RX-" . $annee . "-" . str_pad($dernier, 4, "0", STR_PAD_LEFT);

        $nouvelle = $prescription->replicate(["numero", "statut", "created_at", "updated_at"]);
        $nouvelle->numero            = $numero;
        $nouvelle->statut            = "en_cours";
        $nouvelle->date_prescription = now();
        $nouvelle->date_validite     = null;
        $nouvelle->anomalie_id       = null;
        $nouvelle->save();

        foreach ($prescription->lignePrescriptions as $ligne) {
            $nouvelle->lignePrescriptions()->create(
                $ligne->only(["medicament_id", "medicament_nom", "dosage", "forme", "posologie", "duree", "quantite", "instructions"])
            );
        }

        return redirect()->route("prescriptions.index")
            ->with("success", "Prescription renouvelee : {$numero}");
    }

    public function print(Prescription $prescription): Response
    {
        $prescription->load(["patient", "medecin", "anomalie", "lignePrescriptions"]);
        return Inertia::render("dashboard/prescription-print", ["prescription" => $prescription]);
    }

    // Endpoint JSON : anomalies actives d un patient pour le fetch du modal
    public function anomaliesActives(Patient $patient): JsonResponse
    {
        $anomalies = Anomalie::where("patient_id", $patient->id)
            ->whereNotIn("statut", ["traite", "ferme", "resolu"])
            ->orderByRaw("FIELD(severite, 'critique', 'elevee', 'moderee', 'faible')")
            ->get(["id", "titre", "description", "severite", "statut", "created_at"]);

        return response()->json($anomalies);
    }
}