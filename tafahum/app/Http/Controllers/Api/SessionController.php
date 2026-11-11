<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainee;
use App\Models\TrainingSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * POST /api/sessions — stores a finalized simulation session
     * (transcript + evaluation + outcome + full scenario definition).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:40'],
            'session' => ['required', 'array'],
            'session.id' => ['required', 'string', 'max:24'],
            'session.scenarioId' => ['required', 'string', 'max:40'],
            'session.scenario' => ['required', 'array'],
            'session.messages' => ['required', 'array'],
            'session.lang' => ['required', 'string', 'max:5'],
            'session.turns' => ['required', 'integer', 'min:0', 'max:200'],
            'session.userName' => ['sometimes', 'nullable', 'string', 'max:120'],
            'session.userStyle' => ['sometimes', 'nullable', 'string', 'max:30'],
            'session.coachOn' => ['sometimes', 'boolean'],
            'session.ended' => ['required', 'boolean'],
            'session.endReason' => ['sometimes', 'nullable', 'string', 'max:30'],
            'session.startedAt' => ['sometimes', 'nullable', 'date'],
            'session.endedAt' => ['sometimes', 'nullable', 'date'],
            'session.flags' => ['sometimes', 'array'],
            'session.evaluation' => ['sometimes', 'array'],
            'session.outcome' => ['sometimes', 'array'],
        ]);

        $trainee = Trainee::firstOrCreate(['token' => $data['token']]);
        $s = $data['session'];

        $session = TrainingSession::updateOrCreate(
            ['id' => $s['id']],
            [
                'trainee_token' => $trainee->token,
                'trainee_name' => (string) ($s['userName'] ?? ''),
                'scenario_id' => $s['scenarioId'],
                'custom' => (bool) ($s['scenario']['custom'] ?? false),
                'lang' => $s['lang'],
                'user_style' => $s['userStyle'] ?? null,
                'coach_on' => (bool) ($s['coachOn'] ?? true),
                'turns' => $s['turns'],
                'end_reason' => $s['endReason'] ?? null,
                'scenario' => $s['scenario'],
                'messages' => $s['messages'],
                'flags' => $s['flags'] ?? [],
                'evaluation' => $s['evaluation'] ?? [],
                'outcome' => $s['outcome'] ?? [],
                'started_at' => $s['startedAt'] ?? null,
                'ended_at' => $s['endedAt'] ?? null,
            ]
        );

        return response()->json(['ok' => true, 'id' => $session->id], 201);
    }

    /**
     * DELETE /api/sessions/{id}?token=... — removes one session (dashboard delete button).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:40'],
        ]);

        $session = TrainingSession::where('id', $id)
            ->where('trainee_token', $data['token'])
            ->first();

        if ($session) {
            $session->delete();

            return response()->json(['ok' => true, 'deleted' => true]);
        }

        return response()->json(['ok' => true, 'deleted' => false]);
    }

    /**
     * GET /api/sessions/{id} — full session payload for the report renderer.
     */
    public function show(string $id): JsonResponse
    {
        $session = TrainingSession::find($id);

        if (! $session) {
            return response()->json(['ok' => false, 'error' => 'not_found'], 404);
        }

        return response()->json([
            'ok' => true,
            'session' => $session->toClientPayload(),
        ]);
    }
}
