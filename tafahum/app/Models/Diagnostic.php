<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnostic extends Model
{
    protected $fillable = ['trainee_token', 'style', 'scores'];

    protected function casts(): array
    {
        return [
            'scores' => 'array',
        ];
    }

    public function trainee()
    {
        return $this->belongsTo(Trainee::class, 'trainee_token', 'token');
    }
}
