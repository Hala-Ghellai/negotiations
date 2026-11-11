<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    private array $pages = [
        'home' => ['home', 'تفاهم | منصة التدريب على التفاوض وإدارة الحوار', 'Tafahum | Negotiation & Dialogue Training Platform'],
        'diagnostic' => ['diagnostic', 'مقياس الأسلوب | تفاهم', 'Style Assessment | Tafahum'],
        'learn' => ['learn', 'مكتبة المعرفة | تفاهم', 'Knowledge Library | Tafahum'],
        'simulate' => ['simulate', 'مختبر المحاكاة | تفاهم', 'Simulation Lab | Tafahum'],
        'session' => ['session', 'جلسة محاكاة | تفاهم', 'Simulation Session | Tafahum'],
        'dashboard' => ['dashboard', 'لوحة الأداء | تفاهم', 'Performance Dashboard | Tafahum'],
    ];

    public function page(Request $request, string $page = 'home')
    {
        if (! isset($this->pages[$page])) {
            abort(404);
        }

        [$view, $titleAr, $titleEn] = $this->pages[$page];
        $title = app()->getLocale() === 'ar' ? $titleAr : $titleEn;

        return view("pages.$view", [
            'page' => $view,
            'pageTitle' => $title,
        ]);
    }

    public function pageHome(Request $request)
    {
        return $this->page($request, 'home');
    }

    public function pageDiagnostic(Request $request)
    {
        return $this->page($request, 'diagnostic');
    }

    public function pageLearn(Request $request)
    {
        return $this->page($request, 'learn');
    }

    public function pageSimulate(Request $request)
    {
        return $this->page($request, 'simulate');
    }

    public function pageSession(Request $request)
    {
        return $this->page($request, 'session');
    }

    public function pageDashboard(Request $request)
    {
        return $this->page($request, 'dashboard');
    }

    public function report(string $id)
    {
        $title = app()->getLocale() === 'ar'
            ? 'تقرير الجلسة | تفاهم'
            : 'Session Report | Tafahum';

        return view('pages.report', [
            'page' => 'dashboard',
            'pageTitle' => $title,
            'sessionId' => $id,
        ]);
    }
}
