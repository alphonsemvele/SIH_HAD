<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function conversations(Request $request)
    {
        $user = $request->user();
        
        $conversations = Conversation::with(['lastMessage', 'participants'])
            ->whereHas('participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('read_at', null)
                      ->where('sender_id', '!=', $user->id);
            }])
            ->orderBy('updated_at', 'desc')
            ->get();

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($conversations);
        }
        
        return Inertia::render('dashboard/messagerie', [
            'conversations' => $conversations,
        ]);
    }

    public function showConversation(Request $request, $conversation = null)
    {
        $user = $request->user();

        // Workaround route model binding bug : récupérer l'ID depuis l'URL
        $conversationId = $conversation;
        if (is_object($conversation)) {
            $conversationId = $conversation->id ?? null;
        }
        if (!$conversationId) {
            // Fallback : extraire depuis URL /conversations/{id}/messages
            $segments = $request->segments();
            $idx = array_search('conversations', $segments);
            if ($idx !== false && isset($segments[$idx + 1])) {
                $conversationId = (int) $segments[$idx + 1];
            }
        }

        $conversation = \App\Models\Conversation::find($conversationId);
        if (!$conversation) {
            return response()->json(['error' => 'Conversation non trouvée'], 404);
        }

        // Vérifier que l'utilisateur participe à cette conversation
        if (!$conversation->participants()->where('conversation_participants.user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        // Marquer les messages comme lus
        $conversation->messages()
            ->where('read_at', null)
            ->where('sender_id', '!=', $user->id)
            ->update(['read_at' => now()]);

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json([
                'conversation' => $conversation,
                'messages' => $messages,
            ]);
        }
        
        return Inertia::render('dashboard/conversation', [
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    public function sendMessage(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required|string|max:1000',
            'type' => 'sometimes|in:text,image,file',
        ]);

        $user = $request->user();
        
        // Vérifier que l'utilisateur participe à cette conversation
        $conversation = Conversation::findOrFail($validated['conversation_id']);
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $message = Message::create([
            'conversation_id' => $validated['conversation_id'],
            'sender_id' => $user->id,
            'content' => $validated['content'],
            'type' => $validated['type'] ?? 'text',
        ]);

        // Mettre à jour le timestamp de la conversation
        $conversation->touch();

        // Charger les relations pour la réponse
        $message->load('sender');

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Message envoyé avec succès',
                'data' => $message
            ], 201);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Message envoyé avec succès.');
    }

    public function createConversation(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'exists:users,id',
            'title' => 'nullable|string|max:255',
            'first_message' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        
        // Créer la conversation
        $conversation = Conversation::create([
            'title' => $validated['title'] ?? null,
            'created_by' => $user->id,
        ]);

        // Ajouter tous les participants (y compris le créateur)
        $participantIds = array_unique(array_merge([$user->id], $validated['participant_ids']));
        $conversation->participants()->attach($participantIds);

        // Envoyer le premier message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $validated['first_message'],
            'type' => 'text',
        ]);

        // Charger les relations pour la réponse
        $conversation->load(['participants', 'lastMessage']);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Conversation créée avec succès',
                'data' => $conversation
            ], 201);
        }
        
        // Pour Web: retourner redirect
        return redirect()->route('conversations.show', $conversation)
            ->with('success', 'Conversation créée avec succès.');
    }

    public function markAsRead(Request $request, Message $message): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur participe à cette conversation
        $conversation = $message->conversation;
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        // Ne pas marquer son propre message comme lu
        if ($message->sender_id === $user->id) {
            return response()->json(['error' => 'Impossible de marquer son propre message comme lu'], 403);
        }

        $message->update(['read_at' => now()]);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Message marqué comme lu'
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Message marqué comme lu.');
    }

    public function markConversationAsRead(Request $request, Conversation $conversation): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur participe à cette conversation
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        // Marquer tous les messages non lus comme lus
        $conversation->messages()
            ->where('read_at', null)
            ->where('sender_id', '!=', $user->id)
            ->update(['read_at' => now()]);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Conversation marquée comme lue'
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Conversation marquée comme lue.');
    }

    public function deleteMessage(Request $request, Message $message): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est l'expéditeur du message
        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $message->delete();

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Message supprimé avec succès'
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Message supprimé avec succès.');
    }

    public function deleteConversation(Request $request, Conversation $conversation): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est le créateur de la conversation
        if ($conversation->created_by !== $user->id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $conversation->delete();

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Conversation supprimée avec succès'
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->route('conversations.index')
            ->with('success', 'Conversation supprimée avec succès.');
    }

    public function getAvailableUsers(Request $request)
    {
        $user = $request->user();
        
        $users = User::where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'specialite')
            ->orderBy('name')
            ->get();

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($users);
        }
        
        return response()->json($users);
    }

    public function getStats(Request $request)
    {
        $user = $request->user();
        
        $stats = [
            'total_conversations' => Conversation::whereHas('participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->count(),
            'unread_messages' => Message::whereHas('conversation.participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->where('read_at', null)
              ->where('sender_id', '!=', $user->id)
              ->count(),
            'total_messages' => Message::whereHas('conversation.participants', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->count(),
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($stats);
        }
        
        return response()->json($stats);
    }


}
