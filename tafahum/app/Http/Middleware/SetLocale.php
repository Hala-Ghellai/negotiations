<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets the app locale from ?lang= / session and shares it with all views.
 * The whole UI is Arabic-first (RTL) with English as a toggle.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $lang = $request->query('lang');

        if ($lang === 'en' || $lang === 'ar') {
            session(['locale' => $lang]);
        }

        $locale = session('locale', config('app.locale'));
        if (! in_array($locale, ['ar', 'en'])) {
            $locale = 'ar';
        }

        app()->setLocale($locale);

        view()->share('locale', $locale);
        view()->share('dir', $locale === 'ar' ? 'rtl' : 'ltr');
        view()->share('otherLang', $locale === 'ar' ? 'en' : 'ar');

        return $next($request);
    }
}
