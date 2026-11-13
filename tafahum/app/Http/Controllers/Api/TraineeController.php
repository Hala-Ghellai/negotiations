<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnostic;
use App\Models\ProgressRead;
use App\Models\Trainee;
use App\Models\TrainingSession;
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

        $trainee = Trainee::firstOrNew(['token' => $data['token']]);

        // Only touch fields that were actually supplied so a lightweight
        // bootstrap call never resets a trainee's saved settings.
        if (array_key_exists('name', $data)) {
            $trainee->name = (string) ($data['name'] ?? '');
        }

        if (array_key_exists('lang', $data)) {
            $trainee->lang = $data['lang'];
        }

        if (array_key_exists('coachOn', $data)) {
            $trainee->coach_on = (bool) $data['coachOn'];
        }

        if (array_key_exists('onboarded', $data)) {
            $trainee->onboarded = (bool) $data['onboarded'];
        }

        $trainee->save();
        // Load database defaults (name/lang/coach_on/onboarded) for new rows.
        $trainee->refresh();

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
