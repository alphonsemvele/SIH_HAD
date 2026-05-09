<?php

namespace App\Console\Commands;

use App\Services\Pharmacie\StockLotService;
use App\Services\Audit\AuditTrailService;
use App\Models\User;
use App\Models\Alerte;
use App\Models\AlerteUser;
use Illuminate\Console\Command;
use Carbon\Carbon;

class AlerterPeremption extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pharmacie:alerter-peremption';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Alerte les pharmaciens sur les médicaments expirant bientôt';

    public function __construct(
        private StockLotService $stockLotService,
        private AuditTrailService $auditService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Vérification des péremptions...');

        // Récupérer les pharmaciens
        $pharmaciens = User::where('fonction', 'pharmacien')->get();

        if ($pharmaciens->isEmpty()) {
            $this->warn('Aucun pharmacien trouvé dans le système');
            return 0;
        }

        $alertesCrees = 0;

        // Traiter chaque échéance
        foreach ([60, 30, 7] as $jours) {
            $lotsExpirant = $this->stockLotService->lotsExpirantBientot($jours);
            
            if ($lotsExpirant->isNotEmpty()) {
                $titre = $this->getTitreAlerte($jours);
                $message = $this->getMessageAlerte($jours, $lotsExpirant);
                
                // Créer l'alerte
                $alerte = Alerte::create([
                    'titre' => $titre,
                    'message' => $message,
                    'type' => 'peremption',
                    'priorite' => $this->getPriorite($jours),
                    'user_id' => null, // Alertes système
                ]);

                // Associer l'alerte à tous les pharmaciens
                foreach ($pharmaciens as $pharmacien) {
                    AlerteUser::create([
                        'alerte_id' => $alerte->id,
                        'user_id' => $pharmacien->id,
                        'vue' => false,
                    ]);
                }

                $alertesCrees++;
                $this->info("Alerte créée pour {$lotsExpirant->count()} lots expirant dans {$jours} jours");

                // Audit
                $this->auditService->log(
                    'peremption_alerte_cree',
                    null,
                    [
                        'jours' => $jours,
                        'lots_count' => $lotsExpirant->count(),
                        'alerte_id' => $alerte->id,
                        'pharmaciens_notifies' => $pharmaciens->count(),
                    ],
                    'pharmacie'
                );
            }
        }

        if ($alertesCrees === 0) {
            $this->info('Aucune alerte de péremption nécessaire');
        } else {
            $this->info("{$alertesCrees} alerte(s) de péremption créée(s)");
        }

        return 0;
    }

    private function getTitreAlerte(int $jours): string
    {
        return match($jours) {
            7 => 'URGENT: Péremption dans 7 jours',
            30 => 'ALERTE: Péremption dans 30 jours',
            60 => 'ATTENTION: Péremption dans 60 jours',
            default => "Péremption dans {$jours} jours"
        };
    }

    private function getMessageAlerte(int $jours, $lots): string
    {
        $message = "Les médicaments suivants expireront dans {$jours} jours:\n\n";
        
        foreach ($lots as $lot) {
            $medicament = $lot->medicament;
            $joursRestants = Carbon::now()->diffInDays($lot->date_peremption);
            $message .= "• {$medicament->nom} - Lot: {$lot->numero_lot} - ";
            $message .= "Péremption: {$lot->date_peremption->format('d/m/Y')} ({$joursRestants} jours restants)\n";
        }
        
        $message .= "\nVeuillez vérifier le stock et prendre les mesures nécessaires.";
        
        return $message;
    }

    private function getPriorite(int $jours): string
    {
        return match($jours) {
            7 => 'critique',
            30 => 'haute',
            60 => 'moyenne',
            default => 'basse'
        };
    }
}
