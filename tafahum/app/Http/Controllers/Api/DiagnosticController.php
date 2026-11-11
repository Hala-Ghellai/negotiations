<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnostic;
use App\Models\Trainee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagnosticController extends Controller
{
    /**
     * POST /api/diagnostic — stores the completed style assessment.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:40'],
            'style' => ['required', 'string', 'max:30'],
            'scores' => ['required', 'array', 'min:1'],
            'scores.*' => ['numeric'],
        ]);

        $trainee = Trainee::firstOrCreate(['token' => $data['token']]);

        $diagnostic = Diagnostic::create([
            'trainee_token' => $trainee->token,
            'style' => $data['style'],
            'scores' => $data['scores'],
        ]);

        return response()->json([
            'ok' => true,
            'id' => $diagnostic->id,
            'date' => optional($diagnostic->created_at)->toISOString(),
        ], 201);
    }
}
