<?php
// ═══════════════════════════════════════════════
// app/Models/ModaliteImagerie.php
// ═══════════════════════════════════════════════
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModaliteImagerie extends Model
{
    protected $fillable = ['code', 'nom', 'description', 'disponible', 'actif'];

    protected $casts = ['disponible' => 'boolean', 'actif' => 'boolean'];

    public function typeExamens(): HasMany
    {
        return $this->hasMany(TypeExamen::class, 'modalite_imagerie_id');
    }

    public function examenImageries(): HasMany
    {
        return $this->hasMany(ExamenImagerie::class, 'modalite_imagerie_id');
    }
}