<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anomalie extends Model
{
    use HasFactory;

    protected $table = 'pharmacie_anomalies';

    protected $fillable = ['nom', 'categorie', 'description', 'actif'];

    protected function casts(): array
    {
        return ['actif' => 'boolean'];
    }

    public function scopeActif($q)
    {
        return $q->where('actif', true);
    }
    public function prescriptions()
{
    return $this->hasMany(Prescription::class);
}
}