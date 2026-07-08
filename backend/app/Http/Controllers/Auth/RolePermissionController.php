<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Traits\ApiResponse;

class RolePermissionController extends Controller
{
    use ApiResponse;

    public function roles()
    {
        $roles = Role::with('permissions')->get();
        return $this->successResponse($roles, 'Roles retrieved successfully');
    }

    public function permissions()
    {
        $permissions = Permission::all();
        return $this->successResponse($permissions, 'Permissions retrieved successfully');
    }
}
