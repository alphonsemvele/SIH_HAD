# Bugs restants à corriger

## SegurDashboardController - calculs à réimplémenter (priorité moyenne)

Le contrôleur retourne actuellement tous les compteurs à 0 (placeholder pour démo).
Les vrais calculs ont été désactivés à cause de plusieurs bugs Windsurf SWE 1.5 :

1. `PatientHad::where('ins_qualifie')` → la colonne est sur `patients`, pas `patient_hads`.
   Fix : `PatientHad::whereHas('patient', fn($q) => $q->where('ins_qualifie', true))`

2. `App\Models\ActivityLog` n'existe pas (Spatie utilise `Spatie\Activitylog\Models\Activity`).
   Adapter aussi : `Activity::where('log_name', ...)` au lieu de `description`.

3. `MssanteMessage::where('direction', ...)` à vérifier.
   Voir migration : la colonne est probablement `sens` (entrant/sortant).

4. `MesDepot::where('statut', ...)` : vérifier les valeurs (`reussi`, `echoue` vs `depose`, `echec`).

À reprendre samedi pendant une pause (entre S5 et S6 du plan_weekend).

## Tests legacy en échec (priorité basse)

`UserControllerTest`, `VisiteHadControllerTest`, `TourneeControllerTest` échouent.
Tests scaffoldés par Blueprint pointant vers du code qui n'existe plus.
À supprimer ou refaire avec le vrai code en début de semaine prochaine.

## Modèle User désaligné avec schéma DB (priorité moyenne)

La table `users` a `name` (NOT NULL) mais le modèle a `nom`/`prenom` dans `$fillable`.
Le user admin a été créé via `DB::table()` direct pour contourner.
À aligner proprement : soit migration ALTER pour ajouter `nom`/`prenom` et virer `name`,
soit ajouter `name` dans `$fillable` du User. Voir avec l'équipe la convention voulue.

