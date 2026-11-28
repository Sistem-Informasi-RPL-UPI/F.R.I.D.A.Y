<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module: Facilities
 * Add floor-plan metadata (short_code, room_number) to rooms table.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->string('short_code', 24)->nullable()->after('code');
            $table->unsignedTinyInteger('room_number')->nullable()->after('floor');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->dropColumn(['short_code', 'room_number']);
        });
    }
};
