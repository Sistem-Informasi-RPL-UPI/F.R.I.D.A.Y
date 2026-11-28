<?php

namespace App\Modules\Facilities\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Facilities\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Room::query()->with('building')->orderBy('code');

        if ($request->filled('building_id')) {
            $query->where('building_id', $request->integer('building_id'));
        }
        if ($request->boolean('bookable_only')) {
            $query->where('is_bookable', true)->where('is_active', true);
        }
        if ($request->boolean('schedulable_only')) {
            $query->where('is_schedulable', true)->where('is_active', true);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'building_id' => ['required', 'exists:buildings,id'],
            'code' => ['required', 'string', 'max:24', 'unique:rooms,code'],
            'name' => ['required', 'string', 'max:120'],
            'floor' => ['integer', 'min:1', 'max:30'],
            'capacity' => ['integer', 'min:1', 'max:1000'],
            'room_type' => ['string', 'in:kelas,lab,aula,rapat'],
            'facilities' => ['nullable', 'array'],
            'is_bookable' => ['boolean'],
            'is_schedulable' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $room = Room::query()->create($data)->load('building');

        return response()->json(['data' => $room], 201);
    }

    public function update(Request $request, Room $room): JsonResponse
    {
        $data = $request->validate([
            'building_id' => ['sometimes', 'exists:buildings,id'],
            'code' => ['sometimes', 'string', 'max:24', 'unique:rooms,code,'.$room->id],
            'name' => ['sometimes', 'string', 'max:120'],
            'floor' => ['integer', 'min:1', 'max:30'],
            'capacity' => ['integer', 'min:1', 'max:1000'],
            'room_type' => ['string', 'in:kelas,lab,aula,rapat'],
            'facilities' => ['nullable', 'array'],
            'is_bookable' => ['boolean'],
            'is_schedulable' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $room->update($data);

        return response()->json(['data' => $room->load('building')]);
    }

    public function destroy(Room $room): Response
    {
        $room->delete();

        return response()->noContent();
    }
}
