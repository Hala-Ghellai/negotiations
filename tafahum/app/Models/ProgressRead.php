<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressRead extends Model
{
    protected $fillable = ['trainee_token', 'unit_id'];

    public function trainee()
    {
        return $this->belongsTo(Trainee::class, 'trainee_token', 'token');
    }
}
