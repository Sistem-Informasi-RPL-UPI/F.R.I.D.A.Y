<?php

namespace Tests\Feature;

use Tests\TestCase;

class CampusDirectoryTest extends TestCase
{
    public function test_layout_returns_only_the_three_bookable_buildings(): void
    {
        $response = $this->getJson(route('campus.layout'));

        $response->assertOk()
            ->assertJsonCount(3, 'data.buildings')
            ->assertJsonPath('data.buildings.0.letter', 'A')
            ->assertJsonPath('data.buildings.1.letter', 'B')
            ->assertJsonPath('data.buildings.1.floors', 5)
            ->assertJsonPath('data.buildings.2.letter', 'F')
            ->assertJsonPath('data.buildings.2.floors', 3);
    }

    public function test_gedung_abu_returns_real_floor_rooms(): void
    {
        $response = $this->getJson(route('campus.rooms', ['building' => 'abu']));

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonCount(4, 'data.abu-1')
            ->assertJsonCount(5, 'data.abu-2')
            ->assertJsonCount(4, 'data.abu-3')
            ->assertJsonPath('data.abu-1.0.code', '20.4E.01.004')
            ->assertJsonPath('data.abu-1.3.code', 'CBR 1.420.10.01.079')
            ->assertJsonPath('data.abu-2.0.code', '20.4E.02.006')
            ->assertJsonPath('data.abu-2.4.code', '20.4E.02.007')
            ->assertJsonPath('data.abu-2.4.bookable', false)
            ->assertJsonPath('data.abu-3.3.code', '20.4E.03.000');
    }

    public function test_gedung_baru_returns_all_five_real_floors(): void
    {
        $response = $this->getJson(route('campus.rooms', ['building' => 'baru']));

        $response->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonCount(7, 'data.baru-1')
            ->assertJsonCount(7, 'data.baru-2')
            ->assertJsonCount(7, 'data.baru-3')
            ->assertJsonCount(6, 'data.baru-4')
            ->assertJsonCount(8, 'data.baru-5')
            ->assertJsonPath('data.baru-1.0.bookable', false)
            ->assertJsonPath('data.baru-2.1.code', 'B.02.005')
            ->assertJsonPath('data.baru-3.2.code', 'B.03.002')
            ->assertJsonPath('data.baru-4.3.code', 'B.04.007')
            ->assertJsonPath('data.baru-4.3.bookable', false)
            ->assertJsonPath('data.baru-5.5.code', 'B.05.009');
    }

    public function test_rooms_are_generated_for_template_building_and_floor(): void
    {
        $response = $this->getJson(route('campus.rooms', ['building' => 'biru', 'floor' => 2]));

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonCount(6, 'data.biru-2')
            ->assertJsonPath('data.biru-2.0.code', 'A.02.001')
            ->assertJsonPath('data.biru-2.0.building', 'Gedung Biru');
    }

    public function test_rooms_rejects_unknown_building(): void
    {
        $this->getJson(route('campus.rooms', ['building' => 'gedung-c']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('building');
    }
}
