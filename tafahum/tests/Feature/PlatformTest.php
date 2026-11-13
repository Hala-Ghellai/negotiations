<?php

namespace Tests\Feature;

use App\Models\Diagnostic;
use App\Models\ProgressRead;
use App\Models\Trainee;
use App\Models\TrainingSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformTest extends TestCase
{
    use RefreshDatabase;

    private function sessionPayload(string $id = 's-test-1', array $overrides = []): array
    {
        return array_replace_recursive([
            'id' => $id,
            'scenarioId' => 'budget',
            'scenario' => [
                'title' => ['ar' => 'زيادة الاعتماد', 'en' => 'Budget increase'],
                'custom' => false,
                'maxTurns' => 12,
            ],
            'messages' => [],
            'lang' => 'ar',
            'turns' => 0,
            'userName' => 'Trainee',
            'userStyle' => 'collaborating',
            'coachOn' => true,
            'ended' => true,
            'endReason' => 'agreement',
            'startedAt' => '2026-11-11T10:00:00Z',
            'endedAt' => '2026-11-11T10:12:00Z',
            'flags' => [],
            'evaluation' => ['overall' => 78, 'behavioural' => 80, 'criteria' => []],
            'outcome' => ['type' => 'agreement', 'quality' => 75, 'overall' => 78],
        ], $overrides);
    }

    public function test_all_web_pages_render_successfully(): void
    {
        $paths = ['/', '/diagnostic', '/learn', '/simulate', '/session', '/dashboard', '/report/s-example'];

        foreach ($paths as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_locale_toggle_switches_direction_and_language(): void
    {
        $this->get('/?lang=en')
            ->assertOk()
            ->assertSee('<html lang="en" dir="ltr">', false)
            ->assertSee('Home');

        $this->get('/?lang=ar')
            ->assertOk()
            ->assertSee('<html lang="ar" dir="rtl">', false)
            ->assertSee('الرئيسية');
    }

    public function test_bootstrap_creates_trainee_and_never_writes_null_name(): void
    {
        $this->postJson('/api/bootstrap', [
            'token' => 'tf-test-token',
            'name' => null,
            'lang' => 'ar',
        ])->assertOk()
            ->assertJsonPath('settings.name', '')
            ->assertJsonPath('settings.lang', 'ar')
            ->assertJsonPath('settings.coach', true);

        $this->assertDatabaseHas('trainees', [
            'token' => 'tf-test-token',
            'name' => '',
        ]);
    }

    public function test_bootstrap_persists_and_preserves_coach_setting(): void
    {
        $this->postJson('/api/bootstrap', [
            'token' => 'tf-coach-token',
            'name' => 'Sam',
            'lang' => 'ar',
            'coachOn' => false,
            'onboarded' => true,
        ])->assertOk()
            ->assertJsonPath('settings.coach', false)
            ->assertJsonPath('settings.onboarded', true);

        // A lightweight boot call must not reset the saved preference.
        $this->postJson('/api/bootstrap', [
            'token' => 'tf-coach-token',
            'lang' => 'ar',
        ])->assertOk()
            ->assertJsonPath('settings.name', 'Sam')
            ->assertJsonPath('settings.coach', false)
            ->assertJsonPath('settings.onboarded', true);
    }

    public function test_diagnostic_and_progress_are_returned_by_bootstrap_and_dashboard(): void
    {
        $token = 'tf-data-token';

        $this->postJson('/api/diagnostic', [
            'token' => $token,
            'style' => 'collaborating',
            'scores' => ['collaborating' => 9, 'competing' => 3],
        ])->assertCreated();

        $this->postJson('/api/progress', [
            'token' => $token,
            'unitId' => 'interests',
        ])->assertOk()->assertJsonPath('read', 1);

        $this->postJson('/api/bootstrap', ['token' => $token])
            ->assertOk()
            ->assertJsonPath('diagnostic.style', 'collaborating')
            ->assertJsonPath('progress.0', 'interests');

        $this->getJson('/api/dashboard?token='.$token)
            ->assertOk()
            ->assertJsonPath('diagnostic.style', 'collaborating')
            ->assertJsonPath('progress.0', 'interests');
    }

    public function test_session_can_be_saved_read_listed_and_deleted(): void
    {
        $token = 'tf-session-token';
        $payload = $this->sessionPayload();

        $this->postJson('/api/sessions', [
            'token' => $token,
            'session' => $payload,
        ])->assertCreated()->assertJsonPath('ok', true);

        $this->getJson('/api/sessions/s-test-1')
            ->assertOk()
            ->assertJsonPath('session.id', 's-test-1')
            ->assertJsonPath('session.scenarioId', 'budget');

        $this->getJson('/api/dashboard?token='.$token)
            ->assertOk()
            ->assertJsonPath('sessions.0.id', 's-test-1');

        // Re-posting the same id is an idempotent update, not a duplicate.
        $this->postJson('/api/sessions', [
            'token' => $token,
            'session' => $this->sessionPayload('s-test-1', ['turns' => 4]),
        ])->assertOk()->assertJsonPath('created', false);

        $this->assertSame(1, TrainingSession::count());

        $this->deleteJson('/api/sessions/s-test-1?token='.$token)
            ->assertOk()
            ->assertJsonPath('deleted', true);

        $this->assertDatabaseMissing('training_sessions', ['id' => 's-test-1']);
    }

    public function test_one_trainee_cannot_overwrite_another_trainees_session(): void
    {
        $payload = $this->sessionPayload('s-owned');

        $this->postJson('/api/sessions', [
            'token' => 'tf-owner-a',
            'session' => $payload,
        ])->assertCreated();

        $this->postJson('/api/sessions', [
            'token' => 'tf-owner-b',
            'session' => $payload,
        ])->assertStatus(409)->assertJsonPath('error', 'session_conflict');

        $this->assertDatabaseHas('training_sessions', [
            'id' => 's-owned',
            'trainee_token' => 'tf-owner-a',
        ]);
    }

    public function test_reset_removes_all_trainee_data(): void
    {
        $token = 'tf-reset-token';

        $this->postJson('/api/diagnostic', [
            'token' => $token,
            'style' => 'compromising',
            'scores' => ['compromising' => 7],
        ])->assertCreated();

        $this->postJson('/api/progress', [
            'token' => $token,
            'unitId' => 'batna',
        ])->assertOk();

        $this->postJson('/api/sessions', [
            'token' => $token,
            'session' => $this->sessionPayload('s-reset'),
        ])->assertCreated();

        $this->postJson('/api/reset', ['token' => $token])->assertOk();

        $this->assertSame(0, Diagnostic::where('trainee_token', $token)->count());
        $this->assertSame(0, ProgressRead::where('trainee_token', $token)->count());
        $this->assertSame(0, TrainingSession::where('trainee_token', $token)->count());
        $this->assertDatabaseHas('trainees', ['token' => $token, 'onboarded' => true]);
    }

    public function test_api_validation_errors_are_json(): void
    {
        $this->postJson('/api/bootstrap', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('token');

        $this->postJson('/api/sessions', [
            'token' => 'tf-bad-session',
            'session' => ['id' => 'x'],
        ])->assertStatus(422)
            ->assertJsonValidationErrors([
                'session.scenarioId',
                'session.scenario',
                'session.messages',
                'session.lang',
                'session.turns',
                'session.ended',
            ]);
    }

    public function test_relationships_are_defined(): void
    {
        $trainee = Trainee::create(['token' => 'tf-rel-token', 'name' => 'Rel']);
        Diagnostic::create([
            'trainee_token' => $trainee->token,
            'style' => 'avoiding',
            'scores' => ['avoiding' => 5],
        ]);
        ProgressRead::create([
            'trainee_token' => $trainee->token,
            'unit_id' => 'zopa',
        ]);
        TrainingSession::create([
            'id' => 's-rel',
            'trainee_token' => $trainee->token,
            'scenario_id' => 'budget',
            'scenario' => ['title' => ['ar' => 'x', 'en' => 'x']],
            'messages' => [],
        ]);

        $this->assertCount(1, $trainee->diagnostics);
        $this->assertCount(1, $trainee->readUnits);
        $this->assertCount(1, $trainee->sessions);
        $this->assertSame($trainee->token, $trainee->diagnostics->first()->trainee->token);
    }
}
