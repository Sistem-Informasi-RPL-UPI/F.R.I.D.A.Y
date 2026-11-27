<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;

uses(DatabaseTransactions::class)->group('database');

it('persists factory records in the isolated MySQL test schema', function (): void {
    expect(DB::connection()->getDriverName())->toBe('mysql');
    expect(DB::connection()->getDatabaseName())->toBe('friday_test');

    $user = User::factory()->create();

    $this->assertModelExists($user);
    $this->assertDatabaseCount('users', 1);
});

it('rolls back a failed database operation', function (): void {
    expect(function (): void {
        DB::transaction(function (): void {
            User::factory()->create();

            throw new RuntimeException('Simulated operation failure.');
        });
    })->toThrow(RuntimeException::class, 'Simulated operation failure.');

    $this->assertDatabaseEmpty('users');
});
