<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnostic;
use App\Models\ProgressRead;
use App\Models\Trainee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TraineeController extends Controller
{
    /**
     * POST /api/bootstrap
     * Ensures the trainee row exists (keyed by a browser-generated token),
     * persists settings and returns everything the front end needs on boot.
     */
    public function bootstrap(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:40'],
            'name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'lang' => ['sometimes', 'string', 'in:ar,en'],
            'coachOn' => ['sometimes', 'boolean'],
            'onboarded' => ['sometimes', 'boolean'],
        ]);

        $trainee = Trainee::updateOrCreate(
            ['token' => $data['token']],
            collect($data)->only(['name', 'lang', 'coach_on', 'onboarded'])
                ->merge(['token' => $data['token']])
                ->toArray()
        );

        $diagnostic = Diagnostic::where('trainee_token', $trainee->token)
            ->latest()->first();

        $progress = ProgressRead::where('trainee_token', $trainee->token)
            ->pluck('unit_id');

        return response()->json([
            'ok' => true,
            'settings' => [
                'name' => (string) $trainee->name,
                'lang' => $trainee->lang,
                'coach' => (bool) $trainee->coach_on,
                'onboarded' => (bool) $trainee->onboarded,
            ],
            'diagnostic' => $diagnostic ? [
                'style' => $diagnostic->style,
                'scores' => $diagnostic->scores,
                'date' => optional($diagnostic->created_at)->toISOString(),
            ] : null,
            'progress' => $progress->values()->all(),
        ]);
    }

    /**
     * POST /api/reset — wipes everything recorded for this trainee token.
     */
    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:40'],
        ]);

        $token = $data['token'];

        Diagnostic::where('trainee_token', $token)->delete();
        ProgressRead::where('trainee_token', $token)->delete();
        TrainingSession::where('trainee_token', $token)->delete();

        $trainee = Trainee::where('token', $token)->first();
        if ($trainee) {
            $trainee->update(['onboarded' => true]);
        }

        return response()->json(['ok' => true]);
    }
}
