<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progress_reads', function (Blueprint $table) {
            $table->id();
            $table->string('trainee_token', 40)->index();
            $table->string('unit_id', 60);
            $table->timestamps();

            $table->unique(['trainee_token', 'unit_id']);
            $table->foreign('trainee_token')->references('token')->on('trainees')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_reads');
    }
};
