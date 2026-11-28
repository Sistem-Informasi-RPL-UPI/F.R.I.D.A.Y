<?php

namespace App\Modules\Facilities\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Facilities\Models\Building;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BuildingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Building::query()->withCount('rooms')->orderBy('code')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:16', 'unique:buildings,code'],
            'name' => ['required', 'string', 'max:120'],
            'floor_count' => ['integer', 'min:1', 'max:30'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $building = Building::query()->create($data);

        return response()->json(['data' => $building], 201);
    }

    public function update(Request $request, Building $building): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:16', 'unique:buildings,code,'.$building->id],
            'name' => ['sometimes', 'string', 'max:120'],
            'floor_count' => ['integer', 'min:1', 'max:30'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $building->update($data);

        return response()->json(['data' => $building]);
    }

    public function destroy(Building $building): Response
    {
        $building->delete();

        return response()->noContent();
    }
}
