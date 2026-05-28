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


## GenererPreuveVisiteJob - PDF preuve à finir dimanche matin

État: Job tourne (81ms), template chargé, mais variables manquantes:
- ligne 76: $constantes->count() (fix appliqué dans Job: collect() vide)
- ligne 130: $hash undefined (à passer depuis Job ou retirer du template)
- probablement d'autres variables manquantes (qrScan->scanned_at, etc.)

Plan dimanche matin (15-30 min):
1. Lister TOUTES les variables référencées dans template via grep
2. S'assurer que le Job les passe toutes (avec fallbacks null-safe)
3. Re-test
4. Si template trop foiré: réécrire template minimaliste 1 page

Pour la démo cette stratégie alternative est OK car:
- Smoke test E2E backend validé (acte créé, visite mise à jour)
- Le PDF preuve peut être généré côté UI plus tard
- Le workflow critique (QR scan + saisie mobile) ne dépend pas du PDF

## Migrations skippées (à reprendre semaine prochaine)

3 migrations en .skip parce qu'elles référencent `actes_medicaux` qui n'existe pas :
- 2026_05_07_202037_create_plan_soins_prestations_table.php.skip
- 2026_05_07_202308_add_plan_soins_to_visite_hads.php.skip
- 2026_05_07_203806_create_cr_fin_had.php.skip

À faire :
1. Créer une migration `create_actes_medicaux` avec les colonnes attendues (id, code_ccam, libelle, durée_standard, ...)
2. Renommer les .skip en .php
3. php artisan migrate

Pour la démo dimanche, le contenu des plans de soins est mocké dans les actes_realises.
