<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiagnosticController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TraineeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — the platform backend
|--------------------------------------------------------------------------
| Trainees are keyed by a browser-generated token (no auth accounts:
| this is a local training tool). All writes are idempotent.
*/

Route::post('/bootstrap', [TraineeController::class, 'bootstrap']);
Route::post('/reset', [TraineeController::class, 'reset']);
Route::post('/diagnostic', [DiagnosticController::class, 'store']);
Route::post('/sessions', [SessionController::class, 'store']);
Route::get('/sessions/{id}', [SessionController::class, 'show']);
Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
Route::post('/progress', [ProgressController::class, 'store']);
Route::get('/dashboard', [DashboardController::class, 'index']);
