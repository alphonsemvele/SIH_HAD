<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['joined_at'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scope pour les conversations d'un utilisateur
    public function scopeForUser($query, $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    // Accesseur pour le titre affiché
    public function getDisplayTitleAttribute(): string
    {
        if ($this->title) {
            return $this->title;
        }

        $participants = $this->participants()->where('user_id', '!=', auth()->id())->get();
        
        if ($participants->count() === 1) {
            return $participants->first()->name;
        }

        $names = $participants->take(3)->pluck('name')->implode(', ');
        $remaining = $participants->count() - 3;
        
        return $remaining > 0 ? "$names et $remaining autres" : $names;
    }

    // Accesseur pour le dernier message
    public function getLastMessageContentAttribute(): string
    {
        $lastMessage = $this->lastMessage;
        
        if (!$lastMessage) {
            return 'Aucun message';
        }

        if ($lastMessage->type === 'image') {
            return '📷 Image';
        }

        if ($lastMessage->type === 'file') {
            return '📎 Fichier';
        }

        return $lastMessage->content;
    }

    // Accesseur pour l'heure du dernier message
    public function getLastMessageTimeAttribute(): string
    {
        $lastMessage = $this->lastMessage;
        
        if (!$lastMessage) {
            return '';
        }

        return $lastMessage->created_at->diffForHumans();
    }

    // Vérifier si la conversation est un groupe
    public function isGroup(): bool
    {
        return $this->participants()->count() > 2;
    }

    // Vérifier si l'utilisateur participe à la conversation
    public function hasParticipant($userId): bool
    {
        return $this->participants()->where('user_id', $userId)->exists();
    }

    // Obtenir les autres participants (sauf l'utilisateur actuel)
    public function getOtherParticipants($userId)
    {
        return $this->participants()->where('user_id', '!=', $userId)->get();
    }
}
