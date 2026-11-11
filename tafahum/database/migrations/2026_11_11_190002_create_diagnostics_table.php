<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnostics', function (Blueprint $table) {
            $table->id();
            $table->string('trainee_token', 40)->index();
            $table->string('style', 30);
            $table->json('scores');
            $table->timestamps();

            $table->foreign('trainee_token')->references('token')->on('trainees')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnostics');
    }
};
