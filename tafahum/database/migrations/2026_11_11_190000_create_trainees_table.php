<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainees', function (Blueprint $table) {
            $table->string('token', 40)->primary();
            $table->string('name')->default('');
            $table->string('lang', 5)->default('ar');
            $table->boolean('coach_on')->default(true);
            $table->boolean('onboarded')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainees');
    }
};
