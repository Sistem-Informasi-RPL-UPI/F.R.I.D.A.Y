<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'This action requires administrator privileges.',
                'code' => 'FORBIDDEN',
            ], 403);
        }

        return $next($request);
    }
}
