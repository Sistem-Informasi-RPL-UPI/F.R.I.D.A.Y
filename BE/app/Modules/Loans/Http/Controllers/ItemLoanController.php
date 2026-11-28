<?php

namespace App\Modules\Loans\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Facilities\Models\Item;
use App\Modules\Loans\Models\ItemLoan;
use App\Modules\Loans\Notifications\LoanStatusNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemLoanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ItemLoan::query()->with(['item', 'user:id,name,nim_nip'])->latest();

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purpose' => ['required', 'string', 'max:255'],
            'borrowed_at' => ['required', 'date'],
            'due_at' => ['required', 'date', 'after:borrowed_at'],
            'notes' => ['nullable', 'string'],
        ]);

        $item = Item::query()->findOrFail($data['item_id']);
        if (! $item->is_active || $item->available_stock < $data['quantity']) {
            return response()->json([
                'message' => 'Insufficient available stock for this item.',
                'code' => 'INSUFFICIENT_STOCK',
            ], 422);
        }

        $loan = ItemLoan::query()->create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ])->load('item');

        return response()->json(['data' => $loan], 201);
    }

    public function review(Request $request, ItemLoan $itemLoan): JsonResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'rejection_reason' => ['nullable', 'string', 'required_if:decision,rejected'],
        ]);

        if ($itemLoan->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending item loans can be reviewed.',
                'code' => 'INVALID_LOAN_STATE',
            ], 422);
        }

        $result = DB::transaction(function () use ($request, $itemLoan, $data): ?ItemLoan {
            if ($data['decision'] === 'approved') {
                $item = Item::query()->lockForUpdate()->findOrFail($itemLoan->item_id);
                if ($item->available_stock < $itemLoan->quantity) {
                    return null;
                }
                $item->decrement('available_stock', $itemLoan->quantity);
            }

            $itemLoan->update([
                'status' => $data['decision'] === 'approved' ? 'borrowed' : 'rejected',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'rejection_reason' => $data['decision'] === 'rejected' ? ($data['rejection_reason'] ?? null) : null,
            ]);

            return $itemLoan;
        });

        if (! $result) {
            return response()->json([
                'message' => 'Insufficient stock when approving item loan.',
                'code' => 'INSUFFICIENT_STOCK',
            ], 422);
        }

        $itemLoan->user->notify(new LoanStatusNotification(
            'item',
            $itemLoan->id,
            $itemLoan->status,
            "Peminjaman barang {$itemLoan->item->name} {$itemLoan->status}",
        ));

        return response()->json(['data' => $itemLoan->load('item')]);
    }

    public function markReturned(ItemLoan $itemLoan): JsonResponse
    {
        if (! in_array($itemLoan->status, ['borrowed', 'overdue'], true)) {
            return response()->json([
                'message' => 'Only borrowed items can be marked as returned.',
                'code' => 'INVALID_LOAN_STATE',
            ], 422);
        }

        DB::transaction(function () use ($itemLoan): void {
            $item = Item::query()->lockForUpdate()->findOrFail($itemLoan->item_id);
            $item->increment('available_stock', $itemLoan->quantity);

            $itemLoan->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);
        });

        return response()->json(['data' => $itemLoan->load('item')]);
    }
}
