<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module: Identity
 * Extends users with role-based access and academic identity fields.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 32)->default('mahasiswa')->after('password')->index();
            $table->string('nim_nip', 32)->nullable()->unique()->after('role');
            $table->string('phone', 24)->nullable()->after('nim_nip');
            $table->boolean('is_active')->default(true)->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['nim_nip']);
            $table->dropIndex(['role']);
            $table->dropColumn(['role', 'nim_nip', 'phone', 'is_active']);
        });
    }
};
