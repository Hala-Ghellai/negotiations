<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingSession extends Model
{
    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'trainee_token', 'trainee_name', 'scenario_id', 'custom', 'lang',
        'user_style', 'coach_on', 'turns', 'end_reason',
        'scenario', 'messages', 'flags', 'evaluation', 'outcome',
        'started_at', 'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'custom' => 'boolean',
            'coach_on' => 'boolean',
            'scenario' => 'array',
            'messages' => 'array',
            'flags' => 'array',
            'evaluation' => 'array',
            'outcome' => 'array',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function trainee()
    {
        return $this->belongsTo(Trainee::class, 'trainee_token', 'token');
    }

    /**
     * The payload shape consumed by the front-end report renderer
     * (mirrors the finalized session object from the simulation engine).
     */
    public function toClientPayload(): array
    {
        return [
            'id' => $this->id,
            'scenarioId' => $this->scenario_id,
            'custom' => $this->custom,
            'scenario' => $this->scenario,
            'lang' => $this->lang,
            'userName' => $this->trainee_name,
            'userStyle' => $this->user_style,
            'coachOn' => $this->coach_on,
            'turns' => $this->turns,
            'maxTurns' => $this->scenario['maxTurns'] ?? 14,
            'phase' => 'closing',
            'startedAt' => optional($this->started_at)->toISOString(),
            'endedAt' => optional($this->ended_at)->toISOString(),
            'messages' => $this->messages ?? [],
            'flags' => $this->flags ?? (object) [],
            'evaluation' => $this->evaluation,
            'outcome' => $this->outcome,
            'ended' => true,
            'endReason' => $this->end_reason,
        ];
    }

    /** Compact row for dashboard lists (camelCase keys — consumed by the JS front end). */
    public function toSummary(): array
    {
        $scenario = $this->scenario ?? [];

        return [
            'id' => $this->id,
            'scenarioId' => $this->scenario_id,
            'title' => $scenario['title'] ?? null,
            'difficulty' => $scenario['difficulty'] ?? null,
            'minutes' => $scenario['minutes'] ?? null,
            'lang' => $this->lang,
            'turns' => $this->turns,
            'endReason' => $this->end_reason,
            'scenario' => ['title' => $scenario['title'] ?? null],
            'overall' => $this->evaluation['overall'] ?? null,
            'behavioural' => $this->evaluation['behavioural'] ?? null,
            'outcome' => $this->outcome ? [
                'type' => $this->outcome['type'] ?? null,
                'quality' => $this->outcome['quality'] ?? null,
                'overall' => $this->outcome['overall']
                    ?? $this->evaluation['overall'] ?? null,
            ] : null,
            'evaluation' => $this->evaluation,
            'startedAt' => optional($this->started_at)->toISOString(),
            'endedAt' => optional($this->ended_at)->toISOString(),
        ];
    }
}
