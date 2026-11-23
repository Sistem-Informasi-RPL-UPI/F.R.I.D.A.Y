<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampusDirectoryController extends Controller
{
    /**
     * Daftar gedung beserta konfigurasi denah.
     */
    public function layout(): JsonResponse
    {
        return response()->json([
            'data' => [
                'buildings' => config('campus.buildings'),
                'map' => config('campus.map'),
            ],
        ]);
    }

    /**
     * Daftar ruangan per gedung dan lantai, dengan kunci "{idGedung}-{lantai}".
     * Dapat difilter dengan ?building=abu&floor=2.
     */
    public function rooms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'building' => ['nullable', 'string', 'in:'.collect(config('campus.buildings'))->pluck('id')->implode(',')],
            'floor' => ['nullable', 'integer', 'min:1'],
        ]);

        $rooms = [];

        foreach (config('campus.buildings') as $building) {
            if (isset($validated['building']) && $validated['building'] !== $building['id']) {
                continue;
            }

            foreach (range(1, $building['floors']) as $floor) {
                if (isset($validated['floor']) && (int) $validated['floor'] !== $floor) {
                    continue;
                }

                $rooms["{$building['id']}-{$floor}"] = $this->roomsOnFloor($building, $floor);
            }
        }

        return response()->json(['data' => $rooms]);
    }

    /**
     * @param  array{id: string, name: string, letter: string, floors: int}  $building
     * @return list<array{code: string, name: string, building: string, floor: int, capacity: int, facilities: list<string>, mapArea: string, bookable: bool, floorLayout: string, coreLabel: string, bottomCenter: string}>
     */
    private function roomsOnFloor(array $building, int $floor): array
    {
        $floorKey = "{$building['id']}-{$floor}";
        $customFloor = config("campus.floors.{$floorKey}");

        if (is_array($customFloor) && isset($customFloor['rooms'])) {
            $layout = $customFloor['layout'] ?? 'default';
            $coreLabel = $customFloor['core_label'] ?? 'Tangga';
            $bottomCenter = $customFloor['bottom_center'] ?? '';

            return collect($customFloor['rooms'])
                ->values()
                ->map(fn (array $room, int $index): array => [
                    'code' => $room['code'],
                    'name' => $room['name'],
                    'building' => $building['name'],
                    'floor' => $floor,
                    'capacity' => $room['capacity'],
                    'facilities' => $room['facilities'],
                    'mapArea' => $room['mapArea'] ?? 'area-'.($index + 1),
                    'bookable' => $room['bookable'] ?? true,
                    'floorLayout' => $layout,
                    'coreLabel' => $coreLabel,
                    'bottomCenter' => $bottomCenter,
                ])
                ->all();
        }

        return collect(config('campus.room_templates'))
            ->values()
            ->map(fn (array $template, int $index): array => [
                'code' => sprintf('%s.%02d.%03d', $building['letter'], $floor, $index + 1),
                'name' => $template['name'],
                'building' => $building['name'],
                'floor' => $floor,
                'capacity' => $template['capacity'],
                'facilities' => $template['facilities'],
                'mapArea' => 'area-'.($index + 1),
                'bookable' => true,
                'floorLayout' => 'default',
                'coreLabel' => 'Tangga Akses',
                'bottomCenter' => '',
            ])
            ->all();
    }
}
