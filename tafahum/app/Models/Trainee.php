<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trainee extends Model
{
    protected $primaryKey = 'token';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['token', 'name', 'lang', 'coach_on', 'onboarded'];

    protected function casts(): array
    {
        return [
            'coach_on' => 'boolean',
            'onboarded' => 'boolean',
        ];
    }

    public function sessions()
    {
        return $this->hasMany(TrainingSession::class, 'trainee_token', 'token');
    }

    public function diagnostics()
    {
        return $this->hasMany(Diagnostic::class, 'trainee_token', 'token');
    }

    public function readUnits()
    {
        return $this->hasMany(ProgressRead::class, 'trainee_token', 'token');
    }
}
