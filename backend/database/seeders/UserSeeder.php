<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        
        if ($superAdminRole) {
            User::firstOrCreate(
                ['email' => 'admin@leadflow.local'],
                [
                    'first_name' => 'Super',
                    'last_name' => 'Admin',
                    'phone' => '1234567890',
                    'password' => Hash::make('password'),
                    'role_id' => $superAdminRole->id,
                    'status' => 'active',
                ]
            );
        }
    }
}
