<?php

use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — the platform pages (Blade + Tailwind shells; the JS
|--------------------------------------------------------------------------
| The interactive simulation itself runs client-side (rule-based engine),
| while all data lives server-side via the /api routes.
*/

Route::middleware(\App\Http\Middleware\SetLocale::class)->group(function () {
    Route::get('/', [PageController::class, 'pageHome'])->name('home');
    Route::get('/diagnostic', [PageController::class, 'pageDiagnostic'])->name('diagnostic');
    Route::get('/learn', [PageController::class, 'pageLearn'])->name('learn');
    Route::get('/simulate', [PageController::class, 'pageSimulate'])->name('simulate');
    Route::get('/session', [PageController::class, 'pageSession'])->name('session');
    Route::get('/dashboard', [PageController::class, 'pageDashboard'])->name('dashboard');
    Route::get('/report/{id}', [PageController::class, 'report'])->name('report');
});
