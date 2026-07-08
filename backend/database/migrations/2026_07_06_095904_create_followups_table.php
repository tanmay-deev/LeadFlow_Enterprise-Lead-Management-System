<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['call', 'email', 'meeting', 'visit', 'whatsapp']);
            $table->dateTime('scheduled_at');
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('reminder_at')->nullable();
            $table->text('outcome')->nullable();
            $table->enum('status', ['pending', 'completed', 'missed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('followups');
    }
};
