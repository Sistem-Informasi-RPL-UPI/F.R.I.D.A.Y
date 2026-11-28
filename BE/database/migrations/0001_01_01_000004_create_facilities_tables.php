<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module: Facilities
 * Master data for campus buildings, rooms, and borrowable items.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique();
            $table->string('name', 120);
            $table->unsignedTinyInteger('floor_count')->default(1);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->cascadeOnDelete();
            $table->string('code', 24)->unique();
            $table->string('name', 120);
            $table->unsignedTinyInteger('floor')->default(1);
            $table->unsignedSmallInteger('capacity')->default(30);
            $table->string('room_type', 32)->default('kelas')->index(); // kelas, lab, aula, rapat
            $table->json('facilities')->nullable();
            $table->boolean('is_bookable')->default(true);
            $table->boolean('is_schedulable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['building_id', 'is_schedulable']);
        });

        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('name', 120);
            $table->string('category', 64)->index();
            $table->text('description')->nullable();
            $table->unsignedInteger('total_stock')->default(0);
            $table->unsignedInteger('available_stock')->default(0);
            $table->string('condition', 32)->default('baik'); // baik, rusak_ringan, rusak_berat
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('buildings');
    }
};
