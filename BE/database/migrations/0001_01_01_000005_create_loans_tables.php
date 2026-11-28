<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module: Loans
 * Room and item borrowing requests, approvals, and history.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->string('purpose', 255);
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->unsignedSmallInteger('attendee_count')->default(1);
            $table->string('status', 24)->default('pending')->index(); // pending, approved, rejected, cancelled, completed
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['room_id', 'start_at', 'end_at']);
        });

        Schema::create('item_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->string('purpose', 255);
            $table->dateTime('borrowed_at');
            $table->dateTime('due_at');
            $table->dateTime('returned_at')->nullable();
            $table->string('status', 24)->default('pending')->index(); // pending, approved, rejected, borrowed, returned, overdue, cancelled
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['item_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_loans');
        Schema::dropIfExists('room_loans');
    }
};
