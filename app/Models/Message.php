<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'type',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Types de messages possibles
    const TYPE_TEXT = 'text';
    const TYPE_IMAGE = 'image';
    const TYPE_FILE = 'file';

    public static function getTypes(): array
    {
        return [
            self::TYPE_TEXT,
            self::TYPE_IMAGE,
            self::TYPE_FILE,
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Scope pour les messages non lus
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    // Scope pour les messages lus
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    // Scope pour les messages d'un utilisateur
    public function scopeFromUser($query, $userId)
    {
        return $query->where('sender_id', $userId);
    }

    // Scope pour les messages non envoyés par un utilisateur
    public function scopeNotFromUser($query, $userId)
    {
        return $query->where('sender_id', '!=', $userId);
    }

    // Accesseur pour le type formaté
    public function getTypeLibelleAttribute(): string
    {
        return match($this->type) {
            self::TYPE_TEXT => 'Texte',
            self::TYPE_IMAGE => 'Image',
            self::TYPE_FILE => 'Fichier',
            default => 'Inconnu',
        };
    }

    // Accesseur pour l'icône du type
    public function getTypeIconeAttribute(): string
    {
        return match($this->type) {
            self::TYPE_TEXT => 'chat',
            self::TYPE_IMAGE => 'image',
            self::TYPE_FILE => 'attach_file',
            default => 'help',
        };
    }

    // Accesseur pour le contenu formaté
    public function getFormattedContentAttribute(): string
    {
        return match($this->type) {
            self::TYPE_IMAGE => '📷 Image',
            self::TYPE_FILE => '📎 Fichier',
            default => $this->content,
        };
    }

    // Vérifier si le message est lu
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    // Vérifier si le message est envoyé par l'utilisateur actuel
    public function isFromCurrentUser(): bool
    {
        return $this->sender_id === auth()->id();
    }

    // Marquer le message comme lu
    public function markAsRead(): bool
    {
        if ($this->isRead()) {
            return true;
        }

        return $this->update(['read_at' => now()]);
    }

    // Obtenir le temps formaté
    public function getTimeAttribute(): string
    {
        return $this->created_at->format('H:i');
    }

    // Obtenir la date formatée
    public function getDateAttribute(): string
    {
        return $this->created_at->format('d/m/Y');
    }

    // Obtenir le temps relatif
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }
}
