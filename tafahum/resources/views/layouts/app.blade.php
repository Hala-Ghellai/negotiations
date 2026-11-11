<!DOCTYPE html>
<html lang="{{ $locale }}" dir="{{ $dir }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $pageTitle ?? __('app.doc_title') }}</title>
    <meta name="description" content="{{ $locale === 'ar'
        ? 'تفاهم — منصة تدريبية لموظفي الجهات الحكومية على التفاوض المبدئي وإدارة الحوار، عبر محاكاة تفاعلية وتقييم وفق محكّات واضحة وتقرير PDF إرشادي.'
        : 'Tafahum — a training platform for government employees on principled negotiation and dialogue management, with interactive simulation, criteria-based evaluation and a PDF report.' }}">
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='2' y='2' width='44' height='44' rx='12' fill='%230d5c6b'/%3E%3Cpath d='M12 16h14a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-4l-4 4v-4h-2a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z' fill='%23ffffff'/%3E%3Cpath d='M36 12h-6a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h2l4 4v-4a4 4 0 0 0 4-4v-3a4 4 0 0 0-4-4Z' fill='%23c9a227'/%3E%3C/svg%3E">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=cairo:400,600,700,800" rel="stylesheet">
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite('resources/css/app.css')
    @endif
</head>
<body data-page="{{ $page }}" @isset($sessionId) data-session-id="{{ $sessionId }}" @endisset>

    {{-- ============ header ============ --}}
    <header class="topbar">
        <div class="topbar-inner">
            <a class="brand" href="{{ route('home') }}" aria-label="{{ __('app.brand') }}">
                <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="#0d5c6b"/>
                    <path d="M12 16h14a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-4l-4 4v-4h-2a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z" fill="#ffffff"/>
                    <path d="M36 12h-6a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h2l4 4v-4a4 4 0 0 0 4-4v-3a4 4 0 0 0-4-4Z" fill="#c9a227" transform="translate(0,1)"/>
                </svg>
                <span class="brand-txt">
                    <b>{{ __('app.brand') }}</b>
                    <span>{{ __('app.brand_sub') }}</span>
                </span>
            </a>

            @php $navActive = ($page ?? 'home') === 'session' ? 'simulate' : ($page ?? 'home'); @endphp
            <nav class="nav" aria-label="{{ __('app.main_nav') }}">
                <a class="nav-link {{ $navActive === 'home' ? 'active' : '' }}" data-nav="home" href="{{ route('home') }}"><span>{{ __('app.nav_home') }}</span></a>
                <a class="nav-link {{ $navActive === 'diagnostic' ? 'active' : '' }}" data-nav="diagnostic" href="{{ route('diagnostic') }}"><span>{{ __('app.nav_diagnostic') }}</span></a>
                <a class="nav-link {{ $navActive === 'learn' ? 'active' : '' }}" data-nav="learn" href="{{ route('learn') }}"><span>{{ __('app.nav_learn') }}</span></a>
                <a class="nav-link {{ $navActive === 'simulate' ? 'active' : '' }}" data-nav="simulate" href="{{ route('simulate') }}"><span>{{ __('app.nav_simulate') }}</span></a>
                <a class="nav-link {{ $navActive === 'dashboard' ? 'active' : '' }}" data-nav="dashboard" href="{{ route('dashboard') }}"><span>{{ __('app.nav_dashboard') }}</span></a>
            </nav>

            <div class="top-actions">
                <button class="lang-toggle" onclick="TFApp.toggleLang()" title="Language">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" stroke="currentColor" stroke-width="2"/></svg>
                    <span>{{ __('app.lang_toggle') }}</span>
                </button>
                <button class="icon-btn" onclick="TFApp.openSettings()" aria-label="{{ __('app.settings') }}">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.07a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.07a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.07a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.07a1.7 1.7 0 0 0-1.56 1Z" stroke="currentColor" stroke-width="1.7"/></svg>
                </button>
            </div>
        </div>
    </header>

    {{-- ============ routed views mount here ============ --}}
    <main id="view" aria-live="polite"></main>

    {{-- ============ footer ============ --}}
    <footer class="footer">
        <div class="container">
            <span>{{ __('app.footer_rights') }}</span>
            <span>{{ __('app.footer_note') }} — {{ __('app.footer_stack') }}</span>
        </div>
    </footer>

    <noscript>
        <div style="max-width:700px;margin:60px auto;padding:24px;text-align:center;font-family:sans-serif">
            {{ $locale === 'ar' ? 'تتطلب منصة «تفاهم» تفعيل جافاسكربت في المتصفح — This platform requires JavaScript.' : 'This platform requires JavaScript.' }}
        </div>
    </noscript>

    {{-- ============ app modules (classic scripts, engine runs client-side) ============ --}}
    <script src="{{ asset('assets/js/core.js') }}"></script>
    <script src="{{ asset('assets/js/i18n.js') }}"></script>
    <script src="{{ asset('assets/js/scenarios.js') }}"></script>
    <script src="{{ asset('assets/js/analyzer.js') }}"></script>
    <script src="{{ asset('assets/js/evaluator.js') }}"></script>
    <script src="{{ asset('assets/js/engine.js') }}"></script>
    <script src="{{ asset('assets/js/coach.js') }}"></script>
    <script src="{{ asset('assets/js/diagnostic.js') }}"></script>
    <script src="{{ asset('assets/js/knowledge.js') }}"></script>
    <script src="{{ asset('assets/js/charts.js') }}"></script>
    <script src="{{ asset('assets/js/pdfwriter.js') }}"></script>
    <script src="{{ asset('assets/js/report.js') }}"></script>
    <script src="{{ asset('assets/js/app.js') }}"></script>
</body>
</html>
