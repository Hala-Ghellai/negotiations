<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->string('id', 24)->primary(); // uid generated client-side
            $table->string('trainee_token', 40)->nullable()->index();
            $table->string('trainee_name')->default('');
            $table->string('scenario_id', 40)->index();
            $table->boolean('custom')->default(false);
            $table->string('lang', 5)->default('ar');
            $table->string('user_style', 30)->nullable();
            $table->boolean('coach_on')->default(true);
            $table->unsignedInteger('turns')->default(0);
            $table->string('end_reason', 30)->nullable();
            $table->json('scenario');          // full scenario definition (supports custom scenarios)
            $table->json('messages');          // full transcript with per-message ratings
            $table->json('flags')->nullable();
            $table->json('evaluation')->nullable();
            $table->json('outcome')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->foreign('trainee_token')->references('token')->on('trainees')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};
