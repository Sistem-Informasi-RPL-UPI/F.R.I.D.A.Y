<?php

namespace App\Modules\Notifications\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(30)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function markRead(Request $request, string $id): Response
    {
        $notification = $request->user()
            ->notifications()
            ->whereKey($id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->noContent();
    }

    public function markAllRead(Request $request): Response
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->noContent();
    }
}
