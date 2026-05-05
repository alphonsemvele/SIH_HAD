<?php

namespace App\Services\Audit;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Spatie\Activitylog\Models\Activity;

class AuditTrailService
{
    public function log(
        string $action,
        ?Model $subject = null,
        array $properties = [],
        ?string $module = null
    ): Activity {
        $logger = activity()->withProperties($properties);

        if ($user = Auth::user()) {
            $logger->causedBy($user);
        }

        if ($subject !== null) {
            $logger->performedOn($subject);
        }

        /** @var Activity $activity */
        $activity = $logger->log($action);

        $this->updateActivityLogEntry($activity, $module);

        return $activity->fresh();
    }

    protected function updateActivityLogEntry(Activity $activity, ?string $module): void
    {
        $hashChain = $this->chainHash($activity);

        DB::table('activity_log')
            ->where('id', $activity->id)
            ->update([
                'hash_chain'  => $hashChain,
                'module'      => $module,
                'ip_address'  => Request::ip(),
                'http_method' => Request::method(),
                'endpoint'    => Request::path(),
                'http_status' => null,
            ]);
    }

    protected function chainHash(Activity $activity): string
    {
        // Récupérer le hash de l'entrée précédente (strictement avant celle-ci)
        $previousHash = DB::table('activity_log')
            ->where('id', '<', $activity->id)
            ->orderBy('id', 'desc')
            ->value('hash_chain') ?? '';

        // Payload déterministe basé sur l'activité réellement insérée
        $currentPayload = json_encode([
            'id'          => $activity->id,
            'description' => $activity->description,
            'properties'  => $activity->properties?->toArray() ?? [],
            'causer_id'   => $activity->causer_id,
            'subject_id'  => $activity->subject_id,
            'created_at'  => $activity->created_at?->toISOString(),
        ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        return hash('sha256', $previousHash . $currentPayload);
    }
}