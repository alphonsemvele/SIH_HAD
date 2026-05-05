<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrScan extends Model
{
    use HasFactory;

    protected $fillable = [
        'qr_code_id',
        'visite_had_id',
        'intervenant_id',
        'scanned_at',
        'lat',
        'lng',
        'precision_m',
        'statut_scan',
        'motif_refus',
        'device_info',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'lat' => 'decimal:7,4',
        'lng' => 'decimal:7,4',
        'device_info' => 'array',
    ];

    public function qrCode(): BelongsTo
    {
        return $this->belongsTo(QrCode::class);
    }

    public function visiteHad(): BelongsTo
    {
        return $this->belongsTo(VisiteHad::class);
    }

    public function intervenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intervenant_id');
    }
}
