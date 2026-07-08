<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $request)
    {
        $data = $this->authService->login($request->validated());

        if (!$data) {
            return $this->errorResponse('Unauthorized', ['email' => ['Invalid credentials']], 401);
        }

        return $this->successResponse($data, 'Login successful');
    }

    public function logout()
    {
        $this->authService->logout();
        return $this->successResponse([], 'Successfully logged out');
    }

    public function profile()
    {
        $user = $this->authService->getProfile();
        return $this->successResponse($user, 'User profile retrieved successfully');
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . auth('api')->id(),
        ]);

        $user = $this->authService->updateProfile($validated);
        return $this->successResponse($user, 'Profile updated successfully');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password:api',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $this->authService->updatePassword($request->password);
        return $this->successResponse([], 'Password updated successfully');
    }
}
