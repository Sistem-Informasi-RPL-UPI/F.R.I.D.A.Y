<?php

namespace App\Modules\Identity\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Http\Requests\LoginRequest;
use App\Modules\Identity\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'code' => 'INVALID_CREDENTIALS',
            ], 422);
        }

        $user = Auth::user();
        if (! $user || ! $user->is_active) {
            Auth::logout();

            return response()->json([
                'message' => 'Account is inactive.',
                'code' => 'ACCOUNT_INACTIVE',
            ], 403);
        }

        $request->session()->regenerate();

        return (new UserResource($user))->response();
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function updateProfile(Request $request): UserResource
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:24'],
        ]);

        $user = $request->user();
        $user->update($validated);

        return new UserResource($user);
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
