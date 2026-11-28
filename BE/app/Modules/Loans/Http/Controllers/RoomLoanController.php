<?php

namespace App\Modules\Loans\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Facilities\Models\Room;
use App\Modules\Loans\Models\RoomLoan;
use App\Modules\Loans\Notifications\LoanStatusNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomLoanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = RoomLoan::query()->with(['room.building', 'user:id,name,nim_nip'])->latest();

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
            'room_id' => ['required', 'exists:rooms,id'],
            'purpose' => ['required', 'string', 'max:255'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'attendee_count' => ['integer', 'min:1', 'max:1000'],
            'notes' => ['nullable', 'string'],
        ]);

        $room = Room::query()->findOrFail($data['room_id']);
        if (! $room->is_bookable || ! $room->is_active) {
            return response()->json([
                'message' => 'Room is not available for borrowing.',
                'code' => 'ROOM_UNAVAILABLE',
            ], 422);
        }

        if (($data['attendee_count'] ?? 1) > $room->capacity) {
            return response()->json([
                'message' => "Jumlah peserta melebihi kapasitas maksimal ruangan ({$room->capacity} orang).",
                'code' => 'CAPACITY_EXCEEDED',
            ], 422);
        }

        $hasOverlap = RoomLoan::query()
            ->where('room_id', $room->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_at', '<', $data['end_at'])
            ->where('end_at', '>', $data['start_at'])
            ->exists();

        if ($hasOverlap) {
            return response()->json([
                'message' => 'Room already has a conflicting booking in that time range.',
                'code' => 'ROOM_BOOKING_CONFLICT',
            ], 422);
        }

        $loan = RoomLoan::query()->create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ])->load(['room.building']);

        return response()->json(['data' => $loan], 201);
    }

    public function review(Request $request, RoomLoan $roomLoan): JsonResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'rejection_reason' => ['nullable', 'string', 'required_if:decision,rejected'],
        ]);

        if ($roomLoan->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending room loans can be reviewed.',
                'code' => 'INVALID_LOAN_STATE',
            ], 422);
        }

        $roomLoan->update([
            'status' => $data['decision'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $data['decision'] === 'rejected' ? ($data['rejection_reason'] ?? null) : null,
        ]);

        $roomLoan->user->notify(new LoanStatusNotification(
            'room',
            $roomLoan->id,
            $roomLoan->status,
            "Peminjaman ruangan {$roomLoan->room->name} {$roomLoan->status}",
        ));

        return response()->json(['data' => $roomLoan->load(['room.building'])]);
    }

    public function cancel(Request $request, RoomLoan $roomLoan): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && $roomLoan->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.', 'code' => 'FORBIDDEN'], 403);
        }

        if (! in_array($roomLoan->status, ['pending', 'approved'], true)) {
            return response()->json(['message' => 'Loan cannot be cancelled.', 'code' => 'INVALID_LOAN_STATE'], 422);
        }

        $roomLoan->update(['status' => 'cancelled']);

        return response()->json(['data' => $roomLoan]);
    }
}
