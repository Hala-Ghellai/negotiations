@php($mobile = $mobile ?? false)
<a class="nav-link {{ $mobile ? 'w-full' : '' }} {{ $navActive === 'home' ? 'active' : '' }}" data-nav="home" href="{{ route('home') }}"><span>{{ __('app.nav_home') }}</span></a>
<a class="nav-link {{ $mobile ? 'w-full' : '' }} {{ $navActive === 'diagnostic' ? 'active' : '' }}" data-nav="diagnostic" href="{{ route('diagnostic') }}"><span>{{ __('app.nav_diagnostic') }}</span></a>
<a class="nav-link {{ $mobile ? 'w-full' : '' }} {{ $navActive === 'learn' ? 'active' : '' }}" data-nav="learn" href="{{ route('learn') }}"><span>{{ __('app.nav_learn') }}</span></a>
<a class="nav-link {{ $mobile ? 'w-full' : '' }} {{ $navActive === 'simulate' ? 'active' : '' }}" data-nav="simulate" href="{{ route('simulate') }}"><span>{{ __('app.nav_simulate') }}</span></a>
<a class="nav-link {{ $mobile ? 'w-full' : '' }} {{ $navActive === 'dashboard' ? 'active' : '' }}" data-nav="dashboard" href="{{ route('dashboard') }}"><span>{{ __('app.nav_dashboard') }}</span></a>
