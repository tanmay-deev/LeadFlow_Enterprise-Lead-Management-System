<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user('api');

        if (!$user || !$user->role || !in_array($user->role->name, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: You do not have the required role to access this resource.',
                'errors' => (object)[]
            ], 403);
        }

        return $next($request);
    }
}
