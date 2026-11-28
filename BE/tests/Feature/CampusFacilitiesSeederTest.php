<?php

use App\Models\User;
use App\Modules\Facilities\Models\Building;
use App\Modules\Facilities\Models\Room;
use Database\Seeders\CampusFacilitiesSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

it('seeds 3 active buildings and 41 bookable rooms idempotently', function () {
    $this->seed(CampusFacilitiesSeeder::class);
    $this->seed(CampusFacilitiesSeeder::class);

    expect(Building::query()->whereIn('code', ['GD-A', 'GD-B', 'GD-E'])->count())->toBe(3);

    $buildingA = Building::query()->where('code', 'GD-A')->firstOrFail();
    $buildingB = Building::query()->where('code', 'GD-B')->firstOrFail();
    $buildingE = Building::query()->where('code', 'GD-E')->firstOrFail();

    expect($buildingA->rooms()->count())->toBe(4);
    expect($buildingB->rooms()->count())->toBe(25);
    expect($buildingE->rooms()->count())->toBe(12);
    expect(Room::query()->whereIn('building_id', [$buildingA->id, $buildingB->id, $buildingE->id])->count())->toBe(41);
});

it('returns seeded rooms with floorplan metadata and rejects bookings exceeding capacity', function () {
    $this->seed(CampusFacilitiesSeeder::class);
    $student = User::factory()->create(['role' => 'mahasiswa', 'is_active' => true]);

    $response = $this->actingAs($student)
        ->getJson('/api/v1/facilities/rooms?bookable_only=1')
        ->assertOk();

    $rooms = collect($response->json('data'));
    expect($rooms->count())->toBeGreaterThanOrEqual(41);

    $smartclass = $rooms->firstWhere('code', 'B.03.002');
    expect($smartclass)->not->toBeNull();
    expect($smartclass['short_code'])->toBe('B3.002');
    expect($smartclass['room_number'])->toBe(3);
    expect($smartclass['building']['code'])->toBe('GD-B');

    $this->actingAs($student)
        ->postJson('/api/v1/loans/rooms', [
            'room_id' => $smartclass['id'],
            'purpose' => 'Seminar Mahasiswa Terlalu Banyak Peserta',
            'start_at' => '2026-12-02 09:00:00',
            'end_at' => '2026-12-02 11:00:00',
            'attendee_count' => 90,
        ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'CAPACITY_EXCEEDED');

    $this->actingAs($student)
        ->postJson('/api/v1/loans/rooms', [
            'room_id' => $smartclass['id'],
            'purpose' => 'Rapat Proyek Perangkat Lunak',
            'start_at' => '2026-12-02 09:00:00',
            'end_at' => '2026-12-02 11:00:00',
            'attendee_count' => 25,
        ])
        ->assertCreated()
        ->assertJsonPath('data.status', 'pending');
});
