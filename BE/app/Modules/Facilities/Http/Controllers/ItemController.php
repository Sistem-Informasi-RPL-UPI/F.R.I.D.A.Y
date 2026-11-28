<?php

namespace App\Modules\Facilities\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Facilities\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Item::query()->orderBy('name');

        if ($request->boolean('available_only')) {
            $query->where('is_active', true)->where('available_stock', '>', 0);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:items,code'],
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', 'max:64'],
            'description' => ['nullable', 'string'],
            'total_stock' => ['required', 'integer', 'min:0'],
            'available_stock' => ['nullable', 'integer', 'min:0'],
            'condition' => ['string', 'in:baik,rusak_ringan,rusak_berat'],
            'is_active' => ['boolean'],
        ]);

        $data['available_stock'] = $data['available_stock'] ?? $data['total_stock'];
        $item = Item::query()->create($data);

        return response()->json(['data' => $item], 201);
    }

    public function update(Request $request, Item $item): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:32', 'unique:items,code,'.$item->id],
            'name' => ['sometimes', 'string', 'max:120'],
            'category' => ['sometimes', 'string', 'max:64'],
            'description' => ['nullable', 'string'],
            'total_stock' => ['sometimes', 'integer', 'min:0'],
            'available_stock' => ['sometimes', 'integer', 'min:0'],
            'condition' => ['string', 'in:baik,rusak_ringan,rusak_berat'],
            'is_active' => ['boolean'],
        ]);

        $item->update($data);

        return response()->json(['data' => $item]);
    }

    public function destroy(Item $item): Response
    {
        $item->delete();

        return response()->noContent();
    }
}
