<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnostic;
use App\Models\ProgressRead;
use App\Models\TrainingSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard?token=... — everything the performance dashboard needs.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:40'],
        ]);

        $token = $data['token'];

        $sessions = TrainingSession::where('trainee_token', $token)
            ->orderByDesc('started_at')
            ->limit(100)
            ->get()
            ->map(fn ($s) => $s->toSummary())
            ->values();

        $diagnostic = Diagnostic::where('trainee_token', $token)->latest()->first();

        $progress = ProgressRead::where('trainee_token', $token)->pluck('unit_id')->values();

        return response()->json([
            'ok' => true,
            'sessions' => $sessions,
            'diagnostic' => $diagnostic ? [
                'style' => $diagnostic->style,
                'scores' => $diagnostic->scores,
                'date' => optional($diagnostic->created_at)->toISOString(),
            ] : null,
            'progress' => $progress->all(),
        ]);
    }
}
