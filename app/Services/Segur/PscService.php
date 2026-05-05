<?php

namespace App\Services\Segur;

use App\Models\User;
use App\Models\PscSession;
use App\Services\Audit\AuditTrailService;
use Exception;

class PscService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    /**
     * Obtenir l'URL d'autorisation PSC
     */
    public function getAuthorizationUrl(string $state): string
    {
        $this->auditService->log(
            'psc_authorization_url_tentee',
            null,
            ['state' => $state],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials PSC');
    }

    /**
     * Gérer le callback d'authentification PSC
     */
    public function handleCallback(string $code, string $state): array
    {
        $this->auditService->log(
            'psc_callback_tentee',
            null,
            ['code_length' => strlen($code), 'state' => $state],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials PSC');
    }

    /**
     * Déconnexion PSC
     */
    public function logout(string $accessToken): void
    {
        $this->auditService->log(
            'psc_logout_tentee',
            null,
            ['token_length' => strlen($accessToken)],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials PSC');
    }

    /**
     * Enregistrer une session PSC
     */
    public function recordSession(User $user, string $jti, string $accessToken, array $claims, int $expiresIn): PscSession
    {
        return PscSession::create([
            'user_id' => $user->id,
            'id_token_jti' => $jti,
            'access_token_hash' => hash('sha256', $accessToken),
            'emis_a' => now(),
            'expire_a' => now()->addSeconds($expiresIn),
            'ip_emission' => request()->ip(),
            'claims' => $claims,
        ]);
    }
}
