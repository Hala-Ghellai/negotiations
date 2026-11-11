<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgressRead;
use App\Models\Trainee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    /**
     * POST /api/progress — marks a knowledge unit as read.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:40'],
            'unitId' => ['required', 'string', 'max:60'],
        ]);

        $trainee = Trainee::firstOrCreate(['token' => $data['token']]);

        ProgressRead::firstOrCreate([
            'trainee_token' => $trainee->token,
            'unit_id' => $data['unitId'],
        ]);

        $count = ProgressRead::where('trainee_token', $trainee->token)->count();

        return response()->json(['ok' => true, 'read' => $count]);
    }
}
