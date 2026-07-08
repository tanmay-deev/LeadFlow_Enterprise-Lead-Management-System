<?php

namespace App\Services\Auth;

use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function login(array $credentials)
    {
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return null;
        }

        return $this->respondWithToken($token);
    }

    public function logout()
    {
        Auth::guard('api')->logout();
    }

    public function getProfile()
    {
        return Auth::guard('api')->user()->load('role.permissions');
    }

    public function updateProfile(array $data)
    {
        $user = Auth::guard('api')->user();
        $user->update($data);
        return $user->fresh()->load('role.permissions');
    }

    public function updatePassword(string $newPassword)
    {
        $user = Auth::guard('api')->user();
        $user->update(['password' => bcrypt($newPassword)]);
        return $user;
    }

    protected function respondWithToken($token)
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => Auth::guard('api')->user()->load('role'),
        ];
    }
}
