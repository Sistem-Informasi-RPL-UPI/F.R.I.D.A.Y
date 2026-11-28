<?php

use App\Models\User;
use App\Modules\Facilities\Models\Building;
use App\Modules\Facilities\Models\Item;
use App\Modules\Facilities\Models\Room;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

it('allows admin to create facilities and prevents room loan overlap', function () {
    $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
    $student = User::factory()->create(['role' => 'mahasiswa', 'is_active' => true]);

    $building = Building::query()->create(['code' => 'GD-A', 'name' => 'Gedung A', 'floor_count' => 3]);
    $room = Room::query()->create([
        'building_id' => $building->id,
        'code' => 'A-101',
        'name' => 'Ruang 101',
        'capacity' => 40,
        'room_type' => 'kelas',
    ]);

    $this->actingAs($student)
        ->postJson('/api/v1/loans/rooms', [
            'room_id' => $room->id,
            'purpose' => 'Rapat Himpunan',
            'start_at' => '2026-12-01 09:00:00',
            'end_at' => '2026-12-01 11:00:00',
            'attendee_count' => 25,
        ])
        ->assertCreated();

    $this->actingAs($student)
        ->postJson('/api/v1/loans/rooms', [
            'room_id' => $room->id,
            'purpose' => 'Bentrok',
            'start_at' => '2026-12-01 10:00:00',
            'end_at' => '2026-12-01 12:00:00',
            'attendee_count' => 10,
        ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'ROOM_BOOKING_CONFLICT');

    $item = Item::query()->create([
        'code' => 'PRJ-01',
        'name' => 'Proyektor',
        'category' => 'Elektronik',
        'total_stock' => 5,
        'available_stock' => 5,
    ]);

    $loanId = $this->actingAs($student)
        ->postJson('/api/v1/loans/items', [
            'item_id' => $item->id,
            'quantity' => 2,
            'purpose' => 'Seminar',
            'borrowed_at' => '2026-12-01 08:00:00',
            'due_at' => '2026-12-01 17:00:00',
        ])
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($admin)
        ->postJson("/api/v1/loans/items/{$loanId}/review", ['decision' => 'approved'])
        ->assertOk();

    expect($item->fresh()->available_stock)->toBe(3);

    $this->actingAs($admin)
        ->postJson("/api/v1/loans/items/{$loanId}/return")
        ->assertOk();

    expect($item->fresh()->available_stock)->toBe(5);
});
