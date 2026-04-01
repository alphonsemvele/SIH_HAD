<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeExamenImagerie extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'code',
        'nom',
        'modalite',
        'description',
        'preparation_patient',
        'duree_minutes',
        'prix',
        'actif',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'prix' => 'decimal:2',
            'actif' => 'boolean',
        ];
    }

    public function examenImageries(): HasMany
    {
        return $this->hasMany(ExamenImagerie::class);
    }
}
