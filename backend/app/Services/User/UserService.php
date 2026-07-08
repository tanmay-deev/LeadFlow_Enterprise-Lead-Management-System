<?php

namespace App\Services\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function getAllUsers($filters = [], $perPage = 15)
    {
        $query = User::with('role');

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['role_id'])) {
            $query->where('role_id', $filters['role_id']);
        }

        return $query->paginate($perPage);
    }

    public function createUser(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        
        $user = User::create($data);

        return $user->load('role');
    }

    public function getUserById($id)
    {
        return User::with('role')->findOrFail($id);
    }

    public function updateUser($id, array $data)
    {
        $user = User::findOrFail($id);
        
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']); // don't override with null
        }

        $user->update($data);

        return $user->load('role');
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return true;
    }
}
